// src/services/auth.ts - إصدار محدث لإصلاح مشكلة الانتقال
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { User } from '../types';

class AuthService {
  
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 بدء عملية تسجيل الدخول:', username);

      // البحث عن المستخدم في قاعدة البيانات
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('❌ خطأ في قاعدة البيانات:', error);
        return { success: false, error: 'خطأ في الاتصال بقاعدة البيانات' };
      }

      if (!user) {
        console.log('❌ المستخدم غير موجود');
        return { success: false, error: 'اسم المستخدم غير صحيح' };
      }

      // التحقق من كلمة المرور (بسيط - في التطبيق الحقيقي يجب استخدام hashing)
      if (user.password_hash !== password) {
        console.log('❌ كلمة المرور خاطئة');
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }

      console.log('✅ تسجيل الدخول ناجح للمستخدم:', user.username);

      // حفظ بيانات المستخدم محلياً
      await this.saveUserSession(user);

      // تحديث آخر زيارة
      await this.updateLastVisit(user.id);

      return { success: true, user };
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  async saveUserSession(user: User): Promise<void> {
    try {
      console.log('💾 حفظ جلسة المستخدم...');
      
      // حفظ بيانات المستخدم
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // حفظ حالة تسجيل الدخول
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // حفظ timestamp للجلسة
      await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
      
      console.log('✅ تم حفظ الجلسة بنجاح');
      
      // التحقق من الحفظ
      const savedAuth = await AsyncStorage.getItem('isAuthenticated');
      const savedUser = await AsyncStorage.getItem('user');
      
      console.log('🔍 التحقق من الحفظ:', {
        isAuthenticated: savedAuth,
        userSaved: !!savedUser
      });
      
    } catch (error) {
      console.error('❌ خطأ في حفظ الجلسة:', error);
      throw error;
    }
  }

  async updateLastVisit(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_visit_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('خطأ في تحديث آخر زيارة:', error);
      }
    } catch (error) {
      console.error('خطأ في تحديث آخر زيارة:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 بدء عملية تسجيل الخروج...');
      
      // مسح جميع البيانات المحلية
      await AsyncStorage.multiRemove([
        'user',
        'isAuthenticated',
        'loginTimestamp'
      ]);
      
      console.log('✅ تم تسجيل الخروج بنجاح');
      
      // التحقق من المسح
      const authCheck = await AsyncStorage.getItem('isAuthenticated');
      console.log('🔍 التحقق من تسجيل الخروج:', { isAuthenticated: authCheck });
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const user = await AsyncStorage.getItem('user');
      
      const result = isAuthenticated === 'true' && user !== null;
      
      console.log('🔍 فحص حالة تسجيل الدخول:', {
        isAuthenticated,
        hasUser: !!user,
        result
      });
      
      return result;
    } catch (error) {
      console.error('خطأ في فحص حالة تسجيل الدخول:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) return null;

      const user = JSON.parse(userString) as User;
      return user;
    } catch (error) {
      console.error('خطأ في جلب المستخدم الحالي:', error);
      return null;
    }
  }

  // دالة للتحقق من صحة الجلسة
  async validateSession(): Promise<boolean> {
    try {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const user = await AsyncStorage.getItem('user');
      const loginTimestamp = await AsyncStorage.getItem('loginTimestamp');

      if (isAuthenticated !== 'true' || !user || !loginTimestamp) {
        return false;
      }

      // التحقق من عدم انتهاء الجلسة (24 ساعة)
      const loginTime = parseInt(loginTimestamp);
      const now = Date.now();
      const timeDiff = now - loginTime;
      const hoursElapsed = timeDiff / (1000 * 60 * 60);

      if (hoursElapsed > 24) {
        console.log('🕐 انتهت صلاحية الجلسة');
        await this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('خطأ في التحقق من صحة الجلسة:', error);
      return false;
    }
  }

  // دالة إضافية لفرض إعادة التحميل
  async forceRefreshAuthState(): Promise<void> {
    try {
      console.log('🔄 فرض إعادة تحميل حالة المصادقة...');
      
      // مسح cache مؤقت
      await AsyncStorage.setItem('forceRefresh', Date.now().toString());
      
      // إضافة تأخير صغير
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('خطأ في فرض إعادة التحميل:', error);
    }
  }
}

export const authService = new AuthService();