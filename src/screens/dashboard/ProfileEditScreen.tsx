// src/screens/dashboard/ProfileEditScreen.tsx - بسيط ومُبسط تماماً
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

// Preset colors for theming - بدون تكرار
const PRESET_COLORS = [
  '#1976D2', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#607D8B',
  '#795548', '#9E9E9E', '#424242', '#212121', '#000000', '#FFFFFF',
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
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        
        // Set form values
        setValue('full_name', userData.full_name || '');
        setValue('email', userData.email || '');
        setValue('phone', userData.phone || '');
        setValue('job_title', userData.job_title || '');
        setValue('company', userData.company || '');
        setValue('bio', userData.bio || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local user data
      const updatedUser = { ...user, ...updatedData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      Alert.alert('✅ تم الحفظ', 'تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const openColorPicker = (type: 'background' | 'text' | 'button') => {
    setSelectedColorType(type);
    setColorModalVisible(true);
  };

  const updateColor = async (type: 'background' | 'text' | 'button', color: string) => {
    if (!user) return;

    try {
      const colorField = `${type}_color`;
      const { error } = await supabase
        .from('users')
        .update({ [colorField]: color })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user data
      const updatedUser = { ...user, [colorField]: color };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setColorModalVisible(false);
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

  const handleImageUpdate = (newImageUrl: string | null) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        profile_image_url: newImageUrl || undefined 
      };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const getCurrentColor = (type: 'background' | 'text' | 'button'): string => {
    if (!user) return '#2196F3';
    switch (type) {
      case 'background': return user.background_color || '#FFFFFF';
      case 'text': return user.text_color || '#000000';
      case 'button': return user.button_color || '#2196F3';
      default: return '#2196F3';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: paperTheme.colors.background }]}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: paperTheme.colors.background }]}>
        <Text>لم يتم العثور على بيانات المستخدم</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <Card style={[styles.card, shadows.medium]} mode="elevated">
          <Card.Content style={styles.imageSection}>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              الصورة الشخصية
            </Title>
            
            <ProfileImagePicker
              imageUrl={user.profile_image_url}
              userId={user.id}
              onImageUpdate={handleImageUpdate}
              size={120}
              showEditButton={true}
            />
            
            <Text style={[styles.imageHint, { color: paperTheme.colors.onSurfaceVariant }]}>
              اضغط على الصورة لتغييرها أو حذفها
            </Text>
          </Card.Content>
        </Card>

        {/* Personal Information Section */}
        <Card style={[styles.card, shadows.medium]} mode="elevated">
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              المعلومات الشخصية
            </Title>

            {/* Full Name */}
            <Controller
              name="full_name"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="الاسم الكامل *"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.full_name}
                  right={<TextInput.Icon icon="account" />}
                />
              )}
            />
            {errors.full_name && (
              <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                {errors.full_name.message}
              </Text>
            )}

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="البريد الإلكتروني"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  right={<TextInput.Icon icon="email" />}
                />
              )}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                {errors.email.message}
              </Text>
            )}

            {/* Phone */}
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="رقم الهاتف"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  right={<TextInput.Icon icon="phone" />}
                />
              )}
            />

            {/* Job Title */}
            <Controller
              name="job_title"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="المسمى الوظيفي"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  right={<TextInput.Icon icon="briefcase" />}
                />
              )}
            />

            {/* Company */}
            <Controller
              name="company"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="اسم الشركة"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  right={<TextInput.Icon icon="domain" />}
                />
              )}
            />

            {/* Bio */}
            <Controller
              name="bio"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="النبذة الشخصية"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  right={<TextInput.Icon icon="text" />}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Theme Customization Section */}
        <Card style={[styles.card, shadows.medium]} mode="elevated">
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
                  { backgroundColor: getCurrentColor('background') },
                  shadows.small,
                ]}>
                  <Text style={{ color: getCurrentColor('text') }}>
                    معاينة الخلفية
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
                  { backgroundColor: getCurrentColor('background') },
                  shadows.small,
                ]}>
                  <Text style={{ color: getCurrentColor('text') }}>
                    معاينة النص
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
                  { backgroundColor: getCurrentColor('background') },
                  shadows.small,
                ]}>
                  <View style={[
                    styles.buttonPreview,
                    { backgroundColor: getCurrentColor('button') }
                  ]}>
                    <Text style={{ color: '#FFFFFF' }}>
                      معاينة الزر
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
          icon="content-save"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </ScrollView>

      {/* Simple Color Picker Modal */}
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

          {/* Current Color Display */}
          <View style={styles.currentColorSection}>
            <Text style={[styles.currentColorLabel, { color: paperTheme.colors.onSurface }]}>
              اللون الحالي:
            </Text>
            <View
              style={[
                styles.currentColorPreview,
                { backgroundColor: getCurrentColor(selectedColorType) },
                shadows.small,
              ]}
            />
            <Text style={[styles.colorCode, { color: paperTheme.colors.onSurfaceVariant }]}>
              {getCurrentColor(selectedColorType)}
            </Text>
          </View>
          
          {/* Color Grid */}
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color, index) => (
              <TouchableOpacity
                key={`${color}-${index}`}
                onPress={() => updateColor(selectedColorType, color)}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  shadows.small,
                  getCurrentColor(selectedColorType) === color && {
                    borderWidth: 3,
                    borderColor: paperTheme.colors.primary,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setColorModalVisible(false)}
              style={styles.modalButton}
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
    minHeight: 60,
    justifyContent: 'center',
  },
  buttonPreview: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentColorSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentColorLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  currentColorPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  colorCode: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  colorOption: {
    width: (screenWidth * 0.8 - 48 - 35) / 6, // 6 colors per row
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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