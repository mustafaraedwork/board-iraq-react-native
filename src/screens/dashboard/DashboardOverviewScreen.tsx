// src/screens/dashboard/DashboardOverviewScreen.tsx - مع عرض الصورة الشخصية
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Linking,
  I18nManager,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
  Surface,
  Text,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { supabase } from '../../services/supabase';
import { User } from '../../types';
import { useAppTheme, useShadows } from '../../contexts/ThemeContext';

const DashboardOverviewScreen: React.FC = () => {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const shadows = useShadows();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ألوان مخصصة للحالات
  const customColors = {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // جلب البيانات المحدثة من قاعدة البيانات
        const { data: updatedUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (error) {
          console.error('Error fetching updated user data:', error);
        } else if (updatedUser) {
          setUser(updatedUser);
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'isAuthenticated']);
      // سيتم إعادة التوجيه تلقائياً بواسطة AppNavigator
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleViewProfile = () => {
    const profileUrl = `${process.env.EXPO_PUBLIC_WEBSITE_URL}/${user?.username}`;
    Linking.openURL(profileUrl);
  };

  const handleShareProfile = () => {
    const profileUrl = `${process.env.EXPO_PUBLIC_WEBSITE_URL}/${user?.username}`;
    Alert.alert(
      'مشاركة الملف الشخصي',
      `رابط ملفك الشخصي:\n${profileUrl}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'نسخ الرابط', 
          onPress: () => {
            // سيتم إضافة مكتبة Clipboard لاحقاً
            Alert.alert('تم نسخ الرابط', 'تم نسخ رابط ملفك الشخصي');
          }
        },
      ]
    );
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
        <Button 
          mode="contained" 
          onPress={handleLogout} 
          style={[styles.logoutButton, { marginTop: 16 }]}
        >
          العودة لتسجيل الدخول
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* User Profile Card */}
      <Card style={[styles.profileCard, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <View style={styles.profileHeader}>
            {/* الصورة الشخصية مع دعم الصور المرفوعة */}
            {user.profile_image_url ? (
              <Avatar.Image
                size={80}
                source={{ uri: user.profile_image_url }}
                style={{ 
                  backgroundColor: user.background_color || paperTheme.colors.primary,
                  marginBottom: 16,
                }}
              />
            ) : (
              <Avatar.Icon
                size={80}
                icon="account"
                style={{ 
                  backgroundColor: user.background_color || paperTheme.colors.primary,
                  marginBottom: 16,
                }}
                color={user.text_color || paperTheme.colors.onPrimary}
              />
            )}
            
            <View style={styles.profileInfo}>
              <Title style={[styles.userName, { color: paperTheme.colors.onSurface }]}>
                {user.full_name || user.username}
              </Title>
              <Paragraph style={[styles.userDetails, { color: paperTheme.colors.onSurfaceVariant }]}>
                {user.job_title && user.company
                  ? `${user.job_title} في ${user.company}`
                  : user.job_title || user.company || 'لم يتم تحديد المهنة'}
              </Paragraph>
              
              <View style={styles.statusContainer}>
                <Chip
                  icon="check-circle"
                  mode="outlined"
                  compact
                  style={[
                    styles.statusChip,
                    user.is_active ? styles.activeChip : styles.inactiveChip,
                    { borderColor: user.is_active ? customColors.success : customColors.error }
                  ]}
                  textStyle={{ 
                    color: user.is_active ? customColors.success : customColors.error,
                    fontSize: 12,
                  }}
                >
                  {user.is_active ? 'نشط' : 'غير نشط'}
                </Chip>
                
                {user.is_premium && (
                  <Chip
                    icon="crown"
                    mode="outlined"
                    compact
                    style={[styles.statusChip, { borderColor: customColors.warning }]}
                    textStyle={{ color: customColors.warning, fontSize: 12 }}
                  >
                    مميز
                  </Chip>
                )}
              </View>
            </View>
          </View>

          <Divider style={{ marginVertical: 16, backgroundColor: paperTheme.colors.outline }} />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              onPress={handleViewProfile}
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.primary }]}
              icon="eye"
              compact
            >
              عرض الملف
            </Button>
            <Button
              mode="outlined"
              onPress={handleShareProfile}
              style={[styles.actionButton, { borderColor: paperTheme.colors.outline }]}
              textColor={paperTheme.colors.onSurface}
              icon="share"
              compact
            >
              مشاركة
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, shadows.small, { backgroundColor: paperTheme.colors.surface }]}>
          <View style={styles.statContent}>
            <MaterialCommunityIcons
              name="eye"
              size={32}
              color={customColors.info}
            />
            <Text style={[styles.statNumber, { color: paperTheme.colors.onSurface }]}>
              {user.total_visits || 0}
            </Text>
            <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              زيارة
            </Text>
          </View>
        </Surface>

        <Surface style={[styles.statCard, shadows.small, { backgroundColor: paperTheme.colors.surface }]}>
          <View style={styles.statContent}>
            <MaterialCommunityIcons
              name="mouse-variant"
              size={32}
              color={customColors.success}
            />
            <Text style={[styles.statNumber, { color: paperTheme.colors.onSurface }]}>
              {user.total_clicks || 0}
            </Text>
            <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              نقرة
            </Text>
          </View>
        </Surface>
      </View>

      {/* Account Information */}
      <Card style={[styles.infoCard, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            معلومات الحساب
          </Title>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: paperTheme.colors.onSurface }]}>
              اسم المستخدم:
            </Text>
            <Text style={[styles.infoValue, { color: paperTheme.colors.onSurfaceVariant }]}>
              {user.username}
            </Text>
          </View>

          {user.email && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: paperTheme.colors.onSurface }]}>
                البريد الإلكتروني:
              </Text>
              <Text style={[styles.infoValue, { color: paperTheme.colors.onSurfaceVariant }]}>
                {user.email}
              </Text>
            </View>
          )}

          {user.phone && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: paperTheme.colors.onSurface }]}>
                رقم الهاتف:
              </Text>
              <Text style={[styles.infoValue, { color: paperTheme.colors.onSurfaceVariant }]}>
                {user.phone}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: paperTheme.colors.onSurface }]}>
              تاريخ الإنشاء:
            </Text>
            <Text style={[styles.infoValue, { color: paperTheme.colors.onSurfaceVariant }]}>
              {format(new Date(user.created_at), 'dd/MM/yyyy')}
            </Text>
          </View>

          {user.last_visit_at && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: paperTheme.colors.onSurface }]}>
                آخر زيارة:
              </Text>
              <Text style={[styles.infoValue, { color: paperTheme.colors.onSurfaceVariant }]}>
                {format(new Date(user.last_visit_at), 'dd/MM/yyyy HH:mm')}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Theme Preview */}
      <Card style={[styles.infoCard, shadows.medium, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            معاينة الثيم الشخصي
          </Title>

          <View style={styles.colorPreviewContainer}>
            <View style={styles.colorPreview}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                الخلفية
              </Text>
              <View style={[
                styles.colorSample,
                { backgroundColor: user.background_color },
                shadows.small,
              ]} />
            </View>

            <View style={styles.colorPreview}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                النص
              </Text>
              <View style={[
                styles.colorSample,
                { backgroundColor: user.text_color },
                shadows.small,
              ]} />
            </View>

            <View style={styles.colorPreview}>
              <Text style={[styles.colorLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                الأزرار
              </Text>
              <View style={[
                styles.colorSample,
                { backgroundColor: user.button_color },
                shadows.small,
              ]} />
            </View>
          </View>

          {user.bio && (
            <>
              <Divider style={{ marginVertical: 16, backgroundColor: paperTheme.colors.outline }} />
              <Text style={[styles.infoLabel, { color: paperTheme.colors.onSurface }]}>
                النبذة الشخصية:
              </Text>
              <Text style={[
                styles.infoValue, 
                { 
                  color: paperTheme.colors.onSurfaceVariant,
                  marginTop: 8,
                  lineHeight: 20,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }
              ]}>
                {user.bio}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
  profileCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    height: 32,
  },
  activeChip: {},
  inactiveChip: {},
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  infoRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: I18nManager.isRTL ? 'left' : 'right',
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colorPreview: {
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  colorSample: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  logoutButton: {
    borderRadius: 8,
  },
});

export default DashboardOverviewScreen;