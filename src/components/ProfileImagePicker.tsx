// src/components/ProfileImagePicker.tsx - مكون الصورة الشخصية مع التعديل
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Avatar,
  IconButton,
  Menu,
  useTheme,
  Text,
  Portal,
  Modal,
  Button,
  Surface,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { imageUploadService, ImageUploadResult } from '../services/imageUpload';
import { useAppTheme, useShadows } from '../contexts/ThemeContext';

interface ProfileImagePickerProps {
  imageUrl?: string;
  userId: string;
  onImageUpdate: (newImageUrl: string | null) => void;
  size?: number;
  showEditButton?: boolean;
  style?: any;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  imageUrl,
  userId,
  onImageUpdate,
  size = 120,
  showEditButton = true,
  style,
}) => {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const shadows = useShadows();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  // رفع صورة جديدة
  const handleImageUpload = async () => {
    try {
      setMenuVisible(false);
      setUploading(true);

      const result: ImageUploadResult = await imageUploadService.pickEditAndUpload(
        userId,
        {
          resize: { width: 400, height: 400 }, // تحديد حجم مناسب
          compress: 0.8, // ضغط لتقليل حجم الملف
        }
      );

      if (result.success && result.url) {
        onImageUpdate(result.url);
        Alert.alert('نجح', 'تم تحديث الصورة الشخصية بنجاح');
      } else {
        Alert.alert('خطأ', result.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  // حذف الصورة الحالية
  const handleImageDelete = async () => {
    try {
      setConfirmDeleteVisible(false);
      setUploading(true);

      // حذف من Supabase Storage إذا كانت موجودة
      if (imageUrl) {
        const deleteSuccess = await imageUploadService.deleteFromSupabase(imageUrl);
        if (!deleteSuccess) {
          console.warn('Could not delete image from storage');
        }
      }

      // تحديث المكون
      onImageUpdate(null);
      Alert.alert('تم', 'تم حذف الصورة الشخصية');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حذف الصورة');
    } finally {
      setUploading(false);
    }
  };

  // عرض قائمة الخيارات
  const showImageOptions = () => {
    Alert.alert(
      'الصورة الشخصية',
      'ماذا تريد أن تفعل؟',
      [
        {
          text: 'تغيير الصورة',
          onPress: handleImageUpload,
          style: 'default',
        },
        ...(imageUrl ? [{
          text: 'حذف الصورة',
          onPress: () => setConfirmDeleteVisible(true),
          style: 'destructive' as const,
        }] : []),
        {
          text: 'إلغاء',
          style: 'cancel' as const,
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* الصورة الشخصية */}
      <TouchableOpacity
        onPress={showEditButton ? showImageOptions : undefined}
        disabled={uploading}
        style={[
          styles.avatarContainer,
          { width: size, height: size },
          shadows.medium,
        ]}
      >
        {uploading ? (
          <View
            style={[
              styles.avatarContainer,
              styles.loadingContainer,
              {
                width: size,
                height: size,
                backgroundColor: paperTheme.colors.surface,
              },
            ]}
          >
            <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            <Text style={styles.loadingText}>جاري الرفع...</Text>
          </View>
        ) : (
          <>
            {imageUrl ? (
              <Avatar.Image
                size={size}
                source={{ uri: imageUrl }}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: paperTheme.colors.surfaceVariant,
                  },
                ]}
              />
            ) : (
              <Avatar.Icon
                size={size}
                icon="account"
                style={[
                  styles.avatar,
                  {
                    backgroundColor: paperTheme.colors.surfaceVariant,
                  },
                ]}
                color={paperTheme.colors.onSurfaceVariant}
              />
            )}
          </>
        )}

        {/* أيقونة التعديل */}
        {showEditButton && !uploading && (
          <View
            style={[
              styles.editButton,
              {
                backgroundColor: paperTheme.colors.primary,
                borderColor: paperTheme.colors.surface,
              },
              shadows.small,
            ]}
          >
            <MaterialCommunityIcons
              name="camera"
              size={20}
              color={paperTheme.colors.onPrimary}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* نافذة تأكيد الحذف */}
      <Portal>
        <Modal
          visible={confirmDeleteVisible}
          onDismiss={() => setConfirmDeleteVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            {
              backgroundColor: paperTheme.colors.surface,
              margin: 20,
            },
            shadows.large,
          ]}
        >
          <MaterialCommunityIcons
            name="delete-alert"
            size={48}
            color={paperTheme.colors.error}
            style={styles.modalIcon}
          />
          
          <Text style={[styles.modalTitle, { color: paperTheme.colors.onSurface }]}>
            حذف الصورة الشخصية
          </Text>
          
          <Text style={[styles.modalMessage, { color: paperTheme.colors.onSurface }]}>
            هل أنت متأكد من أنك تريد حذف صورتك الشخصية؟ لا يمكن التراجع عن هذا الإجراء.
          </Text>

          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={handleImageDelete}
              buttonColor={paperTheme.colors.error}
              textColor={paperTheme.colors.onError}
              style={styles.modalButton}
            >
              حذف
            </Button>
            <Button
              mode="outlined"
              onPress={() => setConfirmDeleteVisible(false)}
              style={styles.modalButton}
            >
              إلغاء
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    borderRadius: 60,
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
  },
  avatar: {
    borderRadius: 60,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
});

export default ProfileImagePicker;