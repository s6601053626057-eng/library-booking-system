const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper for simulated Auth token decoding
function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    return db.getUserById(decoded.id);
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสนักศึกษา/อีเมล และรหัสผ่าน' });
  }

  const users = db.getUsers();
  const user = users.find(
    u => (u.student_id.toLowerCase() === username.trim().toLowerCase() ||
          u.email.toLowerCase() === username.trim().toLowerCase()) &&
         u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'รหัสนักศึกษา/อีเมล หรือรหัสผ่านไม่ถูกต้อง' });
  }

  // Create demo token base64 encoded
  const tokenPayload = { id: user.id, student_id: user.student_id, role: user.role, name: user.name };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    message: `ยินดีต้อนรับ ${user.name}`,
    token,
    user: safeUser
  });
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { student_id, name, email, password, phone, department } = req.body;
    if (!student_id || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
    }

    const newUser = db.createUser({
      student_id,
      name,
      email,
      password,
      phone,
      department,
      role: 'student'
    });

    const tokenPayload = { id: newUser.id, student_id: newUser.student_id, role: newUser.role, name: newUser.name };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ ยินดีต้อนรับสู่ระบบห้องสมุด',
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Session หมดอายุหรือไม่ถูกต้อง' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// -------------------------------------------------------------
// Rooms Endpoints
// -------------------------------------------------------------
app.get('/api/rooms', (req, res) => {
  try {
    const { search, floor, capacity, status, equipment } = req.query;
    let eq = equipment;
    if (equipment && typeof equipment === 'string' && equipment.includes(',')) {
      eq = equipment.split(',').map(s => s.trim());
    }
    const rooms = db.getRooms({ search, floor, capacity, status, equipment: eq });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/rooms/:id', (req, res) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลห้อง' });
  }
  res.json({ success: true, data: room });
});

app.get('/api/rooms/:id/availability', (req, res) => {
  const roomId = req.params.id;
  const date = req.query.date || new Date().toISOString().split('T')[0];
  
  const room = db.getRoomById(roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'ไม่พบห้องที่ระบุ' });
  }

  // Get active bookings for this room on this date
  const bookings = db.getBookings({ room_id: room.id, date, status: 'all' })
    .filter(b => b.status !== 'cancelled')
    .map(b => ({
      booking_id: b.booking_id,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      user_name: b.user_name
    }));

  res.json({
    success: true,
    room_id: room.id,
    room_name: room.name,
    date,
    room_status: room.status,
    booked_slots: bookings
  });
});

app.post('/api/rooms', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเพิ่มห้องได้' });
    }

    const newRoom = db.createRoom(req.body);
    res.status(201).json({ success: true, message: 'เพิ่มห้องสำเร็จ', data: newRoom });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/rooms/:id', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขห้องได้' });
    }

    const updated = db.updateRoom(req.params.id, req.body);
    res.json({ success: true, message: 'อัปเดตข้อมูลห้องสำเร็จ', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบห้องได้' });
    }

    const deleted = db.deleteRoom(req.params.id);
    res.json({ success: true, message: 'ลบห้องเรียบร้อยแล้ว', data: deleted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/rooms/:id/status', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'สิทธิ์ไม่เพียงพอ' });
    }

    const { status } = req.body;
    if (!['available', 'booked', 'pending', 'maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    const updated = db.updateRoom(req.params.id, { status });
    res.json({ success: true, message: `เปลี่ยนสถานะห้องเป็น ${status} เรียบร้อย`, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Bookings Endpoints
// -------------------------------------------------------------
app.get('/api/bookings', (req, res) => {
  try {
    const user = getAuthUser(req);
    const { user_id, room_id, date, status } = req.query;

    let targetUserId = user_id;
    // If regular student without admin role, restrict to their own bookings
    if (user && user.role !== 'admin') {
      targetUserId = user.id;
    }

    const bookings = db.getBookings({ user_id: targetUserId, room_id, date, status });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการจอง' });
    }

    // Generate QR code data URL
    const qrPayload = JSON.stringify({
      booking_id: booking.booking_id,
      room_name: booking.room_name,
      student_id: booking.student_id,
      date: booking.booking_date,
      time: `${booking.start_time}-${booking.end_time}`,
      status: booking.status
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#1E3A8A', light: '#FFFFFF' }
    });

    res.json({ success: true, data: { ...booking, qr_code: qrDataUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/bookings/check-conflict', (req, res) => {
  const { room_id, booking_date, start_time, end_time, exclude_booking_id } = req.body;
  if (!room_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
  }

  const result = db.checkConflict(room_id, booking_date, start_time, end_time, exclude_booking_id);
  res.json({ success: true, ...result });
});

app.post('/api/bookings', async (req, res) => {
  try {
    const user = getAuthUser(req);
    const { room_id, booking_date, start_time, end_time, attendees, purpose } = req.body;

    if (!room_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลการจองให้ครบถ้วน' });
    }

    // Determine user: either from token or fallback to provided user_id
    const effectiveUserId = user ? user.id : req.body.user_id;
    if (!effectiveUserId) {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการจองห้อง' });
    }

    const booking = db.createBooking({
      room_id,
      user_id: effectiveUserId,
      booking_date,
      start_time,
      end_time,
      attendees,
      purpose
    });

    // Generate QR Code for immediate response
    const qrPayload = JSON.stringify({
      booking_id: booking.booking_id,
      room_name: booking.room_name,
      student_id: booking.student_id,
      date: booking.booking_date,
      time: `${booking.start_time}-${booking.end_time}`
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#1E3A8A', light: '#FFFFFF' }
    });

    res.status(201).json({
      success: true,
      message: 'จองห้องสำเร็จ! กรุณาบันทึก QR Code สำหรับเช็คอินหน้าห้อง',
      data: { ...booking, qr_code: qrDataUrl }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  try {
    const user = getAuthUser(req);
    const userId = user ? user.id : req.body.user_id;
    const role = user ? user.role : (req.body.role || 'student');

    if (!userId && role !== 'admin') {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
    }

    const cancelled = db.cancelBooking(req.params.id, userId, role);
    res.json({ success: true, message: 'ยกเลิกการจองเรียบร้อยแล้ว', data: cancelled });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/bookings/:id/status', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }

    const { status, notes } = req.body;
    const updated = db.updateBookingStatus(req.params.id, status, notes);
    res.json({ success: true, message: `อัปเดตสถานะเป็น ${status} สำเร็จ`, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// QR Code generation direct endpoint
app.get('/api/bookings/:id/qr', async (req, res) => {
  try {
    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการจอง' });
    }

    const qrPayload = JSON.stringify({
      booking_id: booking.booking_id,
      room_name: booking.room_name,
      student_id: booking.student_id,
      date: booking.booking_date,
      time: `${booking.start_time}-${booking.end_time}`,
      status: booking.status
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: { dark: '#1E3A8A', light: '#FFFFFF' }
    });

    res.json({ success: true, booking_id: booking.booking_id, qr_code: qrDataUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Admin Dashboard & Check-in Endpoints
// -------------------------------------------------------------
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = db.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/check-in', (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุรหัส Booking ID' });
    }

    const booking = db.getBookingById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: `ไม่พบการจองรหัส ${booking_id}` });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'การจองนี้ถูกยกเลิกแล้ว ไม่สามารถเช็คอินได้' });
    }

    if (booking.status === 'checked_in') {
      return res.status(400).json({ success: false, message: 'การจองนี้ทำการเช็คอินไปแล้ว' });
    }

    const updated = db.updateBookingStatus(booking.id, 'checked_in', 'สแกน QR Code เช็คอินที่หน้าห้อง');
    res.json({
      success: true,
      message: `เช็คอินสำเร็จ! ยินดีต้อนรับ ${booking.user_name} สู่ห้อง ${booking.room_name}`,
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Notifications Endpoints
// -------------------------------------------------------------
app.get('/api/notifications', (req, res) => {
  const user = getAuthUser(req);
  const userId = user ? user.id : req.query.user_id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
  }

  const notifs = db.getNotifications(userId);
  res.json({ success: true, count: notifs.length, data: notifs });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const updated = db.markNotificationRead(req.params.id);
  res.json({ success: true, data: updated });
});

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Library Room Booking System is running!`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`  Admin Demo: Student ID: ADMIN01 / Password: admin`);
  console.log(`  Student Demo: Student ID: 6601024 / Password: 123`);
  console.log(`=======================================================`);
});
