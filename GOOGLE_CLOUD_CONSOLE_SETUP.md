# Google Cloud Console Setup Guide

## 🚨 แก้ไข Error 400: redirect_uri_mismatch

### ขั้นตอนการตั้งค่า Google Cloud Console

#### 1. เข้าสู่ Google Cloud Console

- ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
- เลือกโปรเจกต์ที่ใช้สำหรับ Google OAuth

#### 2. เปิดใช้งาน APIs

- ไปที่ **APIs & Services** > **Library**
- ค้นหา "Google+ API" และเปิดใช้งาน
- ค้นหา "Google Identity" และเปิดใช้งาน

#### 3. สร้าง OAuth 2.0 Credentials

- ไปที่ **APIs & Services** > **Credentials**
- คลิก **+ CREATE CREDENTIALS** > **OAuth client ID**
- เลือก **Web application**

#### 4. ตั้งค่า OAuth Client

**Name:** `Kanban Board OAuth Client`

**Authorized JavaScript origins:**

```
http://localhost:5173
```

**Authorized redirect URIs:**

```
http://localhost:5173/auth/google/callback
```

#### 5. บันทึกและคัดลอกข้อมูล

หลังจากสร้างเสร็จ คุณจะได้:

- **Client ID** (เช่น: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (เช่น: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### 🔧 ตั้งค่า Environment Variables

#### Frontend (.env)

```env
VITE_API_BASE=http://localhost:3000
```

#### Backend (.env)

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
JWT_SECRET=your_jwt_secret_here
```

### 🎯 การทำงานของ OAuth Flow

1. **User คลิก "Continue with Google"**
2. **Frontend เรียก** `POST /api/auth/google/initiate`
3. **Backend สร้าง Google OAuth URL** พร้อม redirect_uri
4. **Frontend redirect ไป** Google OAuth
5. **User ล็อคอินที่ Google**
6. **Google redirect กลับมาที่** `http://localhost:5173/auth/google/callback?code=...`
7. **GoogleCallbackPage รับ code** และเรียก `POST /api/auth/google/callback`
8. **Backend แลก code เป็น token** และส่งกลับ
9. **Frontend ตั้งค่า auth state** และ redirect ไปหน้า main

### ⚠️ ข้อควรระวัง

1. **URL ต้องตรงกันเป๊ะ:**

   - `http://localhost:5173/auth/google/callback` (ไม่ใช่ `http://localhost:3000`)
   - ไม่มี trailing slash `/`
   - ใช้ `http` ไม่ใช่ `https` สำหรับ localhost

2. **Client ID ต้องเป็นค่าจริง:**

   - ไม่ใช่ `your-google-client-id-goes-here`
   - ต้องคัดลอกจาก Google Cloud Console

3. **Port ต้องถูกต้อง:**
   - Frontend: `5173` (Vite default)
   - Backend: `3000`

### 🔍 ตรวจสอบการตั้งค่า

#### ตรวจสอบ Frontend

- เปิด `http://localhost:5173`
- เปิด Developer Tools > Network
- คลิก "Continue with Google"
- ดู URL ที่ redirect ไป

#### ตรวจสอบ Backend

- ตรวจสอบ environment variables
- ตรวจสอบ `GOOGLE_REDIRECT_URI`
- ตรวจสอบ Google OAuth URL ที่สร้าง

### 🚀 ทดสอบ

1. **เริ่ม Backend:**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **เริ่ม Frontend:**

   ```bash
   npm run dev
   ```

3. **ทดสอบ Google OAuth:**
   - ไปที่ `http://localhost:5173`
   - คลิก "Continue with Google"
   - ควร redirect ไป Google OAuth ได้

### 📞 หากยังมีปัญหา

1. **ตรวจสอบ Google Cloud Console:**

   - Redirect URIs ตรงกับ `http://localhost:5173/auth/google/callback` หรือไม่
   - JavaScript origins ตรงกับ `http://localhost:5173` หรือไม่

2. **ตรวจสอบ Environment Variables:**

   - Client ID และ Client Secret ถูกต้องหรือไม่
   - Redirect URI ตรงกับ Google Cloud Console หรือไม่

3. **ตรวจสอบ Network:**
   - ดู request/response ใน Developer Tools
   - ตรวจสอบ error messages

### 🎉 เมื่อตั้งค่าเสร็จ

Google OAuth จะทำงานได้ดังนี้:

- คลิก "Continue with Google"
- Redirect ไป Google OAuth
- ล็อคอินที่ Google
- Redirect กลับมาที่ callback page
- ตั้งค่า auth state และ redirect ไปหน้า main
