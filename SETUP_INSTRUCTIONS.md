# 🚀 คำแนะนำการตั้งค่า Google OAuth

## ✅ Client ID ที่ได้แล้ว:

```
955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com
```

## 📋 สิ่งที่ต้องทำต่อ:

### 1. ตั้งค่า Google Cloud Console

#### ไปที่ Google Cloud Console:

- [Google Cloud Console](https://console.cloud.google.com/)
- เลือกโปรเจกต์ของคุณ

#### ไปที่ OAuth 2.0 Credentials:

- **APIs & Services** > **Credentials**
- คลิก OAuth 2.0 Client ID ที่มี Client ID: `955151956497-9otafel35l5k6c67peqitkl5acboq2qg`

#### ตั้งค่า Redirect URIs:

**Authorized JavaScript origins:**

```
http://localhost:5173
```

**Authorized redirect URIs:**

```
http://localhost:5173/auth/google/callback
```

#### บันทึกการเปลี่ยนแปลง

### 2. ตั้งค่า Environment Variables

#### Frontend (.env):

```env
NEXT_PUBLIC_API_BASE=http://localhost:5174
```

#### Backend (.env):

```env
GOOGLE_CLIENT_ID=955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
JWT_SECRET=your_jwt_secret_here
```

### 3. เริ่มเซิร์ฟเวอร์

#### เริ่ม Backend:

```bash
cd backend
npm install
npm run dev
```

#### เริ่ม Frontend:

```bash
npm run dev
```

### 4. ทดสอบ Google OAuth

1. ไปที่ `http://localhost:5173`
2. คลิก "Continue with Google"
3. ควร redirect ไป Google OAuth ได้โดยไม่มี Error 400
4. หลังล็อคอินสำเร็จ จะกลับมาที่ callback page
5. ระบบจะ redirect ไปหน้า main อัตโนมัติ

## 🔍 ตรวจสอบการตั้งค่า

### ตรวจสอบ Google Cloud Console:

- ✅ Client ID: `955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com`
- ✅ JavaScript origins: `http://localhost:5173`
- ✅ Redirect URIs: `http://localhost:5173/auth/google/callback`

### ตรวจสอบ Environment Variables:

- ✅ Frontend: `NEXT_PUBLIC_API_BASE=http://localhost:5174`
- ✅ Backend: `GOOGLE_CLIENT_ID=955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com`
- ✅ Backend: `GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback`

## ⚠️ ข้อควรระวัง

1. **URL ต้องตรงกันเป๊ะ:**

   - `http://localhost:5173/auth/google/callback` (ไม่ใช่ `http://localhost:3000`)
   - ไม่มี trailing slash `/`
   - ใช้ `http` ไม่ใช่ `https` สำหรับ localhost

2. **Client Secret:**

   - ต้องได้จาก Google Cloud Console เช่นกัน
   - ใส่ใน Backend environment variables

3. **Port:**
   - Frontend: `5173` (Vite default)
   - Backend: `3000`

## 🎉 เมื่อตั้งค่าเสร็จ

Google OAuth จะทำงานได้ดังนี้:

- คลิก "Continue with Google"
- Redirect ไป Google OAuth
- ล็อคอินที่ Google
- Redirect กลับมาที่ callback page
- ตั้งค่า auth state และ redirect ไปหน้า main

## 📞 หากยังมีปัญหา

1. **ตรวจสอบ Google Cloud Console:**

   - Redirect URIs ตรงกับ `http://localhost:5173/auth/google/callback` หรือไม่
   - JavaScript origins ตรงกับ `http://localhost:5173` หรือไม่

2. **ตรวจสอบ Environment Variables:**

   - Client ID และ Client Secret ถูกต้องหรือไม่
   - Redirect URI ตรงกับ Google Cloud Console หรือไม่

3. **ตรวจสอบ Network:**
   - ดู request/response ใน Developer Tools
   - ตรวจสอบ error messages
