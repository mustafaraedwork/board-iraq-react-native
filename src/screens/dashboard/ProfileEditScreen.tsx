// src/screens/dashboard/ProfileEditScreen.tsx - مُصحح تماماً
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  TextInput,
  Text,
  Surface,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';
import { User } from '../../types';
import { useAppTheme, useShadows } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// تخطيط التحقق من صحة البيانات
const profileSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(500, 'النبذة الشخصية يجب أن تكون أقل من 500 حرف').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ألوان محددة مسبقاً
const PRESET_COLORS = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#F44336', // Red
  '#607D8B', // Blue Grey
  '#795548', // Brown
  '#E91E63', // Pink
  '#009688', // Teal
  '#3F51B5', // Indigo
  '#8BC34A', // Light Green
  '#FFC107', // Amber
  '#673AB7', // Deep Purple
  '#00BCD4', // Cyan
  '#CDDC39', // Lime
  '#FF5722', // Deep Orange
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
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        
        // تعبئة النموذج بالبيانات الحالية
        reset({
          full_name: parsedUser.full_name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          job_title: parsedUser.job_title || '',
          company: parsedUser.company || '',
          bio: parsedUser.bio || '',
        });
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
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
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
          </Card.Content>
        </Card>

        {/* Professional Information Card */}
        <Card style={[styles.card, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              المعلومات المهنية
            </Title>
            
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
                  numberOfLines={4}
                  placeholder="اكتب نبذة مختصرة عن نفسك..."
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
            {errors.bio && (
              <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                {errors.bio.message}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Color Customization Card */}
        <Card style={[styles.card, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              تخصيص الألوان
            </Title>
            
            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                لون الخلفية
              </Text>
              <Surface
                style={[
                  styles.colorPreview,
                  { backgroundColor: user.background_color || paperTheme.colors.primary },
                  shadows.small,
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => openColorPicker('background')}
                  buttonColor={user.background_color || paperTheme.colors.primary}
                  textColor="#ffffff"
                  style={styles.colorButton}
                  compact
                >
                  اختيار اللون
                </Button>
              </Surface>
            </View>

            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                لون النص
              </Text>
              <Surface
                style={[
                  styles.colorPreview,
                  { backgroundColor: user.text_color || '#333333' },
                  shadows.small,
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => openColorPicker('text')}
                  buttonColor={user.text_color || '#333333'}
                  textColor="#ffffff"
                  style={styles.colorButton}
                  compact
                >
                  اختيار اللون
                </Button>
              </Surface>
            </View>

            <View style={styles.colorSection}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                لون الأزرار
              </Text>
              <Surface
                style={[
                  styles.colorPreview,
                  { backgroundColor: user.button_color || paperTheme.colors.secondary },
                  shadows.small,
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => openColorPicker('button')}
                  buttonColor={user.button_color || paperTheme.colors.secondary}
                  textColor="#ffffff"
                  style={styles.colorButton}
                  compact
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
          style={[styles.saveButton, shadows.medium]}
          icon="content-save"
          buttonColor={paperTheme.colors.primary}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </ScrollView>

      {/* Color Picker Modal - مُصحح */}
      <Modal
        visible={colorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: paperTheme.colors.surface }, shadows.large]}>
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
          </View>
        </View>
      </Modal>
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
  },
  colorSection: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    margin: 20,
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