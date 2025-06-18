# 🗄️ Board Iraq React Native - هيكل قاعدة البيانات

**تاريخ آخر تحديث**: 18 يونيو 2025  
**نوع قاعدة البيانات**: PostgreSQL (Supabase)  
**حالة قاعدة البيانات**: 🟢 مشتركة مع مشروع Next.js

---

## 📊 نظرة عامة على قاعدة البيانات

### معلومات الاتصال:
- **URL**: `https://icqvknhbhnsllnkpajmo.supabase.co`
- **نوع**: PostgreSQL 15.x
- **المنطقة**: US East
- **الاتصال**: مشترك مع مشروع Next.js
- **مكتبة الاتصال**: `@supabase/supabase-js`

### حالة التكامل:
- ✅ **متصل بنجاح**: التطبيق يتصل بقاعدة البيانات
- ✅ **البيانات مشتركة**: نفس المستخدمين والروابط
- ✅ **التزامن الفوري**: تحديثات مباشرة بين Web + Mobile
- ✅ **RLS مفعل**: Row Level Security للحماية

### الإحصائيات الحالية:
- **إجمالي المستخدمين**: 5+ مستخدمين مشتركين
- **إجمالي الروابط**: 15+ رابط مشترك
- **إجمالي الزيارات**: 20+ زيارة مسجلة
- **إجمالي الطلبات**: 3+ طلبات بطاقات

---

## 🗂️ هيكل الجداول (مشتركة مع Next.js)

### 1. جدول `users` 👥 **الجدول الرئيسي**
**الوصف**: معلومات المستخدمين والملفات الشخصية

| العمود | النوع | React Native Usage | الوصف |
|---------|-------|-------------------|--------|
| `id` | uuid | User.id | المعرف الفريد للمستخدم |
| `username` | varchar | Profile Route | اسم المستخدم (فريد) |
| `password_hash` | text | Login Form | كلمة المرور |
| `email` | varchar | Profile Form | البريد الإلكتروني |
| `full_name` | varchar | Display Name | الاسم الكامل |
| `phone` | varchar | Contact Link | رقم الهاتف |
| `job_title` | varchar | Profile Display | المسمى الوظيفي |
| `company` | varchar | Profile Display | اسم الشركة |
| `bio` | text | Profile Description | النبذة الشخصية |
| `profile_image_url` | text | Avatar Image | صورة الملف الشخصي |
| `logo_url` | text | Company Logo | شعار الشركة |
| `background_color` | varchar | Theme Customization | لون الخلفية |
| `text_color` | varchar | Theme Customization | لون النص |
| `button_color` | varchar | Theme Customization | لون الأزرار |
| `total_visits` | integer | Stats Display | إجمالي زيارات الصفحة |
| `total_clicks` | integer | Stats Display | إجمالي النقرات |
| `is_active` | boolean | Account Status | حالة تفعيل الحساب |
| `is_premium` | boolean | Feature Access | حساب مميز |
| `is_batch_generated` | boolean | Admin Dashboard | منشأ بالجملة |
| `is_admin` | boolean | Admin Access | صلاحيات المشرف |
| `created_at` | timestamp | Account Info | تاريخ إنشاء الحساب |
| `updated_at` | timestamp | Last Modified | تاريخ آخر تحديث |
| `last_visit_at` | timestamp | Activity Tracking | تاريخ آخر زيارة |

**الاستخدام في React Native**:
```typescript
// جلب معلومات المستخدم
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single();

// تحديث الملف الشخصي
await supabase
  .from('users')
  .update({ 
    full_name, 
    background_color,
    text_color 
  })
  .eq('id', userId);
```

---

### 2. جدول `user_links` 🔗 **الروابط الشخصية**
**الوصف**: روابط وسائل التواصل والمعلومات الشخصية

| العمود | النوع | React Native Usage | الوصف |
|---------|-------|-------------------|--------|
| `id` | uuid | Link.id | معرف الرابط |
| `user_id` | uuid | Foreign Key | ربط بالمستخدم |
| `type` | varchar | Link Category | نوع الرابط |
| `platform` | varchar | Icon Selection | المنصة الاجتماعية |
| `title` | varchar | Display Text | عنوان الرابط |
| `url` | varchar | Navigation/Action | الرابط أو النص |
| `icon` | varchar | Custom Icons | أيقونة مخصصة |
| `is_active` | boolean | Link Visibility | حالة العرض |
| `sort_order` | integer | List Ordering | ترتيب العرض |
| `click_count` | integer | Analytics | عدد النقرات |
| `created_at` | timestamp | Creation Date | تاريخ الإنشاء |
| `updated_at` | timestamp | Last Modified | تاريخ التحديث |

**أنواع الروابط المدعومة**:
- `phone` - أرقام الهاتف
- `email` - البريد الإلكتروني  
- `website` - مواقع ويب
- `social` - وسائل التواصل
- `file` - ملفات PDF
- `custom` - روابط مخصصة

**المنصات الاجتماعية**:
`facebook`, `instagram`, `whatsapp`, `telegram`, `twitter`, `linkedin`, `snapchat`, `tiktok`, `youtube`

**الاستخدام في React Native**:
```typescript
// جلب روابط المستخدم
const { data: links } = await supabase
  .from('user_links')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true)