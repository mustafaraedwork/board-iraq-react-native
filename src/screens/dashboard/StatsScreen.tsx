// src/screens/dashboard/StatsScreen.tsx - مُصحح تماماً
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  I18nManager,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  Surface,
  Chip,
  List,
  Button,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../../services/supabase';
import type { User, UserLink } from '../../types';

interface VisitStats {
  total_visits: number;
  total_clicks: number;
  today_visits: number;
  this_week_visits: number;
  this_month_visits: number;
}

interface LinkStats {
  link: UserLink;
  click_count: number;
  percentage: number;
}

const { width } = Dimensions.get('window');

const StatsScreen: React.FC = () => {
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitStats, setVisitStats] = useState<VisitStats>({
    total_visits: 0,
    total_clicks: 0,
    today_visits: 0,
    this_week_visits: 0,
    this_month_visits: 0,
  });
  const [linkStats, setLinkStats] = useState<LinkStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Load visit statistics
        await loadVisitStats(parsedUser.id);
        
        // Load link statistics
        await loadLinkStats(parsedUser.id);
      }
    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVisitStats = async (userId: string) => {
    try {
      // For now, we'll use the basic stats from the user table
      // In a real app, you'd have separate tables for tracking visits and clicks
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_visits, total_clicks')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user stats:', userError);
        return;
      }

      // Simulate some additional stats (in real app, these would come from analytics tables)
      setVisitStats({
        total_visits: userData.total_visits || 0,
        total_clicks: userData.total_clicks || 0,
        today_visits: Math.floor((userData.total_visits || 0) * 0.1), // 10% of total as today
        this_week_visits: Math.floor((userData.total_visits || 0) * 0.3), // 30% as this week
        this_month_visits: Math.floor((userData.total_visits || 0) * 0.6), // 60% as this month
      });
    } catch (error) {
      console.error('Error loading visit stats:', error);
    }
  };

  const loadLinkStats = async (userId: string) => {
    try {
      const { data: links, error: linksError } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('click_count', { ascending: false });

      if (linksError) {
        console.error('Error fetching links:', linksError);
        return;
      }

      if (links && links.length > 0) {
        const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0);
        
        const statsWithPercentage = links.map((link) => ({
          link,
          click_count: link.click_count || 0,
          percentage: totalClicks > 0 ? ((link.click_count || 0) / totalClicks) * 100 : 0,
        }));

        setLinkStats(statsWithPercentage);
      } else {
        setLinkStats([]);
      }
    } catch (error) {
      console.error('Error loading link stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatsByPeriod = () => {
    switch (selectedPeriod) {
      case 'today':
        return visitStats.today_visits;
      case 'week':
        return visitStats.this_week_visits;
      case 'month':
        return visitStats.this_month_visits;
      case 'all':
      default:
        return visitStats.total_visits;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'اليوم';
      case 'week': return 'هذا الأسبوع';
      case 'month': return 'هذا الشهر';
      case 'all':
      default: return 'الإجمالي';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>جاري تحميل الإحصائيات...</Text>
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Period Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>فترة العرض</Title>
          <View style={styles.periodContainer}>
            {[
              { key: 'today', label: 'اليوم', icon: 'calendar-today' },
              { key: 'week', label: 'الأسبوع', icon: 'calendar-week' },
              { key: 'month', label: 'الشهر', icon: 'calendar-month' },
              { key: 'all', label: 'الإجمالي', icon: 'calendar-multiple' },
            ].map((period) => (
              <Chip
                key={period.key}
                mode={selectedPeriod === period.key ? 'flat' : 'outlined'}
                selected={selectedPeriod === period.key}
                onPress={() => setSelectedPeriod(period.key as any)}
                style={styles.periodChip}
                icon={period.icon}
              >
                {period.label}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Main Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>إحصائيات {getPeriodLabel()}</Title>
          
          <View style={styles.statsGrid}>
            <Surface style={styles.statItem}>
              <MaterialCommunityIcons
                name="eye"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={styles.statNumber}>{getStatsByPeriod()}</Text>
              <Text style={styles.statLabel}>زيارة</Text>
            </Surface>
            
            <Surface style={styles.statItem}>
              <MaterialCommunityIcons
                name="mouse-variant"
                size={32}
                color={theme.colors.secondary}
              />
              <Text style={styles.statNumber}>{visitStats.total_clicks}</Text>
              <Text style={styles.statLabel}>نقرة</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Top Links Performance */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>أداء الروابط</Title>
          
          {linkStats.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.emptyText}>لا توجد بيانات للروابط</Text>
              <Text style={styles.emptySubtext}>
                أضف روابط لمشاهدة إحصائيات الأداء
              </Text>
              <Button
                mode="outlined"
                onPress={() => {/* Navigate to Links Manager */}}
                style={styles.emptyButton}
                icon="plus"
              >
                إضافة روابط
              </Button>
            </View>
          ) : (
            <View style={styles.linkStatsContainer}>
              {linkStats.slice(0, 5).map((stat, index) => (
                <Surface key={stat.link.id} style={styles.linkStatItem}>
                  <View style={styles.linkStatHeader}>
                    <View style={styles.linkStatInfo}>
                      <MaterialCommunityIcons
                        name={stat.link.icon as any}
                        size={24}
                        color={theme.colors.primary}
                      />
                      <View style={styles.linkStatTexts}>
                        <Text style={styles.linkStatTitle}>{stat.link.title}</Text>
                        <Text style={styles.linkStatSubtitle}>
                          {stat.click_count} نقرة • {stat.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    <Chip mode="outlined" compact>
                      #{index + 1}
                    </Chip>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${stat.percentage}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                </Surface>
              ))}
            </View>
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  periodContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodChip: {
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    minWidth: width * 0.4,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
  },
  linkStatsContainer: {
    gap: 12,
  },
  linkStatItem: {
    padding: 16,
    borderRadius: 12,
  },
  linkStatHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkStatInfo: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkStatTexts: {
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
    flex: 1,
  },
  linkStatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  linkStatSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default StatsScreen;