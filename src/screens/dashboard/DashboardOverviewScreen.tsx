// src/screens/dashboard/DashboardOverviewScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  I18nManager,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Text,
  useTheme,
  Avatar,
  Chip,
  Divider,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../../services/supabase';
import { authService } from '../../services/auth';
import type { User } from '../../types';

const DashboardOverviewScreen: React.FC = () => {
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch fresh data from database
        const { data: freshUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (error) {
          console.error('Error fetching fresh user data:', error);
        } else if (freshUser) {
          setUser(freshUser);
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
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

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
          },
        },
      ]
    );
  };

  const shareProfile = () => {
    // TODO: Implement sharing functionality
    Alert.alert('مشاركة الملف', 'سيتم تطوير خاصية المشاركة قريباً');
  };

  const viewPublicProfile = () => {
    // TODO: Navigate to public profile view
    Alert.alert('عرض الملف العام', 'سيتم تطوير عرض الملف العام قريباً');
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
        <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
          العودة لتسجيل الدخول
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* User Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={64}
              label={user.full_name?.charAt(0) || user.username.charAt(0)}
              style={{ backgroundColor: user.background_color || theme.colors.primary }}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>{user.full_name || user.username}</Title>
              <Paragraph style={styles.userDetails}>
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
                  ]}
                >
                  {user.is_active ? 'نشط' : 'غير نشط'}
                </Chip>
                {user.is_premium && (
                  <Chip
                    icon="star"
                    mode="outlined"
                    compact
                    style={[styles.statusChip, styles.premiumChip]}
                  >
                    مميز
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>إحصائيات سريعة</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="eye"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.statNumber}>{user.total_visits || 0}</Text>
              <Text style={styles.statLabel}>زيارة</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cursor-pointer"
                size={24}
                color={theme.colors.secondary}
              />
              <Text style={styles.statNumber}>{user.total_clicks || 0}</Text>
              <Text style={styles.statLabel}>نقرة</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={theme.colors.tertiary}
              />
              <Text style={styles.statNumber}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('ar') : 'غير محدد'}
              </Text>
              <Text style={styles.statLabel}>تاريخ الانضمام</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>إجراءات سريعة</Title>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={viewPublicProfile}
              style={styles.actionButton}
              icon="eye"
            >
              عرض الملف العام
            </Button>
            <Button
              mode="outlined"
              onPress={shareProfile}
              style={styles.actionButton}
              icon="share"
            >
              مشاركة الملف
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Account Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>معلومات الحساب</Title>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>اسم المستخدم:</Text>
            <Text style={styles.infoValue}>@{user.username}</Text>
          </View>
          {user.email && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}
          {user.phone && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>رقم الهاتف:</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>آخر زيارة:</Text>
            <Text style={styles.infoValue}>
              {user.last_visit_at 
                ? new Date(user.last_visit_at).toLocaleString('ar')
                : 'لم يتم تحديدها'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
        textColor={theme.colors.error}
      >
        تسجيل الخروج
      </Button>
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
    elevation: 4,
  },
  profileHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: I18nManager.isRTL ? 0 : 16,
    marginRight: I18nManager.isRTL ? 16 : 0,
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  userDetails: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  statusContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: 8,
  },
  statusChip: {
    marginBottom: 4,
  },
  activeChip: {
    backgroundColor: '#e8f5e8',
  },
  inactiveChip: {
    backgroundColor: '#ffebee',
  },
  premiumChip: {
    backgroundColor: '#fff3e0',
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  infoItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  infoValue: {
    flex: 2,
    textAlign: I18nManager.isRTL ? 'left' : 'right',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});

export default DashboardOverviewScreen;