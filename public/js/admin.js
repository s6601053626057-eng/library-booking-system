// Admin Dashboard, Analytics, Room Management, and Check-In System
const AdminUI = {
  charts: {},
  allBookings: [],
  allRooms: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Admin bookings search & filter
    const searchInput = document.getElementById('adminBookingsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterBookingsTable());
    }

    const statusFilter = document.getElementById('adminBookingsStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterBookingsTable());
    }

    // Add room form
    const addRoomForm = document.getElementById('addRoomForm');
    if (addRoomForm) {
      addRoomForm.addEventListener('submit', (e) => this.handleSaveRoom(e));
    }

    // Check-in simulator form
    const checkInForm = document.getElementById('adminCheckInForm');
    if (checkInForm) {
      checkInForm.addEventListener('submit', (e) => this.handleCheckIn(e));
    }

    // Admin tabs (Dashboard vs Manage Rooms)
    const adminNavBtns = document.querySelectorAll('.admin-subnav-btn');
    adminNavBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        adminNavBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const tab = e.currentTarget.dataset.tab;
        document.getElementById('adminDashboardTab').style.display = tab === 'dashboard' ? 'block' : 'none';
        document.getElementById('adminRoomsTab').style.display = tab === 'rooms' ? 'block' : 'none';
        if (tab === 'rooms') {
          this.loadManageRooms();
        }
      });
    });
  },

  async loadDashboard() {
    const user = API.getCurrentUser();
    if (!user || user.role !== 'admin') {
      App.toast('เฉพาะเจ้าหน้าที่ผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงส่วนนี้ได้', 'error');
      App.switchView('homeView');
      return;
    }

    try {
      const [statsRes, bookingsRes] = await Promise.all([
        API.getAdminStats(),
        API.getBookings()
      ]);

      const stats = statsRes.data;
      this.allBookings = bookingsRes.data;

      // Update KPI Cards
      document.getElementById('adminStatTotalRooms').textContent = stats.summary.totalRooms;
      document.getElementById('adminStatAvailRooms').textContent = stats.summary.availableRooms;
      document.getElementById('adminStatTodayBookings').textContent = stats.summary.todayBookings;
      document.getElementById('adminStatPendingBookings').textContent = stats.summary.pendingBookings;
      
      const utilEl = document.getElementById('adminStatUtilization');
      if (utilEl) utilEl.textContent = `${stats.summary.utilizationRate}%`;

      // Render Charts
      this.renderCharts(stats);

      // Render Bookings Table
      this.renderBookingsTable(this.allBookings);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  renderCharts(stats) {
    if (typeof Chart === 'undefined') return;

    // 1. Daily Bookings Line Chart
    const dailyCtx = document.getElementById('dailyBookingsChart')?.getContext('2d');
    if (dailyCtx) {
      if (this.charts.daily) this.charts.daily.destroy();
      const labels = Object.keys(stats.dailyBookings).map(d => d.slice(5)); // MM-DD
      const values = Object.values(stats.dailyBookings);

      this.charts.daily = new Chart(dailyCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'จำนวนการจอง (ครั้ง)',
            data: values,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#1e40af',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }

    // 2. Most Booked Rooms Bar Chart
    const roomsCtx = document.getElementById('mostBookedChart')?.getContext('2d');
    if (roomsCtx) {
      if (this.charts.rooms) this.charts.rooms.destroy();
      const labels = stats.mostBookedRooms.map(r => r.name.replace('Smart ', ''));
      const counts = stats.mostBookedRooms.map(r => r.count);

      this.charts.rooms = new Chart(roomsCtx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'สถิติจองรวม',
            data: counts,
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }

    // 3. Peak Hours Chart
    const peakCtx = document.getElementById('peakHoursChart')?.getContext('2d');
    if (peakCtx) {
      if (this.charts.peak) this.charts.peak.destroy();
      const labels = Object.keys(stats.peakHours);
      const values = Object.values(stats.peakHours);

      this.charts.peak = new Chart(peakCtx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'ความหนาแน่นของผู้ใช้งาน',
            data: values,
            backgroundColor: '#10b981',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }

    // 4. Room Status Distribution Doughnut Chart
    const statusCtx = document.getElementById('roomStatusChart')?.getContext('2d');
    if (statusCtx) {
      if (this.charts.status) this.charts.status.destroy();
      const d = stats.roomStatusDistribution;
      this.charts.status = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['ว่าง (Available)', 'ปรับปรุง (Maint)', 'ใช้งาน (In-Use)'],
          datasets: [{
            data: [d.available, d.maintenance, Math.max(1, d.booked + d.pending)],
            backgroundColor: ['#10b981', '#6b7280', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  },

  filterBookingsTable() {
    const q = (document.getElementById('adminBookingsSearch')?.value || '').toLowerCase();
    const st = document.getElementById('adminBookingsStatusFilter')?.value || 'all';

    let filtered = this.allBookings;
    if (q) {
      filtered = filtered.filter(b => 
        b.booking_id.toLowerCase().includes(q) ||
        b.user_name.toLowerCase().includes(q) ||
        b.student_id.toLowerCase().includes(q) ||
        b.room_name.toLowerCase().includes(q)
      );
    }
    if (st !== 'all') {
      filtered = filtered.filter(b => b.status === st);
    }

    this.renderBookingsTable(filtered);
  },

  renderBookingsTable(bookings) {
    const tbody = document.getElementById('adminBookingsTableBody');
    if (!tbody) return;

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">
            ไม่พบรายการจอง
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      let statusBadge = '';
      if (b.status === 'confirmed') statusBadge = '<span class="status-badge available" style="position:static;"><span class="status-dot available"></span>ยืนยันแล้ว</span>';
      else if (b.status === 'pending') statusBadge = '<span class="status-badge pending" style="position:static;"><span class="status-dot pending"></span>รออนุมัติ</span>';
      else if (b.status === 'cancelled') statusBadge = '<span class="status-badge maintenance" style="position:static;"><span class="status-dot maintenance"></span>ยกเลิกแล้ว</span>';
      else if (b.status === 'checked_in') statusBadge = '<span class="status-badge available" style="position:static; background:#e0f2fe; color:#0369a1;"><i class="fas fa-check-double"></i> เช็คอินแล้ว</span>';
      else statusBadge = `<span class="status-badge" style="position:static;">${b.status}</span>`;

      return `
        <tr>
          <td><strong style="color: var(--primary); font-family: monospace;">${b.booking_id}</strong></td>
          <td>
            <div style="font-weight: 600;">${b.user_name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${b.student_id}</div>
          </td>
          <td>${b.room_name}</td>
          <td>${b.booking_date}</td>
          <td>${b.start_time} - ${b.end_time}</td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-outline btn-sm" title="ดูรายละเอียด / QR Code" onclick="StudentUI.showQrModal('${b.booking_id}')">
                <i class="fas fa-eye"></i>
              </button>
              ${b.status === 'pending' ? `
                <button class="btn btn-success btn-sm" title="อนุมัติการจอง" onclick="AdminUI.updateStatus('${b.id}', 'confirmed')">
                  <i class="fas fa-check"></i>
                </button>
              ` : ''}
              ${b.status === 'confirmed' ? `
                <button class="btn btn-primary btn-sm" title="เช็คอินเข้าห้อง" onclick="AdminUI.quickCheckIn('${b.booking_id}')">
                  <i class="fas fa-user-check"></i>
                </button>
              ` : ''}
              ${b.status !== 'cancelled' && b.status !== 'completed' ? `
                <button class="btn btn-danger btn-sm" title="ยกเลิกการจอง" onclick="AdminUI.cancelBookingPrompt('${b.id}', '${b.booking_id}')">
                  <i class="fas fa-ban"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async updateStatus(bookingId, status) {
    try {
      await API.updateBookingStatus(bookingId, status);
      App.toast(`อัปเดตสถานะเป็น ${status} สำเร็จ`, 'success');
      this.loadDashboard();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async quickCheckIn(bookingId) {
    try {
      const res = await API.checkInBooking(bookingId);
      App.toast(res.message, 'success');
      this.loadDashboard();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async cancelBookingPrompt(id, bookingCode) {
    const reason = prompt(`กรุณาระบุเหตุผลการยกเลิกการจอง ${bookingCode}:`, 'ความจำเป็นทางวิชาการของห้องสมุด');
    if (reason === null) return;

    try {
      await API.updateBookingStatus(id, 'cancelled', reason);
      App.toast(`ยกเลิกการจอง ${bookingCode} สำเร็จ`, 'warning');
      this.loadDashboard();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  // QR Check-in Simulator
  async handleCheckIn(e) {
    e.preventDefault();
    const input = document.getElementById('adminCheckInInput');
    if (!input || !input.value.trim()) return;

    const bookingId = input.value.trim().toUpperCase();
    try {
      const res = await API.checkInBooking(bookingId);
      App.toast(res.message, 'success');
      input.value = '';
      this.loadDashboard();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  // -----------------------------------------------------------
  // Manage Rooms (CRUD)
  // -----------------------------------------------------------
  async loadManageRooms() {
    try {
      const res = await API.getRooms();
      this.allRooms = res.data;
      this.renderManageRoomsTable(this.allRooms);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  renderManageRoomsTable(rooms) {
    const tbody = document.getElementById('adminRoomsTableBody');
    if (!tbody) return;

    tbody.innerHTML = rooms.map(room => {
      const isMaint = room.status === 'maintenance';
      return `
        <tr>
          <td>
            <img src="${room.image}" alt="${room.name}" style="width: 50px; height: 38px; object-fit: cover; border-radius: 6px;" />
          </td>
          <td><strong>${room.room_id}</strong></td>
          <td>
            <div style="font-weight: 600;">${room.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${room.location}</div>
          </td>
          <td>${room.capacity} ที่นั่ง</td>
          <td>ชั้น ${room.floor}</td>
          <td>${StudentUI.getStatusBadgeHtml(room.status)}</td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-outline btn-sm" title="แก้ไขข้อมูลห้อง" onclick="AdminUI.openEditRoomModal(${room.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn ${isMaint ? 'btn-success' : 'btn-secondary'} btn-sm" 
                title="${isMaint ? 'เปิดใช้งานห้อง' : 'ตั้งเป็นปิดปรับปรุง'}"
                onclick="AdminUI.toggleMaintenance(${room.id}, '${isMaint ? 'available' : 'maintenance'}')">
                <i class="fas ${isMaint ? 'fa-check' : 'fa-tools'}"></i>
              </button>
              <button class="btn btn-danger btn-sm" title="ลบห้อง" onclick="AdminUI.confirmDeleteRoom(${room.id}, '${room.name}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddRoomModal() {
    document.getElementById('roomFormId').value = '';
    document.getElementById('roomFormModalTitle').textContent = 'เพิ่มห้องสมุดใหม่';
    document.getElementById('addRoomForm').reset();
    document.getElementById('roomFormStatus').value = 'available';
    App.openModal('roomFormModal');
  },

  openEditRoomModal(roomId) {
    const room = this.allRooms.find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('roomFormId').value = room.id;
    document.getElementById('roomFormModalTitle').textContent = `แก้ไขห้อง ${room.room_id}`;
    document.getElementById('roomFormCode').value = room.room_id;
    document.getElementById('roomFormCode').readOnly = true;
    document.getElementById('roomFormName').value = room.name;
    document.getElementById('roomFormCapacity').value = room.capacity;
    document.getElementById('roomFormFloor').value = room.floor;
    document.getElementById('roomFormLocation').value = room.location;
    document.getElementById('roomFormImage').value = room.image;
    document.getElementById('roomFormStatus').value = room.status;
    document.getElementById('roomFormDescription').value = room.description || '';

    // Check equipment checkboxes
    const cbs = document.querySelectorAll('.room-form-equipment');
    cbs.forEach(cb => {
      cb.checked = (room.equipment || []).includes(cb.value);
    });

    App.openModal('roomFormModal');
  },

  async handleSaveRoom(e) {
    e.preventDefault();
    const id = document.getElementById('roomFormId').value;
    const room_id = document.getElementById('roomFormCode').value.trim();
    const name = document.getElementById('roomFormName').value.trim();
    const capacity = document.getElementById('roomFormCapacity').value;
    const floor = document.getElementById('roomFormFloor').value;
    const location = document.getElementById('roomFormLocation').value.trim();
    const image = document.getElementById('roomFormImage').value.trim() || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
    const status = document.getElementById('roomFormStatus').value;
    const description = document.getElementById('roomFormDescription').value.trim();

    const eqNodes = document.querySelectorAll('.room-form-equipment:checked');
    const equipment = Array.from(eqNodes).map(node => node.value);

    const payload = { room_id, name, capacity, floor, location, image, status, description, equipment };

    try {
      if (id) {
        await API.updateRoom(id, payload);
        App.toast('แก้ไขข้อมูลห้องสำเร็จ', 'success');
      } else {
        await API.createRoom(payload);
        App.toast('เพิ่มห้องใหม่สำเร็จ', 'success');
      }

      App.closeModal('roomFormModal');
      this.loadManageRooms();
      StudentUI.loadRooms();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async toggleMaintenance(roomId, newStatus) {
    try {
      await API.setRoomStatus(roomId, newStatus);
      App.toast(`เปลี่ยนสถานะห้องเป็น ${newStatus} สำเร็จ`, 'success');
      this.loadManageRooms();
      StudentUI.loadRooms();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async confirmDeleteRoom(roomId, roomName) {
    if (!confirm(`ต้องการลบห้อง "${roomName}" ใช่หรือไม่? หากมีการจองค้างอยู่จะไม่สามารถลบได้`)) {
      return;
    }

    try {
      await API.deleteRoom(roomId);
      App.toast(`ลบห้อง ${roomName} เรียบร้อยแล้ว`, 'success');
      this.loadManageRooms();
      StudentUI.loadRooms();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  }
};
