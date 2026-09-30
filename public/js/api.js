// API Service Layer
const API = {
  getToken() {
    return localStorage.getItem('lib_auth_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('lib_auth_token', token);
    } else {
      localStorage.removeItem('lib_auth_token');
    }
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem('lib_auth_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('lib_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lib_auth_user');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth
  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data;
  },

  async register(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data;
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  logout() {
    this.setToken(null);
    this.setCurrentUser(null);
  },

  // Rooms
  async getRooms(params = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.floor) q.append('floor', params.floor);
    if (params.capacity) q.append('capacity', params.capacity);
    if (params.status) q.append('status', params.status);
    if (params.equipment && params.equipment.length) {
      q.append('equipment', params.equipment.join(','));
    }
    return this.request(`/api/rooms?${q.toString()}`);
  },

  async getRoom(id) {
    return this.request(`/api/rooms/${id}`);
  },

  async getRoomAvailability(id, date) {
    return this.request(`/api/rooms/${id}/availability?date=${date}`);
  },

  async createRoom(roomData) {
    return this.request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  },

  async updateRoom(id, roomData) {
    return this.request(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  },

  async deleteRoom(id) {
    return this.request(`/api/rooms/${id}`, {
      method: 'DELETE'
    });
  },

  async setRoomStatus(id, status) {
    return this.request(`/api/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Bookings
  async getBookings(params = {}) {
    const q = new URLSearchParams();
    if (params.user_id) q.append('user_id', params.user_id);
    if (params.room_id) q.append('room_id', params.room_id);
    if (params.date) q.append('date', params.date);
    if (params.status) q.append('status', params.status);
    return this.request(`/api/bookings?${q.toString()}`);
  },

  async getBooking(id) {
    return this.request(`/api/bookings/${id}`);
  },

  async checkConflict(payload) {
    return this.request('/api/bookings/check-conflict', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async createBooking(bookingData) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  async cancelBooking(id) {
    return this.request(`/api/bookings/${id}/cancel`, {
      method: 'POST'
    });
  },

  async updateBookingStatus(id, status, notes = '') {
    return this.request(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  async getBookingQr(id) {
    return this.request(`/api/bookings/${id}/qr`);
  },

  // Admin
  async getAdminStats() {
    return this.request('/api/admin/stats');
  },

  async checkInBooking(bookingId) {
    return this.request('/api/admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId })
    });
  },

  // Notifications
  async getNotifications() {
    return this.request('/api/notifications');
  },

  async markNotificationRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }
};
