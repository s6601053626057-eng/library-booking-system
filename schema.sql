-- ====================================================================
-- University Library Room Booking System Database Schema
-- Compatible with PostgreSQL & MySQL (RDBMS Schema Reference)
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    phone VARCHAR(30),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'fas fa-tv'
);

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(150) NOT NULL,
    floor INT NOT NULL,
    equipment JSON, -- e.g. ["Projector", "TV", "Whiteboard", "Computer"]
    description TEXT,
    image TEXT,
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'pending', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendees INT DEFAULT 1,
    purpose VARCHAR(255),
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'checked_in')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_time_slot CHECK (start_time < end_time)
);

-- Index for booking conflict queries
CREATE INDEX IF NOT EXISTS idx_room_booking_date ON bookings(room_id, booking_date, status);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- Sample Seed Data
-- ====================================================================

INSERT INTO users (student_id, name, email, password, role, department) VALUES
('ADMIN01', 'ศ.ดร. สมเกียรติ พัฒนวงศ์ (Library Administrator)', 'admin@university.ac.th', 'admin123', 'admin', 'Library Information Services'),
('6601024', 'สมชาย ใจดี (Somchai Jaidee)', 'somchai.j@student.ac.th', 'student123', 'student', 'Faculty of Engineering'),
('6601089', 'พิมพ์มาดา วัฒนากุล (Pimmada Wattana)', 'pimmada.w@student.ac.th', 'student123', 'student', 'Faculty of Science');

INSERT INTO equipment (name, icon) VALUES
('Projector', 'fa-video'),
('Smart TV 65"', 'fa-tv'),
('Whiteboard', 'fa-chalkboard'),
('Computer Workstation', 'fa-desktop'),
('Video Conference System', 'fa-camera'),
('Sound System', 'fa-volume-high'),
('High-speed Wi-Fi', 'fa-wifi'),
('Power Outlets', 'fa-plug');

INSERT INTO rooms (room_id, name, capacity, location, floor, equipment, description, image, status) VALUES
('LIB-R101', 'Smart Study Room A', 4, 'Central Library, Zone A', 1, '["Whiteboard", "Smart TV 65\\"", "High-speed Wi-Fi", "Power Outlets"]', 'ห้องติวหนังสือขนาดกะทัดรัด เหมาะสำหรับกลุ่มย่อย 2-4 คน มีจอ Smart TV รองรับการต่อเชื่อมไร้สายและไวท์บอร์ดขนาดใหญ่', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', 'available'),
('LIB-R102', 'Collaborative Hub B', 6, 'Central Library, Zone A', 1, '["Projector", "Whiteboard", "High-speed Wi-Fi", "Power Outlets"]', 'ห้องระดมความคิดและทำงานกลุ่ม ออกแบบเพื่อการปรึกษาโปรเจกต์ มีโปรเจกเตอร์ความคมชัดสูงและโต๊ะปรับระดับได้', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 'available'),
('LIB-R201', 'Media & Presentation Room', 8, 'Central Library, Innovation Center', 2, '["Projector", "Smart TV 65\\"", "Video Conference System", "Sound System", "Whiteboard"]', 'ห้องพรีเซนเทชันและฝึกซ้อมการนำเสนอผลงานระดับโปร พร้อมระบบไมโครโฟนไร้สายและกล้องติดตามผู้พูดอัตโนมัติ', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', 'available'),
('LIB-R202', 'Digital Research Lab', 10, 'Central Library, Innovation Center', 2, '["Computer Workstation", "Smart TV 65\\"", "Whiteboard", "High-speed Wi-Fi"]', 'ห้องปฏิบัติการคอมพิวเตอร์และสืบค้นข้อมูลดิจิทัล ติดตั้งโปรแกรมสถิติและซอฟต์แวร์วิจัยสำหรับงานวิทยานิพนธ์', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', 'available'),
('LIB-R301', 'Executive Seminar Room', 16, 'Central Library, Academic Wing', 3, '["Projector", "Sound System", "Video Conference System", "Smart TV 65\\"", "Whiteboard"]', 'ห้องสัมมนาวิชาการขนาดใหญ่ เหมาะสำหรับการประชุมคณะทำงาน การสอบโครงงาน หรือเวิร์กช็อปพิเศษ', 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80', 'available'),
('LIB-R302', 'Quiet Focus Pod', 2, 'Central Library, Silent Study Wing', 3, '["Whiteboard", "High-speed Wi-Fi", "Power Outlets"]', 'ห้องศึกษาค้นคว้าส่วนตัวแบบกันเสียง เหมาะสำหรับการอ่านหนังสือสอบ สมาธิ และงานวิจัยเฉพาะบุคคล', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80', 'maintenance');
