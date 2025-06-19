// src/screens/dashboard/ProfileEditScreen.tsx - مع ميزة رفع الصور المتكاملة
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  I18nManager,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  TextInput,
  useTheme,
  Text,
  Modal,
  Portal,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../../services/supabase';
import type { User } from '../../types';
import { useAppTheme, useShadows } from '../../contexts/ThemeContext';
import ProfileImagePicker from '../../components/ProfileImagePicker';

// Form validation schema
const profileSchema = z.object({
  full_name: z.string().min(1, 'الاسم الكامل مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const { width: screenWidth } = Dimensions.get('window');

// Preset colors for theming
const PRESET_COLORS = [
  '#1976D2', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#607D8B', '#795548', '#9E9E9E', '#424242', '#212121', '#000000',
];

const ProfileEditScreen: React.FC = () => {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const shadows = useShadows();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<'background' | 'text' | 'button'>('background');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      job_title: '',
      company: '',
      bio: '',
    },
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // تعبئة النموذج
        setValue('full_name', parsedUser.full_name || '');
        setValue('email', parsedUser.email || '');
        setValue('phone', parsedUser.phone || '');
        setValue('job_title', parsedUser.job_title || '');
        setValue('company', parsedUser.company || '');
        setValue('bio', parsedUser.bio || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name || null,
          email: data.email || null,
          phone: data.phone || null,
          job_title: data.job_title || null,
          company: data.company || null,
          bio: data.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات');
        console.error('Error updating profile:', error);
      } else {
        // تحديث البيانات المحلية
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert('نجح', 'تم تحديث الملف الشخصي بنجاح');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  // تحديث الصورة الشخصية
  const handleImageUpdate = async (newImageUrl: string | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          profile_image_url: newImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile image:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الصورة');
      } else {
        // تحديث البيانات المحلية
        const updatedUser = { ...user, profile_image_url: newImageUrl || undefined };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الصورة');
    }
  };

  const updateColor = async (colorType: 'background' | 'text' | 'button', color: string) => {
    if (!user) return;

    try {
      const updateData: any = {};
      updateData[`${colorType}_color`] = color;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating color:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحديث اللون');
      } else {
        // تحديث البيانات المحلية
        const updatedUser = { ...user, ...updateData };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        setColorModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating color:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث اللون');
    }
  };

  const getColorTypeName = (type: 'background' | 'text' | 'button') => {
    switch (type) {
      case 'background': return 'الخلفية';
      case 'text': return 'النص';
      case 'button': return 'الأزرار';
      default: return '';
    }
  };

  const openColorPicker = (type: 'background' | 'text' | 'button') => {
    setSelectedColorType(type);
    setColorModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: paperTheme.colors.background }]}>
        <Text style={{ color: paperTheme.colors.onBackground }}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: paperTheme.colors.background }]}>
        <Text style={{ color: paperTheme.colors.onBackground }}>لم يتم العثور على بيانات المستخدم</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Image Card */}
        <Card style={[styles.card, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              الصورة الشخصية
            </Title>
            
            <View style={styles.imageSection}>
              <ProfileImagePicker
                imageUrl={user.profile_image_url}
                userId={user.id}
                onImageUpdate={handleImageUpdate}
                size={120}
                showEditButton={true}
              />
              <Text style={[styles.imageHint, { color: paperTheme.colors.onSurface }]}>
                اضغط على الصورة لتغييرها أو حذفها
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Personal Information Card */}
        <Card style={[styles.card, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              المعلومات الشخصية
            </Title>
            
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="الاسم الكامل"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.full_name}
                  right={<TextInput.Icon icon="account" />}
                  theme={{
                    colors: {
                      primary: paperTheme.colors.primary,
                      background: paperTheme.colors.background,
                      surface: paperTheme.colors.surface,
                      error: paperTheme.colors.error,
                    },
                  }}
                />
              )}
            />
            {errors.full_name && (
              <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                {errors.full_name.message}
              </Text>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="البريد الإلكتروني"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  error={!!errors.email}
                  right={<TextInput.Icon icon="email" />}
                  theme={{
                    colors: {
                      primary: paperTheme.colors.primary,
                      background: paperTheme.colors.background,
                      surface: paperTheme.colors.surface,
                      error: paperTheme.colors.error,
                    },
                  }}
                />
              )}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                {errors.email.message}
              </Text>
            )}

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="رقم الهاتف"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  right={<TextInput.Icon icon="phone" />}
                  theme={{
                    colors: {
                      primary: paperTheme.colors.primary,
                      background: paperTheme.colors.background,
                      surface: paperTheme.colors.surface,
                    },
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="job_title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="المسمى الوظيفي"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  right={<TextInput.Icon icon="briefcase" />}
                  theme={{
                    colors: {
                      primary: paperTheme.colors.primary,
                      background: paperTheme.colors.background,
                      surface: paperTheme.colors.surface,
                    },
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="اسم الشركة"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  right={<TextInput.Icon icon="office-building" />}
                  theme={{
                    colors: {
                      primary: paperTheme.colors.primary,
                      background: paperTheme.colors.background,
                      surface: paperTheme.colors.surface,
                    },
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="النبذة الشخصية"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  right={<TextInput.Icon icon="text" />}
                  theme={{
                    colors: {
                      primary: paperTheme.colors.primary,
                      background: paperTheme.colors.background,
                      surface: paperTheme.colors.surface,
                    },
                  }}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Theme Customization Card */}
        <Card style={[styles.card, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              تخصيص الألوان
            </Title>
            
            {/* Background Color */}
            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurface }]}>
                لون الخلفية
              </Text>
              <TouchableOpacity onPress={() => openColorPicker('background')}>
                <View style={[
                  styles.colorPreview,
                  { backgroundColor: user.background_color },
                  shadows.small,
                ]}>
                  <Text style={[
                    styles.colorButton,
                    { color: user.text_color }
                  ]}>
                    عينة النص
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Text Color */}
            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurface }]}>
                لون النص
              </Text>
              <TouchableOpacity onPress={() => openColorPicker('text')}>
                <View style={[
                  styles.colorPreview,
                  { backgroundColor: user.background_color },
                  shadows.small,
                ]}>
                  <Text style={[
                    styles.colorButton,
                    { color: user.text_color }
                  ]}>
                    عينة النص
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Button Color */}
            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurface }]}>
                لون الأزرار
              </Text>
              <TouchableOpacity onPress={() => openColorPicker('button')}>
                <View style={[
                  styles.colorPreview,
                  { backgroundColor: user.background_color },
                  shadows.small,
                ]}>
                  <View style={[
                    styles.colorButton,
                    { 
                      backgroundColor: user.button_color,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }
                  ]}>
                    <Text style={{ color: '#FFFFFF' }}>
                      عينة الزر
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={saving}
          disabled={saving}
          style={[styles.saveButton, shadows.medium]}
          buttonColor={paperTheme.colors.primary}
          textColor={paperTheme.colors.onPrimary}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </ScrollView>

      {/* Color Picker Modal */}
      <Portal>
        <Modal
          visible={colorModalVisible}
          onDismiss={() => setColorModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: paperTheme.colors.surface },
            shadows.large,
          ]}
        >
          <Title style={[styles.modalTitle, { color: paperTheme.colors.onSurface }]}>
            اختيار لون {getColorTypeName(selectedColorType)}
          </Title>
          
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => updateColor(selectedColorType, color)}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  shadows.small,
                ]}
              />
            ))}
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setColorModalVisible(false)}
              style={styles.modalButton}
              textColor={paperTheme.colors.onSurface}
            >
              إلغاء
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  imageHint: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  colorSection: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  colorPreview: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  colorButton: {
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 4,
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: (screenWidth * 0.9 - 48 - 44) / 4, // 4 colors per row with gaps
    height: 50,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
});

export default ProfileEditScreen;