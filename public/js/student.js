// Student Operations & Room Booking Flow
const StudentUI = {
  currentRooms: [],
  selectedRoom: null,
  selectedDate: null,
  selectedStartTime: '09:00',
  selectedEndTime: '11:00',
  bookedSlotsForDate: [],

  init() {
    this.bindEvents();
    this.loadRooms();
  },

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('roomSearchInput');
    if (searchInput) {
      let timeout = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.filterRooms(), 300);
      });
    }

    // Floor filter
    const floorFilter = document.getElementById('roomFloorFilter');
    if (floorFilter) {
      floorFilter.addEventListener('change', () => this.filterRooms());
    }

    // Capacity filter
    const capacityFilter = document.getElementById('roomCapacityFilter');
    if (capacityFilter) {
      capacityFilter.addEventListener('change', () => this.filterRooms());
    }

    // Status filter
    const statusFilter = document.getElementById('roomStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterRooms());
    }

    // Equipment checkboxes
    const eqCheckboxes = document.querySelectorAll('.filter-equipment-item');
    eqCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.filterRooms());
    });

    // Booking date input change
    const bookingDateInput = document.getElementById('bookingModalDate');
    if (bookingDateInput) {
      // Set min date to today
      const today = new Date().toISOString().split('T')[0];
      bookingDateInput.min = today;
      bookingDateInput.value = today;
      this.selectedDate = today;

      bookingDateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        if (this.selectedRoom) {
          this.refreshRoomAvailability(this.selectedRoom.id, this.selectedDate);
        }
      });
    }

    // Time selects change
    const startSelect = document.getElementById('bookingModalStartTime');
    const endSelect = document.getElementById('bookingModalEndTime');
    if (startSelect && endSelect) {
      startSelect.addEventListener('change', (e) => {
        this.selectedStartTime = e.target.value;
        this.validateTimeSlotConflict();
      });
      endSelect.addEventListener('change', (e) => {
        this.selectedEndTime = e.target.value;
        this.validateTimeSlotConflict();
      });
    }

    // Booking form submit
    const bookingForm = document.getElementById('bookingModalForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
    }

    // My Bookings tabs
    const tabBtns = document.querySelectorAll('.my-bookings-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderMyBookings(e.currentTarget.dataset.tab);
      });
    });
  },

  async loadRooms() {
    try {
      const res = await API.getRooms();
      this.currentRooms = res.data;
      this.renderRooms(this.currentRooms);
      this.renderFeaturedRooms(this.currentRooms.slice(0, 3));
      this.updateHomeStats(this.currentRooms);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  updateHomeStats(rooms) {
    const totalEl = document.getElementById('homeTotalRooms');
    const availEl = document.getElementById('homeAvailableRooms');
    if (totalEl) totalEl.textContent = rooms.length;
    if (availEl) {
      const avail = rooms.filter(r => r.status === 'available').length;
      availEl.textContent = avail;
    }
  },

  async filterRooms() {
    const search = document.getElementById('roomSearchInput')?.value || '';
    const floor = document.getElementById('roomFloorFilter')?.value || 'all';
    const capacity = document.getElementById('roomCapacityFilter')?.value || 'all';
    const status = document.getElementById('roomStatusFilter')?.value || 'all';

    const eqNodes = document.querySelectorAll('.filter-equipment-item:checked');
    const equipment = Array.from(eqNodes).map(node => node.value);

    try {
      const res = await API.getRooms({ search, floor, capacity, status, equipment });
      this.renderRooms(res.data);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  getStatusBadgeHtml(status) {
    const map = {
      available: { label: 'Available (ว่าง)', class: 'available' },
      booked: { label: 'Booked (มีผู้จองแล้ว)', class: 'booked' },
      pending: { label: 'Pending (รอตรวจสอบ)', class: 'pending' },
      maintenance: { label: 'Maintenance (ปิดปรับปรุง)', class: 'maintenance' }
    };
    const s = map[status] || { label: status, class: 'maintenance' };
    return `
      <div class="status-badge ${s.class}">
        <span class="status-dot ${s.class}"></span>
        <span>${s.label}</span>
      </div>
    `;
  },

  renderRooms(rooms) {
    const container = document.getElementById('roomsGridContainer');
    const countEl = document.getElementById('roomsResultCount');
    if (countEl) countEl.textContent = `พบทั้งหมด ${rooms.length} ห้อง`;

    if (!container) return;
    if (rooms.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="fas fa-door-closed" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
          <h3 style="color: #64748b; font-weight: 500;">ไม่พบห้องที่ตรงตามเงื่อนไขที่เลือก</h3>
          <p style="color: #94a3b8; font-size: 0.9rem;">ลองปรับเปลี่ยนตัวกรองค้นหาใหม่</p>
        </div>
      `;
      return;
    }

    container.innerHTML = rooms.map(room => {
      const isMaint = room.status === 'maintenance';
      const eqBadges = (room.equipment || []).map(eq => `
        <span class="equipment-pill">
          <i class="${this.getEquipmentIcon(eq)}"></i>
          ${eq}
        </span>
      `).join('');

      return `
        <div class="room-card">
          <div class="room-image-wrap">
            <img src="${room.image}" alt="${room.name}" loading="lazy" />
            <div class="room-code-tag">${room.room_id}</div>
            ${this.getStatusBadgeHtml(room.status)}
          </div>
          <div class="room-card-body">
            <h3 class="room-title">${room.name}</h3>
            <div class="room-meta-row">
              <div class="room-meta-item">
                <i class="fas fa-users" style="color: var(--accent);"></i>
                <span>${room.capacity} ที่นั่ง</span>
              </div>
              <div class="room-meta-item">
                <i class="fas fa-layer-group" style="color: var(--accent);"></i>
                <span>ชั้น ${room.floor}</span>
              </div>
              <div class="room-meta-item">
                <i class="fas fa-map-marker-alt" style="color: var(--accent);"></i>
                <span title="${room.location}">${room.location.split('(')[0]}</span>
              </div>
            </div>
            <p class="room-desc">${room.description || 'ห้องสำหรับอ่านหนังสือและกิจกรรมการศึกษา'}</p>
            <div class="equipment-pills-row">
              ${eqBadges}
            </div>
            <div class="room-card-footer">
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="StudentUI.openRoomDetailModal(${room.id})">
                <i class="fas fa-info-circle"></i> ดูรายละเอียด
              </button>
              <button class="btn btn-primary btn-sm" style="flex: 1.2;" 
                ${isMaint ? 'disabled' : ''} 
                onclick="StudentUI.openBookingModal(${room.id})">
                <i class="fas fa-calendar-check"></i> ${isMaint ? 'ปิดปรับปรุง' : 'จองห้องนี้'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderFeaturedRooms(rooms) {
    const container = document.getElementById('featuredRoomsContainer');
    if (!container) return;
    container.innerHTML = rooms.map(room => `
      <div class="room-card">
        <div class="room-image-wrap" style="height: 180px;">
          <img src="${room.image}" alt="${room.name}" />
          <div class="room-code-tag">${room.room_id}</div>
          ${this.getStatusBadgeHtml(room.status)}
        </div>
        <div class="room-card-body">
          <h4 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.3rem;">${room.name}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.8rem;">
            <i class="fas fa-users"></i> ${room.capacity} ที่นั่ง &bull; ชั้น ${room.floor} &bull; ${room.location}
          </p>
          <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="StudentUI.openBookingModal(${room.id})">
            จองห้องทันที
          </button>
        </div>
      </div>
    `).join('');
  },

  getEquipmentIcon(eqName) {
    const s = eqName.toLowerCase();
    if (s.includes('projector')) return 'fas fa-video';
    if (s.includes('tv')) return 'fas fa-tv';
    if (s.includes('whiteboard')) return 'fas fa-chalkboard';
    if (s.includes('computer')) return 'fas fa-desktop';
    if (s.includes('conference') || s.includes('camera')) return 'fas fa-camera';
    if (s.includes('sound')) return 'fas fa-volume-high';
    if (s.includes('wifi')) return 'fas fa-wifi';
    return 'fas fa-plug';
  },

  // Room Detail Modal
  async openRoomDetailModal(roomId) {
    try {
      const res = await API.getRoom(roomId);
      const room = res.data;
      this.selectedRoom = room;

      const title = document.getElementById('detailModalTitle');
      const img = document.getElementById('detailModalImage');
      const info = document.getElementById('detailModalInfo');
      const bookBtn = document.getElementById('detailModalBookBtn');

      if (title) title.textContent = `${room.name} (${room.room_id})`;
      if (img) img.src = room.image;
      if (bookBtn) {
        bookBtn.disabled = room.status === 'maintenance';
        bookBtn.onclick = () => {
          App.closeModal('roomDetailModal');
          this.openBookingModal(room.id);
        };
      }

      const eqList = (room.equipment || []).map(eq => `
        <span class="equipment-pill" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
          <i class="${this.getEquipmentIcon(eq)}"></i> ${eq}
        </span>
      `).join('');

      if (info) {
        info.innerHTML = `
          <div style="display: flex; gap: 1.5rem; margin-bottom: 1.25rem;">
            <div><i class="fas fa-users" style="color: var(--accent);"></i> <strong>ความจุ:</strong> ${room.capacity} ท่าน</div>
            <div><i class="fas fa-layer-group" style="color: var(--accent);"></i> <strong>ชั้น:</strong> ชั้น ${room.floor}</div>
            <div><i class="fas fa-map-marker-alt" style="color: var(--accent);"></i> <strong>ที่ตั้ง:</strong> ${room.location}</div>
          </div>
          <p style="color: #475569; margin-bottom: 1.25rem; line-height: 1.7;">${room.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
          <div style="margin-bottom: 1.25rem;">
            <strong style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem;">อุปกรณ์และสิ่งอำนวยความสะดวก:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">${eqList}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; font-size: 0.85rem; color: #64748b;">
            <strong><i class="fas fa-shield-alt"></i> ระเบียบการใช้ห้อง:</strong>
            <ul style="margin-left: 1.25rem; margin-top: 0.4rem;">
              <li>โปรดสแกน QR Code หน้าห้องเพื่อเช็คอินภายใน 15 นาทีหลังเริ่มจอง</li>
              <li>ห้ามนำอาหารและเครื่องดื่มมีกลิ่นเข้ามาภายในห้อง</li>
              <li>กรุณาปิดไฟ เครื่องปรับอากาศ และทำความสะอาดกระดานหลังใช้งาน</li>
            </ul>
          </div>
        `;
      }

      App.openModal('roomDetailModal');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  // Open Direct Booking Modal
  async openBookingModal(roomId) {
    const user = API.getCurrentUser();
    if (!user) {
      App.toast('กรุณาเข้าสู่ระบบก่อนทำการจองห้อง', 'warning');
      App.openModal('loginModal');
      return;
    }

    try {
      const res = await API.getRoom(roomId);
      const room = res.data;
      this.selectedRoom = room;

      if (room.status === 'maintenance') {
        App.toast('ห้องนี้ปิดปรับปรุง ไม่สามารถจองได้', 'warning');
        return;
      }

      // Populate form
      document.getElementById('bookingModalRoomId').value = room.id;
      document.getElementById('bookingModalRoomName').textContent = `${room.name} (${room.room_id})`;
      document.getElementById('bookingModalRoomCap').textContent = `${room.capacity} ท่าน (ชั้น ${room.floor})`;
      document.getElementById('bookingModalUserName').value = `${user.name} (${user.student_id})`;
      document.getElementById('bookingModalAttendees').max = room.capacity;
      document.getElementById('bookingModalAttendees').value = Math.min(2, room.capacity);

      // Reset policy checkbox
      const agree = document.getElementById('bookingModalAgree');
      if (agree) agree.checked = false;

      // Set today's date and refresh availability
      const today = new Date().toISOString().split('T')[0];
      const dateInput = document.getElementById('bookingModalDate');
      dateInput.value = today;
      this.selectedDate = today;

      await this.refreshRoomAvailability(room.id, today);
      App.openModal('bookingModal');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async refreshRoomAvailability(roomId, date) {
    try {
      const res = await API.getRoomAvailability(roomId, date);
      this.bookedSlotsForDate = res.booked_slots || [];
      this.renderTimeSlotGrid();
      this.validateTimeSlotConflict();
    } catch (err) {
      console.error(err);
    }
  },

  renderTimeSlotGrid() {
    const container = document.getElementById('bookingModalSlotMatrix');
    if (!container) return;

    // Slots from 08:00 to 20:00 (library hours)
    const hours = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    container.innerHTML = hours.map(h => {
      const hourNum = parseInt(h.split(':')[0], 10);
      const isPast = (this.selectedDate === todayStr && hourNum <= currentHour);

      // Check if slot is within any booked range
      const isBooked = this.bookedSlotsForDate.some(b => {
        const startH = parseInt(b.start_time.split(':')[0], 10);
        const endH = parseInt(b.end_time.split(':')[0], 10);
        return hourNum >= startH && hourNum < endH;
      });

      let statusClass = 'available';
      let title = 'ว่าง สามารถจองได้';

      if (isPast) {
        statusClass = 'disabled';
        title = 'เวลาผ่านไปแล้ว';
      } else if (isBooked) {
        statusClass = 'booked';
        title = 'มีผู้จองแล้ว';
      }

      return `
        <div class="slot-btn ${statusClass}" title="${title}" onclick="StudentUI.quickPickHour('${h}', ${isBooked || isPast})">
          <div style="font-weight: 600;">${h}</div>
          <div style="font-size: 0.7rem; opacity: 0.85;">${statusClass === 'booked' ? 'ไม่ว่าง' : (statusClass === 'disabled' ? 'ผ่านแล้ว' : 'ว่าง 🟢')}</div>
        </div>
      `;
    }).join('');
  },

  quickPickHour(hourStr, isDisabled) {
    if (isDisabled) return;
    const startSelect = document.getElementById('bookingModalStartTime');
    const endSelect = document.getElementById('bookingModalEndTime');
    if (!startSelect || !endSelect) return;

    startSelect.value = hourStr;
    const startH = parseInt(hourStr.split(':')[0], 10);
    const endH = String(startH + 2).padStart(2, '0') + ':00'; // Default 2 hours
    if (startH + 2 <= 21) {
      endSelect.value = endH;
    } else {
      endSelect.value = '21:00';
    }

    this.selectedStartTime = startSelect.value;
    this.selectedEndTime = endSelect.value;
    this.validateTimeSlotConflict();
  },

  async validateTimeSlotConflict() {
    const startSelect = document.getElementById('bookingModalStartTime');
    const endSelect = document.getElementById('bookingModalEndTime');
    const alertBox = document.getElementById('bookingConflictAlert');
    const submitBtn = document.getElementById('bookingSubmitBtn');

    if (!startSelect || !endSelect || !alertBox || !submitBtn || !this.selectedRoom) return;

    const startTime = startSelect.value;
    const endTime = endSelect.value;

    const startM = parseInt(startTime.split(':')[0], 10) * 60 + parseInt(startTime.split(':')[1], 10);
    const endM = parseInt(endTime.split(':')[0], 10) * 60 + parseInt(endTime.split(':')[1], 10);

    if (startM >= endM) {
      alertBox.style.display = 'block';
      alertBox.className = 'alert alert-danger';
      alertBox.innerHTML = '<i class="fas fa-exclamation-triangle"></i> เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด';
      submitBtn.disabled = true;
      return;
    }

    try {
      const res = await API.checkConflict({
        room_id: this.selectedRoom.id,
        booking_date: this.selectedDate,
        start_time: startTime,
        end_time: endTime
      });

      if (res.conflict) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.innerHTML = `<i class="fas fa-times-circle"></i> <strong>จองไม่ได้:</strong> ${res.reason}`;
        submitBtn.disabled = true;
      } else {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-success';
        alertBox.innerHTML = `<i class="fas fa-check-circle"></i> <strong>ช่วงเวลาว่าง:</strong> สามารถจอง ${startTime} - ${endTime} ได้`;
        submitBtn.disabled = false;
      }
    } catch (e) {
      console.error(e);
    }
  },

  async handleBookingSubmit(e) {
    e.preventDefault();

    const agree = document.getElementById('bookingModalAgree');
    if (!agree || !agree.checked) {
      App.toast('กรุณายินยอมตามระเบียบการใช้ห้องสมุดก่อนทำการจอง', 'warning');
      return;
    }

    const attendees = document.getElementById('bookingModalAttendees').value;
    const purpose = document.getElementById('bookingModalPurpose').value;
    const startTime = document.getElementById('bookingModalStartTime').value;
    const endTime = document.getElementById('bookingModalEndTime').value;

    const submitBtn = document.getElementById('bookingSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึกการจอง...';

    try {
      const res = await API.createBooking({
        room_id: this.selectedRoom.id,
        booking_date: this.selectedDate,
        start_time: startTime,
        end_time: endTime,
        attendees,
        purpose
      });

      App.closeModal('bookingModal');
      this.showConfirmationModal(res.data);
      App.toast('จองห้องสำเร็จเรียบร้อย!', 'success');
      App.refreshNotifications();
      this.loadRooms();
    } catch (err) {
      App.toast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check"></i> ยืนยันการจองห้อง';
    }
  },

  showConfirmationModal(booking) {
    document.getElementById('confirmBookingId').textContent = booking.booking_id;
    document.getElementById('confirmRoomName').textContent = booking.room_name;
    document.getElementById('confirmDateTime').textContent = `${booking.booking_date} เวลา ${booking.start_time} - ${booking.end_time}`;
    document.getElementById('confirmUserName').textContent = `${booking.user_name} (${booking.student_id})`;
    document.getElementById('confirmQrImage').src = booking.qr_code;

    const downloadBtn = document.getElementById('confirmDownloadQrBtn');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `Booking-${booking.booking_id}.png`;
        link.href = booking.qr_code;
        link.click();
      };
    }

    const viewMyBookingsBtn = document.getElementById('confirmViewBookingsBtn');
    if (viewMyBookingsBtn) {
      viewMyBookingsBtn.onclick = () => {
        App.closeModal('bookingSuccessModal');
        App.switchView('myBookingsView');
      };
    }

    App.openModal('bookingSuccessModal');
  },

  // My Bookings
  async renderMyBookings(tab = 'upcoming') {
    const container = document.getElementById('myBookingsList');
    if (!container) return;

    const user = API.getCurrentUser();
    if (!user) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <p>กรุณาเข้าสู่ระบบเพื่อดูประวัติการจองของท่าน</p>
          <button class="btn btn-primary" onclick="App.openModal('loginModal')">เข้าสู่ระบบ</button>
        </div>
      `;
      return;
    }

    try {
      const res = await API.getBookings({ user_id: user.id });
      let bookings = res.data;

      const today = new Date().toISOString().split('T')[0];

      if (tab === 'upcoming') {
        bookings = bookings.filter(b => b.status !== 'cancelled' && b.booking_date >= today);
      } else if (tab === 'completed') {
        bookings = bookings.filter(b => b.status === 'completed' || b.status === 'checked_in' || (b.status !== 'cancelled' && b.booking_date < today));
      } else if (tab === 'cancelled') {
        bookings = bookings.filter(b => b.status === 'cancelled');
      }

      if (bookings.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3.5rem 1rem; background: #fff; border-radius: 16px; border: 1px dashed var(--border-color);">
            <i class="fas fa-calendar-times" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
            <h4 style="color: #64748b; font-weight: 500;">ไม่มีรายการจองในหมวดหมู่นี้</h4>
            <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem;">ต้องการจองห้องใหม่สำหรับการอ่านหนังสือหรือไม่?</p>
            <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="App.switchView('roomsView')">
              <i class="fas fa-search"></i> ค้นหาและจองห้อง
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = bookings.map(b => {
        const canCancel = b.status !== 'cancelled' && b.status !== 'completed';
        return `
          <div class="booking-ticket">
            <div class="ticket-left">
              <div class="ticket-icon">
                <i class="fas fa-door-open"></i>
              </div>
              <div class="ticket-info">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span class="booking-code-pill" style="font-size: 0.9rem; padding: 0.15rem 0.6rem;">${b.booking_id}</span>
                  ${StudentUI.getStatusBadgeHtml(b.status)}
                </div>
                <h4 style="margin-top: 0.4rem;">${b.room_name}</h4>
                <div class="ticket-meta">
                  <span><i class="far fa-calendar-alt"></i> ${b.booking_date}</span>
                  <span><i class="far fa-clock"></i> ${b.start_time} - ${b.end_time}</span>
                  <span><i class="fas fa-user-friends"></i> ${b.attendees} ท่าน</span>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm" onclick="StudentUI.showQrModal('${b.booking_id}')">
                <i class="fas fa-qrcode"></i> แสดง QR Code
              </button>
              ${canCancel ? `
                <button class="btn btn-danger btn-sm" onclick="StudentUI.confirmCancelBooking('${b.booking_id}')">
                  <i class="fas fa-times"></i> ยกเลิกการจอง
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async showQrModal(bookingId) {
    try {
      const res = await API.getBooking(bookingId);
      const booking = res.data;
      this.showConfirmationModal(booking);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async confirmCancelBooking(bookingId) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองรหัส ${bookingId}?`)) {
      return;
    }

    try {
      await API.cancelBooking(bookingId);
      App.toast(`ยกเลิกการจอง ${bookingId} เรียบร้อยแล้ว`, 'success');
      App.refreshNotifications();
      this.renderMyBookings('upcoming');
      this.loadRooms();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  }
};
