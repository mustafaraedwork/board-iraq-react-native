// src/screens/dashboard/LinksManagerScreen.tsx - النسخة المُصلحة نهائياً
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  I18nManager,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  List,
  IconButton,
  useTheme,
  Text,
  Portal,
  Modal,
  TextInput,
  Chip,
  Surface,
  FAB,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { supabase } from '../../services/supabase';
import type { User, UserLink } from '../../types';

// Form validation schema
const linkSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  url: z.string().url('الرابط غير صحيح'),
  icon: z.string().min(1, 'الأيقونة مطلوبة'),
});

type LinkFormData = z.infer<typeof linkSchema>;

// Predefined link types with icons
const linkTypes = [
  { title: 'الموقع الشخصي', icon: 'web', placeholder: 'https://mywebsite.com' },
  { title: 'فيسبوك', icon: 'facebook', placeholder: 'https://facebook.com/username' },
  { title: 'إنستغرام', icon: 'instagram', placeholder: 'https://instagram.com/username' },
  { title: 'تويتر X', icon: 'twitter', placeholder: 'https://x.com/username' },
  { title: 'لينكد إن', icon: 'linkedin', placeholder: 'https://linkedin.com/in/username' },
  { title: 'يوتيوب', icon: 'youtube', placeholder: 'https://youtube.com/@username' },
  { title: 'واتساب', icon: 'whatsapp', placeholder: 'https://wa.me/9647845663136' },
  { title: 'تيليجرام', icon: 'telegram', placeholder: 'https://t.me/username' },
  { title: 'سناب شات', icon: 'snapchat', placeholder: 'https://snapchat.com/add/username' },
  { title: 'تيك توك', icon: 'music-note', placeholder: 'https://tiktok.com/@username' },
  { title: 'البريد الإلكتروني', icon: 'email', placeholder: 'mailto:email@example.com' },
  { title: 'رقم الهاتف', icon: 'phone', placeholder: 'tel:+9647845663136' },
  { title: 'رابط مخصص', icon: 'link', placeholder: 'https://example.com' },
];

const LinksManagerScreen: React.FC = () => {
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<UserLink | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);

        // التأكد من وجود userId قبل الاستخدام
        if (parsedUser?.id) {
          await loadUserLinks(parsedUser.id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // دالة منفصلة لتحميل الروابط مع التحقق من النوع
  const loadUserLinks = async (userId: string) => {
    try {
      const { data: userLinks, error } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching links:', error);
      } else {
        setLinks(userLinks || []);
      }
    } catch (error) {
      console.error('Error loading user links:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingLink(null);
    reset({
      title: '',
      url: '',
      icon: 'link',
    });
    setModalVisible(true);
  };

  const openEditModal = (link: UserLink) => {
    setEditingLink(link);
    setValue('title', link.title);
    setValue('url', link.url);
    setValue('icon', link.icon || 'link');
    setModalVisible(true);
  };

  const onSubmit = async (data: LinkFormData) => {
    if (!user?.id) {
      Alert.alert('خطأ', 'لم يتم العثور على معرف المستخدم');
      return;
    }

    setSaving(true);
    try {
      if (editingLink) {
        // Update existing link
        const { error } = await supabase
          .from('user_links')
          .update({
            title: data.title,
            url: data.url,
            icon: data.icon,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLink.id);

        if (error) throw error;
      } else {
        // Add new link
        const { error } = await supabase
          .from('user_links')
          .insert({
            user_id: user.id,
            title: data.title,
            url: data.url,
            icon: data.icon,
            sort_order: links.length,
            is_active: true,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      await loadData();
      setModalVisible(false);
      Alert.alert('نجح الحفظ', editingLink ? 'تم تحديث الرابط بنجاح' : 'تم إضافة الرابط بنجاح');
    } catch (error) {
      console.error('Error saving link:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الرابط');
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = (link: UserLink) => {
    Alert.alert(
      'حذف الرابط',
      `هل أنت متأكد من حذف "${link.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_links')
                .delete()
                .eq('id', link.id);

              if (error) throw error;

              await loadData();
              Alert.alert('تم الحذف', 'تم حذف الرابط بنجاح');
            } catch (error) {
              console.error('Error deleting link:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف الرابط');
            }
          },
        },
      ]
    );
  };

  const toggleLinkStatus = async (link: UserLink) => {
    try {
      const { error } = await supabase
        .from('user_links')
        .update({
          is_active: !link.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', link.id);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error toggling link status:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة الرابط');
    }
  };

  const selectLinkType = (linkType: typeof linkTypes[0]) => {
    setValue('title', linkType.title);
    setValue('icon', linkType.icon);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Links List */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                الروابط الحالية ({links.length})
              </Title>
              
              {links.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="link-off"
                    size={64}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={styles.emptyText}>لا توجد روابط بعد</Text>
                  <Text style={styles.emptySubtext}>
                    اضغط على زر + لإضافة أول رابط
                  </Text>
                </View>
              ) : (
                links.map((link) => (
                  <Surface key={link.id} style={styles.linkItem}>
                    <List.Item
                      title={link.title}
                      description={link.url}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={link.icon || 'link'}
                          color={link.is_active ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        />
                      )}
                      right={() => (
                        <View style={styles.linkActions}>
                          <Chip
                            mode="outlined"
                            compact
                            style={[
                              styles.statusChip,
                              link.is_active ? styles.activeChip : styles.inactiveChip,
                            ]}
                            onPress={() => toggleLinkStatus(link)}
                          >
                            {link.is_active ? 'نشط' : 'معطل'}
                          </Chip>
                          <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => openEditModal(link)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor={theme.colors.error}
                            onPress={() => deleteLink(link)}
                          />
                        </View>
                      )}
                      style={[
                        styles.listItem,
                        !link.is_active && styles.inactiveListItem,
                      ]}
                    />
                  </Surface>
                ))
              )}
            </Card.Content>
          </Card>

          {/* Link Statistics */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>إحصائيات الروابط</Title>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{links.filter(l => l.is_active).length}</Text>
                  <Text style={styles.statLabel}>رابط نشط</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {links.reduce((sum, link) => sum + (link.click_count || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>إجمالي النقرات</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{links.length}</Text>
                  <Text style={styles.statLabel}>إجمالي الروابط</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
          label="إضافة رابط"
        />
      </View>

      {/* Add/Edit Link Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>
              {editingLink ? 'تعديل الرابط' : 'إضافة رابط جديد'}
            </Title>

            {/* Link Type Selection */}
            {!editingLink && (
              <View style={styles.linkTypesContainer}>
                <Text style={styles.linkTypesTitle}>اختر نوع الرابط:</Text>
                <View style={styles.linkTypesGrid}>
                  {linkTypes.map((type, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      icon={type.icon}
                      onPress={() => selectLinkType(type)}
                      style={styles.linkTypeChip}
                    >
                      {type.title}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {/* Form Fields */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="عنوان الرابط"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.title}
                  right={<TextInput.Icon icon="format-title" />}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}

            <Controller
              control={control}
              name="url"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="الرابط"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.url}
                  placeholder="https://example.com"
                  keyboardType="url"
                  autoCapitalize="none"
                  right={<TextInput.Icon icon="link" />}
                />
              )}
            />
            {errors.url && (
              <Text style={styles.errorText}>{errors.url.message}</Text>
            )}

            <Controller
              control={control}
              name="icon"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="اسم الأيقونة"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  placeholder="link"
                  right={<TextInput.Icon icon={value || 'link'} />}
                />
              )}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={saving}
                disabled={saving}
                style={styles.modalButton}
              >
                {saving ? 'جاري الحفظ...' : (editingLink ? 'تحديث' : 'إضافة')}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                إلغاء
              </Button>
            </View>
          </ScrollView>
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
    paddingBottom: 100, // Space for FAB
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  linkItem: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  listItem: {
    paddingVertical: 8,
  },
  inactiveListItem: {
    opacity: 0.6,
  },
  linkActions: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: I18nManager.isRTL ? 0 : 8,
    marginLeft: I18nManager.isRTL ? 8 : 0,
  },
  activeChip: {
    backgroundColor: '#e8f5e8',
  },
  inactiveChip: {
    backgroundColor: '#ffebee',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: I18nManager.isRTL ? undefined : 0,
    left: I18nManager.isRTL ? 0 : undefined,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 5,
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  linkTypesContainer: {
    marginBottom: 20,
  },
  linkTypesTitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  linkTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkTypeChip: {
    marginBottom: 8,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default LinksManagerScreen;