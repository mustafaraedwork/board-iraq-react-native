// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { User } from '../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private readonly USER_STORAGE_KEY = 'currentUser';
  private readonly AUTH_TOKEN_KEY = 'authToken';

  /**
   * تسجيل الدخول
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { username, password } = credentials;

      // البحث عن المستخدم في قاعدة البيانات
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return {
          success: false,
          error: 'اسم المستخدم غير موجود أو غير نشط'
        };
      }

      // التحقق من كلمة المرور (بسيطة الآن، يمكن تحسينها لاحقاً)
      if (user.password_hash !== password) {
        return {
          success: false,
          error: 'كلمة المرور غير صحيحة'
        };
      }

      // حفظ بيانات المستخدم محلياً
      await this.saveUserData(user);

      // تحديث آخر زيارة
      await this.updateLastVisit(user.id);

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'حدث خطأ في الاتصال. تحقق من الإنترنت.'
      };
    }
  }

  /**
   * تسجيل الخروج
   */
  async logout(): Promise<void> {
    try {
      // مسح البيانات المحلية
      await AsyncStorage.multiRemove([
        this.USER_STORAGE_KEY,
        this.AUTH_TOKEN_KEY
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * جلب المستخدم الحالي من التخزين المحلي
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * التحقق من حالة تسجيل الدخول
   */
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * حفظ بيانات المستخدم محلياً
   */
  private async saveUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      // يمكن إضافة token لاحقاً للأمان
      await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, `user_${user.id}`);
    } catch (error) {
      console.error('Save user data error:', error);
    }
  }

  /**
   * تحديث آخر زيارة للمستخدم
   */
  private async updateLastVisit(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ 
          last_visit_at: new Date().toISOString() 
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Update last visit error:', error);
      // لا نوقف عملية تسجيل الدخول لأجل هذا الخطأ
    }
  }

  /**
   * تحديث بيانات المستخدم في التخزين المحلي
   */
  async updateLocalUser(updatedUser: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update local user error:', error);
    }
  }

  /**
   * جلب بيانات المستخدم المحدثة من قاعدة البيانات
   */
  async refreshUserData(): Promise<User | null> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return null;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error || !user) return currentUser;

      // تحديث البيانات المحلية
      await this.updateLocalUser(user);
      return user;
    } catch (error) {
      console.error('Refresh user data error:', error);
      return await this.getCurrentUser();
    }
  }
}

// تصدير instance واحد ليتم استخدامه في جميع أنحاء التطبيق
export const authService = new AuthService();