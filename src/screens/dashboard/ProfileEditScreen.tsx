// src/screens/dashboard/ProfileEditScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  I18nManager,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  useTheme,
  Surface,
  Text,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { supabase } from '../../services/supabase';
import type { User } from '../../types';

// Form validation schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(500, 'النبذة يجب أن تكون أقل من 500 حرف').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Predefined color options
const colorOptions = [
  { name: 'الأزرق الكلاسيكي', value: '#2196F3' },
  { name: 'الأخضر الطبيعي', value: '#4CAF50' },
  { name: 'البرتقالي النابض', value: '#FF9800' },
  { name: 'البنفسجي الملكي', value: '#9C27B0' },
  { name: 'الأحمر الجريء', value: '#F44336' },
  { name: 'الفيروزي الهادئ', value: '#009688' },
  { name: 'الوردي الناعم', value: '#E91E63' },
  { name: 'الرمادي الأنيق', value: '#607D8B' },
];

const ProfileEditScreen: React.FC = () => {
  const theme = useTheme();
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
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Set form values
        setValue('full_name', parsedUser.full_name || '');
        setValue('email', parsedUser.email || '');
        setValue('phone', parsedUser.phone || '');
        setValue('job_title', parsedUser.job_title || '');
        setValue('company', parsedUser.company || '');
        setValue('bio', parsedUser.bio || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local storage
      const updatedUser = { ...user, ...updateData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      Alert.alert('نجح الحفظ', 'تم تحديث معلوماتك بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const updateColor = async (colorType: 'background' | 'text' | 'button', color: string) => {
    if (!user) return;

    try {
      const updateField = `${colorType}_color`;
      const { error } = await supabase
        .from('users')
        .update({ [updateField]: color })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedUser = { ...user, [updateField]: color };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setColorModalVisible(false);
      Alert.alert('تم التحديث', `تم تحديث لون ${getColorTypeName(colorType)} بنجاح`);
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
      <View style={[styles.container, styles.centered]}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>لم يتم العثور على بيانات المستخدم</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Personal Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>المعلومات الشخصية</Title>
            
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
                />
              )}
            />
            {errors.full_name && (
              <Text style={styles.errorText}>{errors.full_name.message}</Text>
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
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
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
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Professional Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>المعلومات المهنية</Title>
            
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
                  numberOfLines={4}
                  placeholder="اكتب نبذة مختصرة عن نفسك..."
                  right={<TextInput.Icon icon="text" />}
                />
              )}
            />
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio.message}</Text>
            )}
          </Card.Content>
        </Card>

        {/* Color Customization Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>تخصيص الألوان</Title>
            
            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>لون الخلفية</Text>
              <Surface
                style={[
                  styles.colorPreview,
                  { backgroundColor: user.background_color || theme.colors.primary }
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => openColorPicker('background')}
                  buttonColor={user.background_color || theme.colors.primary}
                  textColor="#ffffff"
                >
                  اختيار اللون
                </Button>
              </Surface>
            </View>

            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>لون النص</Text>
              <Surface
                style={[
                  styles.colorPreview,
                  { backgroundColor: user.text_color || '#333333' }
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => openColorPicker('text')}
                  buttonColor={user.text_color || '#333333'}
                  textColor="#ffffff"
                >
                  اختيار اللون
                </Button>
              </Surface>
            </View>

            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>لون الأزرار</Text>
              <Surface
                style={[
                  styles.colorPreview,
                  { backgroundColor: user.button_color || theme.colors.secondary }
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => openColorPicker('button')}
                  buttonColor={user.button_color || theme.colors.secondary}
                  textColor="#ffffff"
                >
                  اختيار اللون
                </Button>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          icon="content-save"
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
            styles.modalContainer,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Title style={styles.modalTitle}>
            اختيار {getColorTypeName(selectedColorType)}
          </Title>
          
          <View style={styles.colorGrid}>
            {colorOptions.map((color, index) => (
              <Surface
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.value }
                ]}
              >
                <Button
                  mode="text"
                  onPress={() => updateColor(selectedColorType, color.value)}
                  style={styles.colorButton}
                  labelStyle={{ color: '#ffffff', fontSize: 10 }}
                >
                  {color.name}
                </Button>
              </Surface>
            ))}
          </View>

          <Button
            mode="outlined"
            onPress={() => setColorModalVisible(false)}
            style={styles.modalCloseButton}
          >
            إلغاء
          </Button>
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
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  colorSection: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  colorPreview: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: '48%',
    height: 60,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  colorButton: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCloseButton: {
    marginTop: 10,
  },
});

export default ProfileEditScreen;