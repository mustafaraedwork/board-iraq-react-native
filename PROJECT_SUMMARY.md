# Board Iraq React Native - ملخص المشروع

## 🎯 نظرة عامة
تطبيق موبايل لبطاقات NFC الذكية مع صفحات شخصية رقمية قابلة للتخصيص. نسخة React Native من مشروع Next.js الناجح.

---

## 🏗️ هيكل المشروع

### التقنيات المستخدمة:
- **Frontend**: React Native + Expo SDK 53
- **Language**: TypeScript
- **UI Framework**: React Native Paper + Expo Vector Icons
- **Navigation**: React Navigation 6
- **Backend**: Supabase (PostgreSQL) - نفس قاعدة البيانات من Next.js
- **Forms**: React Hook Form + Zod
- **Storage**: AsyncStorage + Expo SecureStore
- **Special Features**: QR Code, NFC, Camera

### الشاشات المخططة:
- **شاشة الترحيب**: `/` - الشاشة الرئيسية (مكتملة ✅)
- **تسجيل الدخول**: `LoginScreen` - دخول المستخدمين (مكتملة ✅)
- **لوحة التحكم**: `DashboardScreen` - إدارة الملف والروابط (أساسية ✅)
- **تعديل الملف**: `ProfileEditScreen` - تخصيص المعلومات (قيد التطوير 🔄)
- **إدارة الروابط**: `LinksManagerScreen` - إضافة وتعديل الروابط (قيد التطوير 🔄)
- **الإحصائيات**: `StatsScreen` - عرض البيانات التفصيلية (قيد التطوير 🔄)
- **الملف الشخصي العام**: `ProfileScreen` - عرض للزوار (مخطط 📅)
- **إنشاء حساب**: `RegisterScreen` - تسجيل مستخدمين جدد (مخطط 📅)
- **لوحة الإدارة**: `AdminScreen` - إدارة المستخدمين (مخطط 📅)
- **إدارة الطلبات**: `OrdersScreen` - طلبات البطاقات (مخطط 📅)
- **QR Scanner**: `QRScannerScreen` - مسح رموز البطاقات (مخطط 📅)

### المكونات الرئيسية:
- **UI Components**: `src/components/ui/` - مكونات واجهة أساسية (جاهزة للتطوير)
- **Auth Components**: `src/components/auth/` - نماذج المصادقة (جاهزة للتطوير)
- **Dashboard Components**: `src/components/dashboard/` - إدارة الملف (قيد التطوير 🔄)
- **Profile Components**: `src/components/profile/` - عرض الصفحات العامة (مخطط 📅)
- **Admin Components**: `src/components/admin/` - أدوات الإدارة (مخطط 📅)

### الخدمات والمكتبات:
- **Supabase Client**: `src/services/supabase.ts` - اتصال قاعدة البيانات (مكتمل ✅)
- **Auth Service**: `src/services/auth.ts` - خدمات المصادقة (مكتمل ✅)
- **Profile Service**: `src/services/profile.ts` - إدارة الملفات الشخصية (مخطط 📅)
- **Links Service**: `src/services/links.ts` - إدارة الروابط (مخطط 📅)
- **Admin Service**: `src/services/admin.ts` - عمليات الإدارة (مخطط 📅)
- **NFC Service**: `src/services/nfc.ts` - خدمات NFC (مخطط 📅)
- **Types**: `src/types/index.ts` - تعريفات TypeScript (محدث ✅)
- **Utils**: `src/utils/` - دوال مساعدة (مخطط 📅)

### نظام التنقل:
- **App Navigator**: `src/navigation/AppNavigator.tsx` - التنقل الرئيسي (مكتمل ✅)
- **Auth Navigator**: `src/navigation/AuthNavigator.tsx` - تنقل المصادقة (مدمج في App Navigator ✅)
- **Tab Navigator**: `src/navigation/TabNavigator.tsx` - تبويبات رئيسية (قيد التطوير 🔄)
- **Stack Navigator**: لكل مجموعة شاشات (حسب الحاجة 📅)

---

## 🗄️ قاعدة البيانات (Supabase)

### الاتصال:
- **URL**: https://icqvknhbhnsllnkpajmo.supabase.co
- **نوع قاعدة البيانات**: PostgreSQL
- **مكتبة الاتصال**: @supabase/supabase-js
- **نفس قاعدة البيانات**: مشتركة مع مشروع Next.js

### الجداول الرئيسية:
1. **users** - معلومات المستخدمين ✅
   - معلومات أساسية: id, username, full_name, email
   - معلومات العرض: profile_image_url, background_color, text_color
   - إحصائيات: total_visits, total_clicks
   - صلاحيات: is_admin, is_active, is_premium

2. **user_links** - روابط المستخدمين ✅
   - معلومات الرابط: type, platform, title, url
   - إعدادات: is_active, sort_order, click_count

3. **page_visits** - سجل الزيارات ✅
4. **link_clicks** - سجل النقرات ✅
5. **orders** - طلبات البطاقات ✅
6. **support_tickets** - تذاكر الدعم ✅

---

## 🎨 التصميم والألوان

### نظام الألوان (مطابق لـ Next.js):
- **خلفية رئيسية**: `#F0EEE6` (كريمي)
- **لون أساسي**: `#D97757` (برتقالي دافئ)
- **لون النص**: `#141413` (أسود داكن)
- **ألوان إضافية**: نظام Gray متدرج + ألوان الحالة

### مكونات UI:
- **React Native Paper**: مكونات متقدمة (Button, Card, TextInput)
- **Expo Vector Icons**: أيقونات شاملة
- **تخصيص Theme**: متوافق مع ألوان المشروع

### دعم RTL:
- النصوص العربية مدعومة
- اتجاه الكتابة من اليمين لليسار
- تخطيط متجاوب للشاشات المختلفة

---

## 📱 الميزات الخاصة بالموبايل

### 1. QR Code:
- **إنشاء**: QR Code لكل ملف شخصي
- **مسح**: Camera للبحث عن البطاقات
- **مشاركة**: إرسال QR Code عبر التطبيقات

### 2. NFC Integration:
- **كتابة**: حفظ رابط الملف على البطاقة الذكية
- **قراءة**: فتح الملف عند تمرير البطاقة
- **إدارة**: تفعيل/إلغاء تفعيل البطاقات

### 3. مشاركة محسّنة:
- **مشاركة الملف**: عبر جميع التطبيقات
- **حفظ الصور**: QR Code والبطاقة للمعرض
- **إرسال مباشر**: WhatsApp, Telegram, Email

### 4. إشعارات:
- **طلبات جديدة**: للمشرفين
- **زيارات جديدة**: للمستخدمين
- **تحديثات**: إشعارات النظام

---

## 🔐 نظام المصادقة والأمان

### المصادقة:
- **تسجيل الدخول**: username + password (مطابق لـ Next.js)
- **حفظ الجلسة**: AsyncStorage للبيانات العامة
- **البيانات الحساسة**: Expo SecureStore
- **تسجيل الخروج**: مسح جميع البيانات المحلية

### الأمان:
- **تشفير البيانات**: في SecureStore
- **صلاحيات المشرف**: محمية على مستوى قاعدة البيانات
- **Supabase RLS**: Row Level Security مفعل
- **Token Management**: تجديد تلقائي للجلسات

---

## 📊 الإحصائيات والتحليلات

### إحصائيات المستخدم:
- **زيارات الصفحة**: عدد مشاهدات الملف الشخصي
- **نقرات الروابط**: تتبع كل نقرة على رابط
- **أفضل الروابط**: الروابط الأكثر استخداماً
- **الزوار**: معلومات IP والجهاز (مجهولة)

### إحصائيات الإدارة:
- **إجمالي المستخدمين**: نشطين/غير نشطين
- **الطلبات الجديدة**: طلبات البطاقات
- **النمو**: إحصائيات يومية/شهرية
- **الاستخدام**: أكثر الميزات استخداماً

---

## 🚀 خطة التطوير

### المرحلة 1 - الأساسيات (✅ مكتملة):
- [x] إعداد المشروع والبنية الأساسية
- [x] اتصال Supabase وقاعدة البيانات
- [x] نظام الألوان والتصميم
- [x] شاشة تسجيل الدخول الكاملة
- [x] نظام التنقل الأساسي
- [x] خدمة المصادقة المتكاملة

### المرحلة 2 - الوظائف الأساسية (🔄 قيد التطوير):
- [ ] لوحة تحكم متقدمة مع تبويبات
- [ ] إدارة الملف الشخصي (تعديل المعلومات والألوان)
- [ ] إدارة الروابط (إضافة/تعديل/حذف/ترتيب)
- [ ] شاشة الملف العام للزوار
- [ ] QR Code أساسي (إنشاء)

### المرحلة 3 - الميزات المتقدمة (📅 مخطط):
- [ ] لوحة الإدارة الكاملة
- [ ] نظام الطلبات والإحصائيات
- [ ] QR Scanner متقدم
- [ ] مشاركة عبر التطبيقات
- [ ] نظام الإشعارات

### المرحلة 4 - الميزات الخاصة (📅 مخطط):
- [ ] NFC Integration كامل
- [ ] تحسين الأداء والسرعة
- [ ] اختبار شامل على أجهزة مختلفة
- [ ] إعداد App Store وGoogle Play

---

## 🔗 الاتصال مع مشروع Next.js

### البيانات المشتركة:
- **نفس قاعدة البيانات**: Supabase مشتركة
- **نفس المستخدمين**: تسجيل دخول موحد
- **نفس الروابط**: تزامن فوري
- **نفس الإحصائيات**: تحديث مباشر

### التكامل:
- **Web + Mobile**: المستخدم يدخل من أي منصة
- **إدارة موحدة**: تغييرات فورية في كلا المنصتين
- **نسخ احتياطي**: النظامان يعملان بشكل مستقل

---

## 📱 متطلبات النشر

### Google Play Store:
- **تطبيق APK/AAB**: Expo Build
- **حساب مطور**: $25 مرة واحدة
- **Permissions**: Camera, NFC, Internet
- **Target SDK**: Android 14+

### Apple App Store:
- **تطبيق IPA**: Expo Build
- **Apple Developer**: $99 سنوياً
- **Review Process**: 1-7 أيام
- **iOS Support**: iOS 13+

### الميزات الاختيارية:
- **Expo Updates**: تحديثات OTA
- **Expo Notifications**: Push Notifications
- **Analytics**: Firebase أو Amplitude
- **Crash Reporting**: Sentry أو Bugsnag

---

## 📞 معلومات المشروع

- **اسم التطبيق**: Board Iraq
- **الإصدار**: 1.0.0
- **المطور**: Board Iraq Team
- **الهاتف**: +9647845663136
- **البريد**: info@boardiraq.com
- **الموقع**: https://boardiraq.vercel.app

**آخر تحديث**: 18 يونيو 2025  
**حالة المشروع**: 🟡 قيد التطوير النشط (المرحلة الأولى)