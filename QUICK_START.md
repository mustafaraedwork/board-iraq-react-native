# 🚀 Board Iraq React Native - دليل التشغيل السريع

هذا الملف لتشغيل المشروع بسرعة في أي وقت أو على أي جهاز.

---

## ⚡ التشغيل السريع (5 دقائق)

### 1. استنساخ/تنزيل المشروع
```bash
# إذا كان على GitHub
git clone [URL]
cd BoardIraqApp

# أو إذا كان ملف مضغوط، فك الضغط وادخل للمجلد
```

### 2. تثبيت التبعيات
```bash
npm install

# تثبيت مكتبات Expo إضافية
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-screens react-native-safe-area-context

# ملاحظة: جميع المكتبات الأساسية مثبتة في package.json
```

### 3. إعداد متغيرات البيئة
تأكد من وجود ملف `.env` في جذر المشروع:


# معلومات التطبيق
EXPO_PUBLIC_APP_NAME=Board Iraq
EXPO_PUBLIC_APP_VERSION=1.0.0

# معلومات الشركة
EXPO_PUBLIC_CONTACT_PHONE=+9647845663136
EXPO_PUBLIC_CONTACT_EMAIL=info@boardiraq.com
EXPO_PUBLIC_CARD_PRICE=25000

# URLs
EXPO_PUBLIC_WEBSITE_URL=https://boardiraq.vercel.app
EXPO_PUBLIC_SHOP_URL=https://board.thewayl.com/
```

### 4. تشغيل المشروع
```bash
npm start
# أو
npx expo start

# للتشغيل مع مسح Cache
npx expo start --clear
```

### 5. مشاهدة التطبيق
- **المتصفح**: اضغط `w`
- **أندرويد**: اضغط `a` (مع محاكي) أو امسح QR Code مع Expo Go
- **iOS**: اضغط `i` (مع محاكي) أو امسح QR Code مع تطبيق Camera

---

## 🧪 بيانات الاختبار

### المستخدم التجريبي (نفس قاعدة البيانات):
- **اسم المستخدم**: `demo123`
- **كلمة المرور**: `demo123`
- **نوع الحساب**: أدمن (يمكن الوصول لجميع الميزات)
- **رابط الملف الشخصي**: سيكون متاح في التطبيق

### روابط الاختبار المهمة:
```
الصفحة الرئيسية:       الشاشة الافتراضية عند فتح التطبيق
تسجيل الدخول:          LoginScreen (قيد التطوير)
لوحة التحكم:           DashboardScreen (قيد التطوير)
الملف الشخصي:         ProfileScreen (قيد التطوير)
لوحة الإدارة:          AdminScreen (قيد التطوير)
```

---

## 📱 متطلبات التشغيل

### على الكمبيوتر:
- **Node.js**: الإصدار 18 أو أحدث
- **npm**: مثبت مع Node.js
- **Expo CLI**: `npm install -g @expo/cli`
- **محرر نصوص**: VS Code مُستحسن

### على الهاتف:
- **أندرويد**: تطبيق Expo Go من Google Play Store
- **iOS**: تطبيق Expo Go من App Store أو Camera app (لمسح QR)

### اختياري (للمحاكيات):
- **Android Studio**: لمحاكي أندرويد
- **Xcode**: لمحاكي iOS (Mac فقط)

---

## 🔧 حل المشاكل الشائعة

### مشكلة 1: خطأ في تثبيت المكتبات
```bash
# مسح node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### مشكلة 2: خطأ في تحميل .env
```bash
# التأكد من وجود الملف في المكان الصحيح
ls -la .env

# أو في Windows
dir .env
```

### مشكلة 3: خطأ في Expo
```bash
# تحديث Expo CLI
npm install -g @expo/cli@latest

# مسح Cache
npx expo start --clear
```

### مشكلة 4: خطأ في الاتصال بـ Supabase
- تحقق من اتصال الإنترنت
- تأكد من صحة مفاتيح Supabase في .env
- راجع Console للأخطاء

---

## 📂 هيكل المشروع السريع

```
📁 BoardIraqApp/
├── 📄 .env                    # متغيرات البيئة
├── 📄 App.tsx                 # النقطة الرئيسية للتطبيق
├── 📄 package.json            # قائمة المكتبات
├── 📁 src/
│   ├── 📁 components/         # مكونات الواجهة
│   ├── 📁 screens/            # شاشات التطبيق
│   ├── 📁 services/           # خدمات (Supabase, API)
│   ├── 📁 navigation/         # نظام التنقل
│   ├── 📁 types/              # تعريفات TypeScript
│   └── 📁 styles/             # ألوان وأنماط
└── 📁 assets/                 # صور وأيقونات
```

---

## 🎯 الحالة الحالية

### ✅ تم إنجازه:
- إعداد المشروع الأساسي مع Expo + TypeScript
- اتصال Supabase (نفس قاعدة البيانات من Next.js)
- نظام الألوان والتصميم الأساسي
- بنية المجلدات المنظمة
- شاشة ترحيب تعمل على الهاتف

### 🔄 قيد التطوير:
- شاشة تسجيل الدخول
- نظام التنقل بين الشاشات
- لوحة تحكم المستخدم
- شاشة الملف الشخصي العام

### 📅 الخطوات التالية:
1. إنشاء شاشة تسجيل الدخول
2. إعداد React Navigation
3. نقل منطق المصادقة من Next.js
4. إنشاء لوحة التحكم الأساسية

---

## 📞 المساعدة

إذا واجهت أي مشكلة:
1. تحقق من ملف `CURRENT_STATUS.md` لآخر التطورات
2. راجع `DATABASE_SCHEMA.md` لفهم قاعدة البيانات
3. اقرأ `PROJECT_SUMMARY.md` للنظرة الشاملة
4. تحقق من Console للأخطاء التفصيلية