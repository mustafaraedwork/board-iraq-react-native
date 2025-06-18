export interface User {
  id: string;
  username: string;
  password_hash?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  job_title?: string;
  company?: string;
  bio?: string;
  profile_image_url?: string;
  logo_url?: string;
  background_color: string;
  text_color: string;
  button_color: string;
  total_visits: number;
  total_clicks: number;
  is_active: boolean;
  is_premium: boolean;
  is_batch_generated: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_visit_at?: string;
}

export interface UserLink {
  id: string;
  user_id: string;
  type: 'phone' | 'email' | 'website' | 'social' | 'file' | 'custom';
  platform?: 'facebook' | 'instagram' | 'whatsapp' | 'telegram' | 'twitter' | 'linkedin' | 'snapchat' | 'tiktok' | 'youtube' | 'pdf' | 'custom';
  title: string;
  url: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Profile: { username: string };
  Admin: undefined;
};