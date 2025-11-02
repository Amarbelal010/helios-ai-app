# 🐳 دليل استخدام Docker مع Helios Backend

## 📋 ما هو Docker؟

Docker هو نظام لتجميع التطبيقات وحزمها في "حاويات" (containers) يمكن تشغيلها في أي مكان بنفس البيئة.

---

## 🚀 الطريقة السريعة

### 1. بناء الصورة (Build Image):
```bash
cd backend
docker build -t helios-backend .
```

### 2. تشغيل الحاوية (Run Container):
```bash
docker run -p 5000:5000 --env-file .env helios-backend
```

أو باستخدام docker-compose:
```bash
docker-compose up
```

---

## 📝 شرح الملفات

### 1. `Dockerfile`
هذا الملف يشرح لـ Docker كيفية بناء الصورة:

```dockerfile
FROM node:20-alpine          # استخدم Node.js 20 (نسخة خفيفة)
WORKDIR /app                # حدد مجلد العمل داخل الحاوية
COPY package*.json ./       # انسخ ملفات الـ dependencies
RUN npm ci                  # ثبت الـ dependencies
COPY . .                    # انسخ باقي الملفات
EXPOSE 5000                 # افتح المنفذ 5000
CMD ["node", "server.js"]   # شغّل الخادم
```

### 2. `.dockerignore`
يحدد الملفات التي لا يجب نسخها إلى Docker (مثل `node_modules`)

### 3. `docker-compose.yml`
يُسهل إدارة وتشغيل الحاوية مع إعدادات مسبقة

---

## 🛠️ خطوات الاستخدام

### الطريقة 1: استخدام Docker مباشرة

#### خطوة 1: بناء الصورة
```bash
cd backend
docker build -t helios-backend .
```

**شرح الأمر:**
- `docker build` - بناء صورة جديدة
- `-t helios-backend` - اسم الصورة
- `.` - المجلد الحالي (يحتوي على Dockerfile)

#### خطوة 2: تشغيل الحاوية
```bash
docker run -d \
  --name helios-backend-container \
  -p 5000:5000 \
  --env-file .env \
  helios-backend
```

**شرح الأمر:**
- `-d` - تشغيل في الخلفية (detached mode)
- `--name` - اسم الحاوية
- `-p 5000:5000` - ربط المنفذ 5000 من الحاوية إلى جهازك
- `--env-file .env` - استخدام ملف .env للمتغيرات
- `helios-backend` - اسم الصورة

#### خطوة 3: التحقق من التشغيل
```bash
# عرض الحاويات العاملة
docker ps

# عرض Logs
docker logs helios-backend-container

# إيقاف الحاوية
docker stop helios-backend-container

# حذف الحاوية
docker rm helios-backend-container
```

---

### الطريقة 2: استخدام Docker Compose (الأسهل)

#### خطوة 1: تأكد من وجود ملف `.env`
في مجلد `backend`، يجب أن يكون لديك ملف `.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=production
```

#### خطوة 2: تشغيل
```bash
cd backend
docker-compose up -d
```

**الأمر:**
- `docker-compose up` - بناء وتشغيل الحاوية
- `-d` - في الخلفية

#### خطوة 3: إيقاف
```bash
docker-compose down
```

#### خطوة 4: عرض Logs
```bash
docker-compose logs -f
```

---

## 🌐 النشر على الاستضافة (Container Platform)

### للاستضافة التي تطلب Dockerfile:

1. **تأكد من وجود Dockerfile** في `backend/Dockerfile` ✅ (تم إنشاؤه)

2. **ارفع الكود** على GitHub/GitLab

3. **في لوحة التحكم:**
   - اختر "Deploy from Dockerfile"
   - حدد المسار: `backend/Dockerfile`
   - أضف Environment Variables:
     ```
     MONGO_URI=...
     JWT_SECRET=...
     API_KEY=...
     FRONTEND_URL=...
     PORT=5000
     NODE_ENV=production
     ```

4. **Health Check Path:** `/health`

---

## 🔍 حل المشاكل

### المشكلة: "Cannot find module"
**الحل:** تأكد من نسخ `package.json` قبل `COPY . .`

### المشكلة: "Port already in use"
**الحل:** 
```bash
# غير المنفذ في docker run
docker run -p 5001:5000 ...
```

### المشكلة: "Environment variables not working"
**الحل:** 
- تأكد من استخدام `--env-file .env` أو
- أضف المتغيرات مباشرة:
  ```bash
  docker run -e MONGO_URI=... -e JWT_SECRET=... ...
  ```

### المشكلة: "Container exits immediately"
**الحل:**
```bash
# شوف الـ logs
docker logs helios-backend-container
```

---

## 📊 أوامر مفيدة

```bash
# بناء الصورة بدون cache
docker build --no-cache -t helios-backend .

# عرض الصور
docker images

# عرض الحاويات (جميعها)
docker ps -a

# دخول الحاوية
docker exec -it helios-backend-container sh

# حذف الصورة
docker rmi helios-backend

# تنظيف كل شيء
docker system prune -a
```

---

## ✅ قائمة التحقق

- [ ] Docker مثبت على جهازك
- [ ] ملف `.env` موجود في `backend/`
- [ ] Dockerfile موجود في `backend/`
- [ ] `.dockerignore` موجود
- [ ] `docker-compose.yml` موجود (اختياري)
- [ ] تم بناء الصورة بنجاح
- [ ] الحاوية تعمل
- [ ] يمكن الوصول للـ API

---

## 🎯 ملخص سريع

```bash
# بناء
docker build -t helios-backend .

# تشغيل
docker run -d -p 5000:5000 --env-file .env helios-backend

# أو باستخدام docker-compose
docker-compose up -d
```

**النتيجة:** Backend يعمل على `http://localhost:5000` 🎉

---

## 💡 نصائح

1. استخدم `npm ci` بدل `npm install` في الإنتاج (أسرع وأكثر أماناً)
2. استخدم `.dockerignore` لتقليل حجم الصورة
3. استخدم `alpine` images (أصغر حجماً)
4. اختبر محلياً قبل النشر

إذا احتجت مساعدة، أخبرني! 🚀

