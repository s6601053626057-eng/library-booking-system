# 📚 University Library Room Booking System (ระบบจองห้องห้องสมุดมหาวิทยาลัย)

ระบบจองห้องศึกษาค้นคว้าและห้องประชุมกลุ่มสำหรับห้องสมุดมหาวิทยาลัย ออกแบบในสไตล์ **Modern University Library** สะอาด ทันสมัย ใช้งานง่าย มีระบบตรวจสอบการจองซ้ำซ้อน (Conflict Prevention) การสร้างรหัสและ QR Code อัตโนมัติ รวมถึงแดชบอร์ดสถิติสำหรับผู้ดูแลระบบ

---

## 🚀 คุณสมบัติเด่นของระบบ (Key Features)

### 1. ฝั่งนักศึกษา (Student / User)
- **ค้นหาและกรองห้อง (Room Search & Filters):** ค้นหาตามชื่อห้อง, รหัสห้อง, ชั้น (Floor 1-3), ขนาดความจุ (1-4, 5-8, 9-16 ที่นั่ง), สถานะห้อง, และอุปกรณ์ (Smart TV, Projector, Whiteboard, Computer, Hybrid Conference)
- **ตรวจสอบตารางเวลาว่าง (Visual Slot Matrix):** แสดงช่วงเวลา 08:00 - 21:00 แบบเรียลไทม์ พร้อมแถบสีสถานะ (🟢 ว่าง, 🔴 มีผู้จองแล้ว, ⚫ ผ่านไปแล้ว)
- **ระบบป้องกันการจองซ้ำ (Conflict Prevention):** ตรวจสอบช่วงเวลาซ้อนทับ `(StartA < EndB && EndA > StartB)`, ป้องกันการจองย้อนหลัง, ป้องกันห้องที่ปิดปรับปรุง
- **รับ Booking ID และ QR Code ทันที:** สร้างรหัสจองรูปแบบ `LIB-YYYYMMDD-XXX` พร้อม QR Code ความละเอียดสูงสำหรับบันทึกหรือพิมพ์เป็นบัตรผ่านเข้าห้อง
- **การจองของฉัน (My Bookings):** แยกหมวดหมู่ Upcoming (ที่จะมาถึง), Completed (ใช้งานแล้ว), Cancelled (ยกเลิกแล้ว) พร้อมฟังก์ชันยกเลิกการจองได้ด้วยตนเอง
- **ระบบแจ้งเตือน (Notifications):** แจ้งเตือนเมื่อจองสำเร็จ, เมื่อได้รับการอนุมัติ, หรือเมื่อยกเลิกการจอง

### 2. ฝั่งผู้ดูแลระบบ (Admin)
- **แดชบอร์ดสถิติ (Admin Dashboard & Analytics):**
  - KPI Cards: จำนวนห้องทั้งหมด, ห้องว่างพร้อมใช้ (🟢), รายการจองวันนี้, รายการรอการยืนยัน (🟡), อัตราการใช้ห้อง (Utilization Rate)
  - กราฟสถิติด้วย **Chart.js**:
    1. สถิติแนวโน้มการจองรายวัน (Daily Bookings Trend)
    2. ห้องที่ถูกจองมากที่สุด (Most Booked Rooms)
    3. ช่วงเวลาที่มีการใช้งานหนาแน่นที่สุด (Peak Hours 08:00 - 20:00)
    4. สัดส่วนสถานะห้อง (Room Status Breakdown)
- **จัดการการจอง (Bookings Management):** ค้นหาและกรองรายการจอง, กดอนุมัติ (Confirm), กดยกเลิก (Cancel), หรือกดเช็คอิน
- **จุดสแกนเช็คอินหน้าห้อง (QR Check-In Terminal Simulator):** สแกนหรือพิมพ์ Booking ID เพื่อเช็คอินนักศึกษาเข้าใช้งานห้องได้ทันที
- **จัดการห้องสมุด (Manage Rooms CRUD):** เพิ่มห้องใหม่, แก้ไขข้อมูลห้อง/รูปภาพ/อุปกรณ์, เปิด/ปิดสถานะปรับปรุง (Maintenance Mode), ลบห้อง

---

## 🎨 สถานะสีของห้อง (Status Indicators)
* 🟢 **Available** = ห้องว่าง พร้อมให้จอง
* 🔴 **Booked** = มีผู้จองแล้วในช่วงเวลานั้น
* 🟡 **Pending** = รอการยืนยันจากเจ้าหน้าที่
* ⚫ **Maintenance** = ปิดปรับปรุงชั่วคราว

---

## 🔑 บัญชีทดสอบระบบ (Demo Accounts)

ระบบมีปุ่ม **1-Click Quick Login** ที่มุมขวาบนของหน้าเว็บ หรือสามารถเข้าสู่ระบบด้วยรหัสด้านล่างนี้:

| บทบาท (Role) | รหัสนักศึกษา / Username | รหัสผ่าน (Password) | คำอธิบาย |
|---|---|---|---|
| **Student (นักศึกษา)** | `6601024` | `123` | สมชาย ใจดี (คณะวิศวกรรมศาสตร์) |
| **Student (นักศึกษา)** | `6601089` | `123` | พิมพ์มาดา วัฒนากุล (คณะวิทยาศาสตร์) |
| **Admin (ผู้ดูแลระบบ)** | `ADMIN01` | `admin` | ศ.ดร. สมเกียรติ พัฒนวงศ์ (ห้องสมุดกลาง) |

---

## 🛠️ โครงสร้างเทคโนโลยี (Tech Stack)

* **Frontend:** Vanilla HTML5, Modern CSS (Design System ด้วย CSS Variables, Glassmorphism, Responsive Grid), JavaScript (ES6+ Module Architecture)
* **Icons & Fonts:** Font Awesome 6.5, Google Fonts (Kanit & Inter)
* **Data Visualizations:** Chart.js 4.4
* **QR Code:** `qrcode` library สำหรับ Node.js
* **Backend:** Node.js (v24 LTS) + Express.js RESTful API
* **Database:** 
  - ระบบปัจจุบัน: JSON Relational Engine พร้อม ACID Atomic Write File Persistence
  - ไฟล์ `schema.sql`: รองรับการต่อยอดสู่ **PostgreSQL** หรือ **MySQL** ได้ทันที

---

## 📂 โครงสร้างโฟลเดอร์ (Directory Structure)

```
library-booking-system/
├── package.json              # กำหนด Dependencies (express, cors, qrcode)
├── server.js                 # Express Backend REST API & Static Server
├── database.js               # Database Engine, Seeding, Conflict Checking, Stats
├── database.json             # แหล่งเก็บข้อมูล (Auto-generated)
├── schema.sql                # SQL Schema รองรับ PostgreSQL & MySQL
├── README.md                 # คู่มือการติดตั้งและการใช้งาน
└── public/                   # Frontend Web Application
    ├── index.html            # โครงสร้างหน้าเว็บ SPA พร้อมโมดอลและส่วนแสดงผล
    ├── css/
    │   └── style.css         # ระบบสไตล์ Modern University Library & Responsive Layout
    └── js/
        ├── api.js            # Client API Fetch Wrapper
        ├── app.js            # Router, Auth State, Modals & Toast Controller
        ├── student.js        # ห้องสมุด, ตารางเวลาว่าง, ระบบจอง & My Bookings
        └── admin.js          # แดชบอร์ดสถิติ Chart.js, จัดการห้อง, QR Check-in
```

---

## ⚡ วิธีเปิดใช้งานระบบ (How to Run)

1. เปิด PowerShell หรือ Command Prompt เข้าไปยังโฟลเดอร์โปรเจกต์:
   ```powershell
   cd "C:\Users\user\.gemini\antigravity\scratch\library-booking-system"
   ```

2. ติดตั้งแพ็กเกจ (หากยังไม่ได้ติดตั้ง):
   ```powershell
   npm install
   ```

3. เริ่มการทำงานของเซิร์ฟเวอร์:
   ```powershell
   npm start
   ```

4. เปิดบราวเซอร์ไปที่:
   ```
   http://localhost:5000
   ```

---

## 📡 สรุป REST API Endpoints

### 🔐 Authentication
* `POST /api/auth/login` - เข้าสู่ระบบ (รับ JWT/Token และ User Profile)
* `POST /api/auth/register` - ลงทะเบียนนักศึกษาใหม่
* `GET /api/auth/me` - ตรวจสอบ Session ผู้ใช้ปัจจุบัน

### 🚪 Rooms
* `GET /api/rooms` - ดึงรายการห้องทั้งหมด (รองรับ Query: `search`, `floor`, `capacity`, `status`, `equipment`)
* `GET /api/rooms/:id` - ดึงรายละเอียดห้อง
* `GET /api/rooms/:id/availability?date=YYYY-MM-DD` - ตรวจสอบเวลาที่ถูกจองแล้วในวันที่ระบุ
* `POST /api/rooms` - เพิ่มห้องใหม่ (Admin)
* `PUT /api/rooms/:id` - แก้ไขข้อมูลห้อง (Admin)
* `DELETE /api/rooms/:id` - ลบห้อง (Admin)
* `PATCH /api/rooms/:id/status` - เปลี่ยนสถานะห้อง / เปิด-ปิดปรับปรุง (Admin)

### 📅 Bookings
* `GET /api/bookings` - ดึงรายการจอง (กรองตามผู้ใช้, ห้อง, วันที่, สถานะ)
* `GET /api/bookings/:id` - ดึงข้อมูลการจองพร้อม QR Code
* `POST /api/bookings/check-conflict` - ตรวจสอบช่วงเวลาซ้ำซ้อนล่วงหน้า
* `POST /api/bookings` - สร้างรายการจองใหม่ (พร้อมสร้าง Booking ID และ QR Code)
* `POST /api/bookings/:id/cancel` - ยกเลิกการจอง
* `PATCH /api/bookings/:id/status` - ปรับสถานะการจอง (confirmed, cancelled, checked_in)

### 📊 Admin & Terminal
* `GET /api/admin/stats` - สรุปสถิติสำหรับ Dashboard และกราฟ Chart.js
* `POST /api/admin/check-in` - เช็คอินด้วย Booking ID หรือ QR Code
