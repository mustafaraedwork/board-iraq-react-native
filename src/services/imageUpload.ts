// src/services/imageUpload.ts - خدمة رفع وإدارة الصور
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { supabase } from './supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  localUri?: string;
  error?: string;
}

export interface ImageEditOptions {
  resize?: { width: number; height: number };
  compress?: number; // 0.0 to 1.0
  format?: ImageManipulator.SaveFormat;
  crop?: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
}

class ImageUploadService {
  // طلب الصلاحيات
  async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
        Alert.alert(
          'نحتاج للصلاحيات',
          'نحتاج إلى صلاحية الوصول للكاميرا ومكتبة الصور لرفع الصورة الشخصية.',
          [{ text: 'حسناً' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // عرض خيارات اختيار الصورة
  async showImagePickerOptions(): Promise<ImagePicker.ImagePickerResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'اختيار الصورة الشخصية',
        'كيف تريد اختيار صورتك الشخصية؟',
        [
          {
            text: 'الكاميرا',
            onPress: async () => {
              const result = await this.pickImageFromCamera();
              resolve(result);
            },
          },
          {
            text: 'المعرض',
            onPress: async () => {
              const result = await this.pickImageFromGallery();
              resolve(result);
            },
          },
          {
            text: 'إلغاء',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  }

  // التقاط صورة من الكاميرا
  async pickImageFromCamera(): Promise<ImagePicker.ImagePickerResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { canceled: true, assets: null };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // صورة مربعة
        quality: 0.8,
        base64: false,
      });

      return result;
    } catch (error) {
      console.error('Error picking image from camera:', error);
      return { canceled: true, assets: null };
    }
  }

  // اختيار صورة من المعرض
  async pickImageFromGallery(): Promise<ImagePicker.ImagePickerResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { canceled: true, assets: null };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // صورة مربعة
        quality: 0.8,
        base64: false,
      });

      return result;
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      return { canceled: true, assets: null };
    }
  }

  // تعديل الصورة (قص، تغيير حجم، ضغط)
  async editImage(
    uri: string, 
    options: ImageEditOptions = {}
  ): Promise<ImageManipulator.ImageResult | null> {
    try {
      const actions: ImageManipulator.Action[] = [];

      // إضافة عملية القص إذا كانت محددة
      if (options.crop) {
        actions.push({
          crop: options.crop,
        });
      }

      // إضافة عملية تغيير الحجم إذا كانت محددة
      if (options.resize) {
        actions.push({
          resize: options.resize,
        });
      }

      // تطبيق التعديلات
      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        {
          compress: options.compress || 0.8,
          format: options.format || ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result;
    } catch (error) {
      console.error('Error editing image:', error);
      return null;
    }
  }

  // رفع الصورة إلى Supabase Storage
  async uploadToSupabase(
    uri: string, 
    userId: string, 
    filename?: string
  ): Promise<ImageUploadResult> {
    try {
      // فحص نوع الملف
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          success: false,
          error: 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, WEBP أو GIF',
        };
      }

      // فحص حجم الملف (5MB كحد أقصى)
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (fileInfo.exists && 'size' in fileInfo && fileInfo.size && fileInfo.size > maxSize) {
        return {
          success: false,
          error: 'حجم الملف كبير جداً. الحد الأقصى هو 5MB',
        };
      }

      // إنشاء اسم ملف فريد
      const finalFilename = filename || `profile_${userId}_${Date.now()}.${fileExtension}`;
      const filePath = `profiles/${finalFilename}`;

      // قراءة الملف كـ base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // تحويل base64 إلى ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, byteArray, {
          contentType: `image/${fileExtension}`,
          upsert: true, // إذا كان الملف موجود، استبدله
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return {
          success: false,
          error: 'فشل في رفع الصورة إلى الخادم',
        };
      }

      // الحصول على الرابط العام للصورة
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        localUri: uri,
      };
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء رفع الصورة',
      };
    }
  }

  // حذف صورة من Supabase Storage
  async deleteFromSupabase(imageUrl: string): Promise<boolean> {
    try {
      // استخراج مسار الملف من الرابط
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `profiles/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
      return false;
    }
  }

  // العملية المتكاملة: اختيار + تعديل + رفع
  async pickEditAndUpload(
    userId: string,
    editOptions?: ImageEditOptions
  ): Promise<ImageUploadResult> {
    try {
      // اختيار الصورة
      const pickerResult = await this.showImagePickerOptions();
      
      if (!pickerResult || pickerResult.canceled || !pickerResult.assets?.[0]) {
        return {
          success: false,
          error: 'لم يتم اختيار صورة',
        };
      }

      const selectedImage = pickerResult.assets[0];
      let finalUri = selectedImage.uri;

      // تعديل الصورة إذا كانت هناك خيارات
      if (editOptions) {
        const editResult = await this.editImage(finalUri, editOptions);
        if (editResult) {
          finalUri = editResult.uri;
        }
      }

      // رفع الصورة
      const uploadResult = await this.uploadToSupabase(finalUri, userId);
      
      return uploadResult;
    } catch (error) {
      console.error('Error in pick, edit and upload:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء معالجة الصورة',
      };
    }
  }
}

// إنشاء instance واحد لاستخدامه في التطبيق
export const imageUploadService = new ImageUploadService();
export default imageUploadService;