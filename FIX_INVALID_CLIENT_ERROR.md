# 🚨 แก้ไข Error: invalid_client และ Port Mismatch

## ปัญหาที่พบ:

1. **Error: invalid_client** - Backend ใช้ Client ID ตัวอย่าง (`your-google-client-id`) แทนที่จะเป็น Client ID จริง
2. **Port Mismatch** - Frontend อยู่ที่ port `55713` แต่ Google Cloud Console ตั้งเป็น `5173`

## ✅ วิธีแก้ไข:

### 1. แก้ไข Google Cloud Console

#### ไปที่ Google Cloud Console:

- [Google Cloud Console](https://console.cloud.google.com/)
- เลือกโปรเจกต์ของคุณ
- ไปที่ **APIs & Services** > **Credentials**
- คลิก OAuth 2.0 Client ID ที่มี Client ID: `955151956497-9otafel35l5k6c67peqitkl5acboq2qg`

#### ตั้งค่า Redirect URIs ให้ถูกต้อง:

**Authorized JavaScript origins:**

```
http://localhost:5173
```

**Authorized redirect URIs:**

```
http://localhost:5173/auth/google/callback
```

#### ⚠️ สำคัญ: กดปุ่ม "Save" (บันทึก) สีฟ้าที่อยู่ล่างซ้าย!

### 2. แก้ไข Backend Environment Variables

#### Backend (.env):

```env
GOOGLE_CLIENT_ID=955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_real_client_secret_from_google
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
JWT_SECRET=your_jwt_secret_here
```

#### Frontend (.env):

```env
NEXT_PUBLIC_API_BASE=http://localhost:5174
```

### 3. ตรวจสอบ Client Secret

#### ไปที่ Google Cloud Console:

- คลิก OAuth 2.0 Client ID ของคุณ
- คลิกปุ่ม "Show client secret" หรือรูปดินสอ
- คัดลอก Client Secret
- ใส่ใน Backend environment variables

### 4. ทดสอบการทำงาน

#### เริ่ม Backend:

```bash
cd backend
npm run dev
# ควรทำงานที่ http://localhost:5174
```

#### เริ่ม Frontend:

```bash
npm run dev
# ควรทำงานที่ http://localhost:5173
```

#### ทดสอบ Google OAuth:

1. ไปที่ `http://localhost:5173`
2. คลิก "Continue with Google"
3. ควร redirect ไป Google OAuth ได้โดยไม่มี Error

## 🔍 ตรวจสอบการตั้งค่า:

### Google Cloud Console:

- ✅ Client ID: `955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com`
- ✅ JavaScript origins: `http://localhost:5173`
- ✅ Redirect URIs: `http://localhost:5173/auth/google/callback`

### Backend Environment Variables:

- ✅ `GOOGLE_CLIENT_ID=955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com`
- ✅ `GOOGLE_CLIENT_SECRET=your_real_client_secret_from_google`
- ✅ `GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback`

### Frontend Environment Variables:

- ✅ `NEXT_PUBLIC_API_BASE=http://localhost:5174`

## 🎯 การทำงานของ Google OAuth:

1. **User อยู่ที่ Frontend** (`http://localhost:5173`)
2. **Frontend เรียก Backend API** (`http://localhost:5174/api/auth/google/initiate`)
3. **Backend สร้าง Google OAuth URL** พร้อม redirect_uri
4. **Google redirect กลับมาที่ Frontend** (`http://localhost:5173/auth/google/callback`)

## ⚠️ ข้อควรระวัง:

1. **URL ต้องตรงกันเป๊ะ:**

   - `http://localhost:5173/auth/google/callback` (ไม่ใช่ `5173`)
   - ไม่มี trailing slash `/`
   - ใช้ `http` ไม่ใช่ `https` สำหรับ localhost

2. **Client ID และ Client Secret:**

   - ต้องเป็นค่าจริงจาก Google Cloud Console
   - ไม่ใช่ค่าตัวอย่าง (`your-google-client-id`)

3. **Port:**
   - Frontend: `55713` (ตามที่แอปทำงานจริง)
   - Backend: `5174`

## 🎉 เมื่อตั้งค่าเสร็จ:

Google OAuth จะทำงานได้ดังนี้:

- คลิก "Continue with Google"
- Redirect ไป Google OAuth
- ล็อคอินที่ Google
- Redirect กลับมาที่ callback page
- ตั้งค่า auth state และ redirect ไปหน้า main

## 📞 หากยังมีปัญหา:

1. **ตรวจสอบ Google Cloud Console:**

   - Redirect URIs ตรงกับ `http://localhost:5173/auth/google/callback` หรือไม่
   - JavaScript origins ตรงกับ `http://localhost:5173` หรือไม่
   - กดปุ่ม "Save" แล้วหรือยัง

2. **ตรวจสอบ Environment Variables:**

   - Client ID และ Client Secret ถูกต้องหรือไม่
   - Redirect URI ตรงกับ Google Cloud Console หรือไม่

3. **ตรวจสอบ Network:**
   - ดู request/response ใน Developer Tools
   - ตรวจสอบ error messages
