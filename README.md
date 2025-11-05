# Kanban Board (Frontend Only)

This repository now contains only the Frontend (Vue 3 + TypeScript + Vite + Pinia).
The Backend has been moved to a separate repository:

- https://github.com/markzzzforeducation/Kanban-Board-Backend

## Prerequisites

- Node.js 18+
- npm 9+

## Quick Start

### 1. Clone และ Install Dependencies

```bash
git clone <repository-url>
cd kanban-board
npm install
```

### 2. ตั้งค่า Environment Variables

**⚠️ สำคัญ:** ต้องสร้างไฟล์ `.env` ก่อนรันโปรเจค

```bash
# สร้างไฟล์ .env จาก template
cp env.example .env
```

หรือสร้างไฟล์ `.env` ใหม่แล้วใส่เนื้อหาดังนี้:

```env
# Frontend Environment Variables
VITE_API_BASE=http://localhost:5174
NEXT_PUBLIC_API_BASE=http://localhost:5174
```

**หมายเหตุ:**

- Vite ใช้ prefix `VITE_` สำหรับ environment variables
- ไฟล์ `.env` จะไม่ถูก commit (อยู่ใน .gitignore)
- ต้อง restart dev server หลังแก้ไข `.env`

### 3. เริ่ม Frontend

```bash
npm run dev
```

### 4. ตั้งค่า Backend

Backend ต้องรันแยกต่างหาก (ดูที่ backend repository)

## 🍎 สำหรับผู้ใช้ Mac

หากพบปัญหา Google OAuth login ไม่ทำงานบน Mac โปรดดู [MAC_SETUP_GUIDE.md](./MAC_SETUP_GUIDE.md) สำหรับคำแนะนำเฉพาะ

## Backend API

Base URL (default): `http://localhost:5174`

Auth

- POST `/api/auth/register` { name, email, password }
- POST `/api/auth/login` { email, password } → returns `{ token, user }`

Boards (requires `Authorization: Bearer <token>`)

- GET `/api/boards`
- POST `/api/boards` { name }
- PUT `/api/boards/:id` { name }
- DELETE `/api/boards/:id`

## Run both concurrently (optional)

You can run the backend separately from the backend repository.

## Switching DB to Postgres/MySQL

In the backend repository, edit `.env`:

- Postgres: `DATABASE_PROVIDER=postgresql`, `DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public`
- MySQL: `DATABASE_PROVIDER=mysql`, `DATABASE_URL=mysql://user:pass@host:3306/db`

Run migrations again:

```bash
cd backend
npx prisma migrate dev --name switch-sql
```
