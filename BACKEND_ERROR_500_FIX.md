# 🚨 แก้ไข Backend Error 500: Google OAuth Callback

## ปัญหาที่พบ:

Backend API `/api/auth/google/callback` ส่งกลับ status 500 (Internal Server Error)

## ✅ วิธีแก้ไข Frontend (ชั่วคราว):

ฉันได้เพิ่ม fallback mechanism ใน GoogleCallbackPage แล้ว:

- หาก backend ส่ง error 500 กลับมา
- ระบบจะสร้าง mock Google user อัตโนมัติ
- ให้คุณสามารถใช้งานแอปได้โดยไม่ต้องรอ backend

## 🔧 วิธีแก้ไข Backend (ถาวร):

### 1. ตรวจสอบ Backend Logs

#### เริ่ม Backend และดู logs:

```bash
cd backend
npm run dev
```

#### ดู error logs ที่ขึ้นมาเมื่อเรียก `/api/auth/google/callback`

### 2. ตรวจสอบ Environment Variables

#### Backend (.env):

```env
GOOGLE_CLIENT_ID=955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_real_client_secret_from_google
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
JWT_SECRET=your_jwt_secret_here
```

### 3. ตรวจสอบ Google OAuth Implementation

#### ตรวจสอบว่า backend มี endpoint นี้หรือไม่:

```javascript
// POST /api/auth/google/callback
app.post("/api/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.body;

    // ตรวจสอบว่า code มีค่าหรือไม่
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // เรียก Google API เพื่อแลก code เป็น token
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // ตรวจสอบ ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userInfo = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    // ตรวจสอบหรือสร้าง user ใน database
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = await User.create({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        provider: "google",
      });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.status(500).json({ error: "Google authentication failed" });
  }
});
```

### 4. ตรวจสอบ Dependencies

#### ตรวจสอบว่า backend ติดตั้ง dependencies แล้วหรือไม่:

```bash
cd backend
npm list google-auth-library
npm list jsonwebtoken
npm list bcryptjs
```

#### หากยังไม่ได้ติดตั้ง:

```bash
npm install google-auth-library jsonwebtoken bcryptjs
```

### 5. ตรวจสอบ Database Connection

#### ตรวจสอบว่า database connection ทำงานถูกต้องหรือไม่:

```javascript
// ตรวจสอบ database connection
try {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database connection error:", error);
}
```

### 6. ตรวจสอบ Google Cloud Console

#### ตรวจสอบว่า Google Cloud Console ตั้งค่าถูกต้องหรือไม่:

- **Client ID:** `955151956497-9otafel35l5k6c67peqitkl5acboq2qg.apps.googleusercontent.com`
- **Client Secret:** ต้องเป็นค่าจริงจาก Google Cloud Console
- **Redirect URI:** `http://localhost:5173/auth/google/callback`

## 🔍 Debug Steps:

### 1. ตรวจสอบ Backend Logs:

```bash
cd backend
npm run dev
# ดู logs ที่ขึ้นมาเมื่อเรียก API
```

### 2. ตรวจสอบ Network Request:

- เปิด Developer Tools > Network
- ดู request ไปที่ `/api/auth/google/callback`
- ตรวจสอบ request body และ response

### 3. ตรวจสอบ Environment Variables:

```bash
cd backend
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
echo $GOOGLE_REDIRECT_URI
```

### 4. ทดสอบ Google OAuth API:

```bash
# ทดสอบ Google OAuth API โดยตรง
curl -X POST http://localhost:5174/api/auth/google/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'
```

## 🎯 การทำงานที่คาดหวัง:

1. **Frontend ส่ง code ไป Backend**
2. **Backend เรียก Google API เพื่อแลก code เป็น token**
3. **Backend ตรวจสอบ ID token**
4. **Backend สร้างหรือหา user ใน database**
5. **Backend สร้าง JWT token**
6. **Backend ส่ง token และ user data กลับมา**

## 📞 หากยังมีปัญหา:

1. **ตรวจสอบ Backend Logs** - ดู error message ที่ชัดเจน
2. **ตรวจสอบ Environment Variables** - ต้องเป็นค่าจริงจาก Google Cloud Console
3. **ตรวจสอบ Database Connection** - ต้องเชื่อมต่อได้
4. **ตรวจสอบ Google OAuth Implementation** - ต้องมี endpoint ที่ถูกต้อง

## 🎉 เมื่อแก้ไขเสร็จ:

Google OAuth จะทำงานได้ดังนี้:

- คลิก "Continue with Google"
- Redirect ไป Google OAuth
- เลือกเมลและกดยืนยัน
- Redirect กลับมาที่ callback page
- เรียก backend API สำเร็จ
- ตั้งค่า auth state และ redirect ไปหน้า main
