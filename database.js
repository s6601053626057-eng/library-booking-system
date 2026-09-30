const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Default initial state with realistic data
const initialData = {
  users: [
    {
      id: 1,
      student_id: 'ADMIN01',
      name: 'ศ.ดร. สมเกียรติ พัฒนวงศ์ (Admin)',
      email: 'admin@university.ac.th',
      password: 'admin',
      role: 'admin',
      phone: '02-888-9999',
      department: 'สำนักวิทยบริการและห้องสมุดกลาง'
    },
    {
      id: 2,
      student_id: '6601024',
      name: 'สมชาย ใจดี (Somchai)',
      email: 'somchai.j@student.ac.th',
      password: '123',
      role: 'student',
      phone: '081-234-5678',
      department: 'คณะวิศวกรรมศาสตร์'
    },
    {
      id: 3,
      student_id: '6601089',
      name: 'พิมพ์มาดา วัฒนากุล (Pimmada)',
      email: 'pimmada.w@student.ac.th',
      password: '123',
      role: 'student',
      phone: '089-876-5432',
      department: 'คณะวิทยาศาสตร์'
    }
  ],
  rooms: [
    {
      id: 1,
      room_id: 'LIB-R101',
      name: 'Smart Study Room A',
      capacity: 4,
      location: 'Central Library ชั้น 1 (Zone A)',
      floor: 1,
      equipment: ['Smart TV 65"', 'Whiteboard', 'High-speed Wi-Fi', 'Power Outlets'],
      description: 'ห้องติวหนังสือกลุ่มย่อยขนาด 2-4 ที่นั่ง ติดตั้ง Smart TV 65 นิ้ว รองรับ AirPlay/Chromecast เหมาะสำหรับติวสอบและทำรายงาน',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      room_id: 'LIB-R102',
      name: 'Collaborative Hub B',
      capacity: 6,
      location: 'Central Library ชั้น 1 (Zone A)',
      floor: 1,
      equipment: ['Projector', 'Whiteboard', 'High-speed Wi-Fi', 'Power Outlets'],
      description: 'ห้องระดมความคิดสำหรับกลุ่มโปรเจกต์ โต๊ะทรงรีปรับเปลี่ยนรูปแบบได้ พร้อมกระดานกระจก Whiteboard เต็มผนัง',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      room_id: 'LIB-R201',
      name: 'Media & Presentation Room',
      capacity: 8,
      location: 'Central Library ชั้น 2 (Innovation Center)',
      floor: 2,
      equipment: ['Projector', 'Smart TV 65"', 'Video Conference System', 'Sound System', 'Whiteboard'],
      description: 'ห้องฝึกซ้อมการนำเสนอผลงานระดับมาตรฐาน มีระบบไมโครโฟนไร้สาย เครื่องเสียงสเตอริโอ และกล้องสำหรับ Hybrid Meeting',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      room_id: 'LIB-R202',
      name: 'Digital Research Lab',
      capacity: 10,
      location: 'Central Library ชั้น 2 (Innovation Center)',
      floor: 2,
      equipment: ['Computer Workstation', 'Smart TV 65"', 'Whiteboard', 'High-speed Wi-Fi'],
      description: 'ห้องสำหรับกลุ่มวิจัยที่มีคอมพิวเตอร์ Workstation สเปกสูง ติดตั้งโปรแกรมวิเคราะห์ข้อมูล SPSS, MATLAB, Python พร้อมจอแสดงผล',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      room_id: 'LIB-R301',
      name: 'Executive Seminar Room',
      capacity: 16,
      location: 'Central Library ชั้น 3 (Academic Wing)',
      floor: 3,
      equipment: ['Projector', 'Sound System', 'Video Conference System', 'Smart TV 65"', 'Whiteboard'],
      description: 'ห้องสัมมนาวิชาการขนาดใหญ่ เหมาะสำหรับการประชุมคณะกรรมการ การสอบวิทยานิพนธ์ หรือกิจกรรม Workshop แบบกลุ่มใหญ่',
      image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      room_id: 'LIB-R302',
      name: 'Quiet Focus Pod',
      capacity: 2,
      location: 'Central Library ชั้น 3 (Silent Study Wing)',
      floor: 3,
      equipment: ['Whiteboard', 'High-speed Wi-Fi', 'Power Outlets'],
      description: 'ห้องส่วนตัวเก็บเสียง 100% เหมาะสำหรับนักศึกษาที่ต้องการสมาธิขั้นสูงสุดในการเตรียมสอบหรือเขียนบทความวิจัย',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
      status: 'maintenance',
      created_at: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: 1,
      booking_id: 'LIB-20260928-001',
      user_id: 2,
      user_name: 'สมชาย ใจดี (Somchai)',
      student_id: '6601024',
      room_id: 1,
      room_name: 'Smart Study Room A',
      booking_date: '2026-09-28',
      start_time: '13:00',
      end_time: '15:00',
      attendees: 3,
      purpose: 'ติววิชา Calculus 2 ร่วมกับเพื่อนกลุ่มโครงงาน',
      status: 'confirmed',
      created_at: '2026-09-28T09:30:00.000Z'
    },
    {
      id: 2,
      booking_id: 'LIB-20260928-002',
      user_id: 3,
      user_name: 'พิมพ์มาดา วัฒนากุล (Pimmada)',
      student_id: '6601089',
      room_id: 2,
      room_name: 'Collaborative Hub B',
      booking_date: '2026-09-28',
      start_time: '15:30',
      end_time: '17:30',
      attendees: 5,
      purpose: 'ปรึกษางานวิจัย Senior Project',
      status: 'confirmed',
      created_at: '2026-09-28T10:15:00.000Z'
    },
    {
      id: 3,
      booking_id: 'LIB-20260929-001',
      user_id: 2,
      user_name: 'สมชาย ใจดี (Somchai)',
      student_id: '6601024',
      room_id: 3,
      room_name: 'Media & Presentation Room',
      booking_date: '2026-09-29',
      start_time: '10:00',
      end_time: '12:00',
      attendees: 6,
      purpose: 'ซ้อมนำเสนอผลงานสัมมนาวิศวกรรม',
      status: 'confirmed',
      created_at: '2026-09-28T11:00:00.000Z'
    },
    {
      id: 4,
      booking_id: 'LIB-20260929-002',
      user_id: 3,
      user_name: 'พิมพ์มาดา วัฒนากุล (Pimmada)',
      student_id: '6601089',
      room_id: 1,
      room_name: 'Smart Study Room A',
      booking_date: '2026-09-29',
      start_time: '14:00',
      end_time: '16:00',
      attendees: 4,
      purpose: 'อ่านหนังสือเตรียมสอบชีววิทยา',
      status: 'pending',
      created_at: '2026-09-28T11:45:00.000Z'
    },
    {
      id: 5,
      booking_id: 'LIB-20260925-001',
      user_id: 2,
      user_name: 'สมชาย ใจดี (Somchai)',
      student_id: '6601024',
      room_id: 4,
      room_name: 'Digital Research Lab',
      booking_date: '2026-09-25',
      start_time: '09:00',
      end_time: '11:00',
      attendees: 4,
      purpose: 'รันข้อมูลโมเดลจำลองด้วย MATLAB',
      status: 'completed',
      created_at: '2026-09-24T14:20:00.000Z'
    }
  ],
  notifications: [
    {
      id: 1,
      user_id: 2,
      message: 'ยินดีต้อนรับสู่ระบบจองห้องสมุด! การจอง LIB-20260928-001 สำหรับ Smart Study Room A ได้รับการยืนยันแล้ว',
      type: 'success',
      status: 'unread',
      created_at: '2026-09-28T09:30:00.000Z'
    },
    {
      id: 2,
      user_id: 3,
      message: 'การจอง LIB-20260929-002 กำลังรอการยืนยันจากเจ้าหน้าที่',
      type: 'info',
      status: 'unread',
      created_at: '2026-09-28T11:45:00.000Z'
    }
  ]
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.saveData(initialData);
    }
  }

  loadData() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.saveData(initialData);
        return JSON.parse(JSON.stringify(initialData));
      }
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading database file, resetting to initialData:', e);
      this.saveData(initialData);
      return JSON.parse(JSON.stringify(initialData));
    }
  }

  saveData(data) {
    const tmpFile = DB_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  // User queries
  getUsers() {
    return this.loadData().users;
  }

  getUserById(id) {
    return this.loadData().users.find(u => u.id === Number(id));
  }

  getUserByStudentId(studentId) {
    return this.loadData().users.find(
      u => u.student_id.toLowerCase() === String(studentId).toLowerCase()
    );
  }

  createUser(userData) {
    const data = this.loadData();
    const existing = data.users.find(
      u => u.student_id.toLowerCase() === userData.student_id.toLowerCase() ||
           u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existing) {
      throw new Error('รหัสนักศึกษาหรืออีเมลนี้มีอยู่ในระบบแล้ว');
    }
    const newUser = {
      id: data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      student_id: userData.student_id.trim(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password,
      role: userData.role || 'student',
      phone: userData.phone || '',
      department: userData.department || 'General'
    };
    data.users.push(newUser);
    this.saveData(data);
    return newUser;
  }

  // Room queries
  getRooms(filters = {}) {
    const data = this.loadData();
    let rooms = data.rooms;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      rooms = rooms.filter(
        r => r.name.toLowerCase().includes(q) ||
             r.room_id.toLowerCase().includes(q) ||
             r.location.toLowerCase().includes(q)
      );
    }

    if (filters.floor && filters.floor !== 'all') {
      rooms = rooms.filter(r => r.floor === Number(filters.floor));
    }

    if (filters.capacity && filters.capacity !== 'all') {
      const cap = Number(filters.capacity);
      if (cap === 4) rooms = rooms.filter(r => r.capacity <= 4);
      else if (cap === 8) rooms = rooms.filter(r => r.capacity > 4 && r.capacity <= 8);
      else if (cap === 16) rooms = rooms.filter(r => r.capacity > 8 && r.capacity <= 16);
      else if (cap === 17) rooms = rooms.filter(r => r.capacity > 16);
    }

    if (filters.status && filters.status !== 'all') {
      rooms = rooms.filter(r => r.status === filters.status);
    }

    if (filters.equipment) {
      const eqList = Array.isArray(filters.equipment) ? filters.equipment : [filters.equipment];
      rooms = rooms.filter(r =>
        eqList.every(eq => r.equipment.some(item => item.toLowerCase().includes(eq.toLowerCase())))
      );
    }

    return rooms;
  }

  getRoomById(id) {
    const data = this.loadData();
    return data.rooms.find(r => r.id === Number(id) || r.room_id === id);
  }

  createRoom(roomData) {
    const data = this.loadData();
    if (data.rooms.find(r => r.room_id.toUpperCase() === roomData.room_id.toUpperCase())) {
      throw new Error(`รหัสห้อง ${roomData.room_id} มีอยู่ในระบบแล้ว`);
    }

    const newRoom = {
      id: data.rooms.length ? Math.max(...data.rooms.map(r => r.id)) + 1 : 1,
      room_id: roomData.room_id.trim().toUpperCase(),
      name: roomData.name.trim(),
      capacity: Number(roomData.capacity),
      location: roomData.location.trim(),
      floor: Number(roomData.floor) || 1,
      equipment: Array.isArray(roomData.equipment) ? roomData.equipment : [],
      description: roomData.description || '',
      image: roomData.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      status: roomData.status || 'available',
      created_at: new Date().toISOString()
    };

    data.rooms.push(newRoom);
    this.saveData(data);
    return newRoom;
  }

  updateRoom(id, updateData) {
    const data = this.loadData();
    const index = data.rooms.findIndex(r => r.id === Number(id));
    if (index === -1) throw new Error('ไม่พบข้อมูลห้องที่ต้องการแก้ไข');

    data.rooms[index] = {
      ...data.rooms[index],
      name: updateData.name !== undefined ? updateData.name.trim() : data.rooms[index].name,
      capacity: updateData.capacity !== undefined ? Number(updateData.capacity) : data.rooms[index].capacity,
      location: updateData.location !== undefined ? updateData.location.trim() : data.rooms[index].location,
      floor: updateData.floor !== undefined ? Number(updateData.floor) : data.rooms[index].floor,
      equipment: updateData.equipment !== undefined ? updateData.equipment : data.rooms[index].equipment,
      description: updateData.description !== undefined ? updateData.description : data.rooms[index].description,
      image: updateData.image !== undefined ? updateData.image : data.rooms[index].image,
      status: updateData.status !== undefined ? updateData.status : data.rooms[index].status
    };

    this.saveData(data);
    return data.rooms[index];
  }

  deleteRoom(id) {
    const data = this.loadData();
    const index = data.rooms.findIndex(r => r.id === Number(id));
    if (index === -1) throw new Error('ไม่พบห้องที่ต้องการลบ');

    // Check if there are active bookings
    const activeBookings = data.bookings.filter(
      b => b.room_id === Number(id) && (b.status === 'confirmed' || b.status === 'pending')
    );
    if (activeBookings.length > 0) {
      throw new Error(`ไม่สามารถลบห้องนี้ได้เนื่องจากยังมีการจองที่รอดำเนินการอยู่ (${activeBookings.length} รายการ)`);
    }

    const deleted = data.rooms.splice(index, 1)[0];
    this.saveData(data);
    return deleted;
  }

  // Booking queries & conflict validation
  getBookings(filters = {}) {
    const data = this.loadData();
    let bookings = data.bookings;

    if (filters.user_id) {
      bookings = bookings.filter(b => b.user_id === Number(filters.user_id));
    }
    if (filters.room_id) {
      bookings = bookings.filter(b => b.room_id === Number(filters.room_id));
    }
    if (filters.date) {
      bookings = bookings.filter(b => b.booking_date === filters.date);
    }
    if (filters.status && filters.status !== 'all') {
      bookings = bookings.filter(b => b.status === filters.status);
    }

    // Sort by booking_date desc, start_time desc
    return bookings.sort((a, b) => {
      const dtA = `${a.booking_date}T${a.start_time}`;
      const dtB = `${b.booking_date}T${b.start_time}`;
      return dtB.localeCompare(dtA);
    });
  }

  getBookingById(id) {
    const data = this.loadData();
    return data.bookings.find(b => b.id === Number(id) || b.booking_id === id);
  }

  // Helper to convert time "HH:MM" to minutes for reliable comparison
  timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  checkConflict(roomId, bookingDate, startTime, endTime, excludeBookingId = null) {
    const data = this.loadData();
    const newStart = this.timeToMinutes(startTime);
    const newEnd = this.timeToMinutes(endTime);

    if (newStart >= newEnd) {
      return { conflict: true, reason: 'เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด' };
    }

    // Check room status
    const room = data.rooms.find(r => r.id === Number(roomId));
    if (!room) {
      return { conflict: true, reason: 'ไม่พบห้องที่ระบุ' };
    }
    if (room.status === 'maintenance') {
      return { conflict: true, reason: 'ห้องนี้ปิดปรับปรุงชั่วคราว ไม่สามารถจองได้' };
    }

    // Check if date/time is in the past
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (bookingDate < todayStr) {
      return { conflict: true, reason: 'ไม่สามารถเลือกวันจองย้อนหลังได้' };
    }
    if (bookingDate === todayStr && newStart < currentMinutes) {
      return { conflict: true, reason: 'ไม่สามารถจองช่วงเวลาที่ผ่านไปแล้วในวันนี้ได้' };
    }

    // Check conflicts with existing confirmed or pending bookings
    const overlapping = data.bookings.filter(b => {
      if (excludeBookingId && (b.id === Number(excludeBookingId) || b.booking_id === excludeBookingId)) {
        return false;
      }
      if (b.room_id !== Number(roomId)) return false;
      if (b.booking_date !== bookingDate) return false;
      if (b.status === 'cancelled') return false; // Cancelled bookings don't block

      const existingStart = this.timeToMinutes(b.start_time);
      const existingEnd = this.timeToMinutes(b.end_time);

      // Overlap condition: (StartA < EndB) && (EndA > StartB)
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (overlapping.length > 0) {
      const conflictBooking = overlapping[0];
      return {
        conflict: true,
        reason: `ห้องนี้ถูกจองแล้วในช่วงเวลา ${conflictBooking.start_time} - ${conflictBooking.end_time} โดย ${conflictBooking.user_name}`,
        conflictDetails: conflictBooking
      };
    }

    return { conflict: false };
  }

  generateBookingId(bookingDate) {
    const data = this.loadData();
    const cleanDate = bookingDate.replace(/-/g, '');
    const prefix = `LIB-${cleanDate}-`;
    const countToday = data.bookings.filter(b => b.booking_id.startsWith(prefix)).length + 1;
    return `${prefix}${String(countToday).padStart(3, '0')}`;
  }

  createBooking(bookingData) {
    const data = this.loadData();
    const conflictCheck = this.checkConflict(
      bookingData.room_id,
      bookingData.booking_date,
      bookingData.start_time,
      bookingData.end_time
    );

    if (conflictCheck.conflict) {
      throw new Error(conflictCheck.reason);
    }

    const room = data.rooms.find(r => r.id === Number(bookingData.room_id));
    const user = data.users.find(u => u.id === Number(bookingData.user_id));

    if (!room) throw new Error('ไม่พบข้อมูลห้อง');
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');

    if (bookingData.attendees && Number(bookingData.attendees) > room.capacity) {
      throw new Error(`จำนวนผู้ใช้งาน (${bookingData.attendees} คน) เกินความจุของห้อง (${room.capacity} คน)`);
    }

    const bookingId = this.generateBookingId(bookingData.booking_date);
    const newBooking = {
      id: data.bookings.length ? Math.max(...data.bookings.map(b => b.id)) + 1 : 1,
      booking_id: bookingId,
      user_id: user.id,
      user_name: user.name,
      student_id: user.student_id,
      room_id: room.id,
      room_name: room.name,
      booking_date: bookingData.booking_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      attendees: Number(bookingData.attendees) || 1,
      purpose: bookingData.purpose ? bookingData.purpose.trim() : 'ค้นคว้าและอ่านหนังสือ',
      status: 'confirmed', // Confirmed right away or pending if university review
      created_at: new Date().toISOString()
    };

    data.bookings.push(newBooking);

    // Create confirmation notification
    const notification = {
      id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
      user_id: user.id,
      message: `การจองสำเร็จ! รหัส ${bookingId} สำหรับ ${room.name} วันที่ ${bookingData.booking_date} เวลา ${bookingData.start_time}-${bookingData.end_time}`,
      type: 'success',
      status: 'unread',
      created_at: new Date().toISOString()
    };
    data.notifications.push(notification);

    this.saveData(data);
    return newBooking;
  }

  updateBookingStatus(id, status, notes = '') {
    const data = this.loadData();
    const index = data.bookings.findIndex(b => b.id === Number(id) || b.booking_id === id);
    if (index === -1) throw new Error('ไม่พบข้อมูลการจอง');

    const booking = data.bookings[index];
    booking.status = status;
    booking.updated_at = new Date().toISOString();

    // Notify user
    let notifMsg = `การจอง ${booking.booking_id} สถานะเปลี่ยนเป็น: ${status}`;
    if (status === 'confirmed') notifMsg = `การจอง ${booking.booking_id} สำหรับ ${booking.room_name} ได้รับการอนุมัติแล้ว`;
    if (status === 'cancelled') notifMsg = `การจอง ${booking.booking_id} สำหรับ ${booking.room_name} ถูกยกเลิกแล้ว ${notes ? `(${notes})` : ''}`;
    if (status === 'checked_in') notifMsg = `เช็คอินเข้าใช้ห้อง ${booking.room_name} สำเร็จเรียบร้อยแล้ว`;

    data.notifications.push({
      id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
      user_id: booking.user_id,
      message: notifMsg,
      type: status === 'cancelled' ? 'warning' : 'info',
      status: 'unread',
      created_at: new Date().toISOString()
    });

    this.saveData(data);
    return booking;
  }

  cancelBooking(id, userId, role = 'student') {
    const data = this.loadData();
    const booking = data.bookings.find(b => b.id === Number(id) || b.booking_id === id);
    if (!booking) throw new Error('ไม่พบข้อมูลการจอง');

    if (role !== 'admin' && booking.user_id !== Number(userId)) {
      throw new Error('ท่านไม่มีสิทธิ์ยกเลิกการจองของผู้อื่น');
    }

    if (booking.status === 'cancelled') {
      throw new Error('รายการนี้ถูกยกเลิกไปแล้ว');
    }

    booking.status = 'cancelled';
    booking.cancelled_at = new Date().toISOString();

    data.notifications.push({
      id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
      user_id: booking.user_id,
      message: `ท่านได้ยกเลิกการจอง ${booking.booking_id} สำหรับ ${booking.room_name} เรียบร้อยแล้ว`,
      type: 'warning',
      status: 'unread',
      created_at: new Date().toISOString()
    });

    this.saveData(data);
    return booking;
  }

  // Dashboard & Statistics
  getAdminStats() {
    const data = this.loadData();
    const totalRooms = data.rooms.length;
    const availableRooms = data.rooms.filter(r => r.status === 'available').length;
    const maintenanceRooms = data.rooms.filter(r => r.status === 'maintenance').length;

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = data.bookings.filter(b => b.booking_date === today && b.status !== 'cancelled').length;
    const pendingBookings = data.bookings.filter(b => b.status === 'pending').length;

    // Room popularity (Most booked rooms)
    const roomBookingsCount = {};
    data.rooms.forEach(r => { roomBookingsCount[r.name] = 0; });
    data.bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        roomBookingsCount[b.room_name] = (roomBookingsCount[b.room_name] || 0) + 1;
      }
    });

    // Peak hours calculation (08:00 - 21:00)
    const hourCounts = {};
    for (let h = 8; h <= 20; h++) {
      const slot = `${String(h).padStart(2, '0')}:00`;
      hourCounts[slot] = 0;
    }
    data.bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        const startH = parseInt(b.start_time.split(':')[0], 10);
        const endH = parseInt(b.end_time.split(':')[0], 10);
        for (let h = startH; h < endH; h++) {
          const slot = `${String(h).padStart(2, '0')}:00`;
          if (hourCounts[slot] !== undefined) {
            hourCounts[slot] += 1;
          }
        }
      }
    });

    // Daily bookings for last 7 days
    const dailyBookings = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyBookings[dateStr] = data.bookings.filter(b => b.booking_date === dateStr && b.status !== 'cancelled').length;
    }

    return {
      summary: {
        totalRooms,
        availableRooms,
        maintenanceRooms,
        todayBookings,
        pendingBookings,
        totalBookings: data.bookings.length,
        utilizationRate: totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0
      },
      mostBookedRooms: Object.entries(roomBookingsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      peakHours: hourCounts,
      dailyBookings,
      roomStatusDistribution: {
        available: availableRooms,
        maintenance: maintenanceRooms,
        booked: data.rooms.filter(r => r.status === 'booked').length,
        pending: data.rooms.filter(r => r.status === 'pending').length
      }
    };
  }

  // Notifications
  getNotifications(userId) {
    const data = this.loadData();
    return data.notifications
      .filter(n => n.user_id === Number(userId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  markNotificationRead(id) {
    const data = this.loadData();
    const notif = data.notifications.find(n => n.id === Number(id));
    if (notif) {
      notif.status = 'read';
      this.saveData(data);
    }
    return notif;
  }
}

module.exports = new Database();
