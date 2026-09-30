// Core Application Orchestrator & Router
const App = {
  activeView: 'homeView',
  notifications: [],

  init() {
    this.setupNavigation();
    this.setupAuth();
    this.setupModals();
    this.checkInitialSession();
    this.refreshNotifications();

    // Init sub modules
    StudentUI.init();
    AdminUI.init();
  },

  // -----------------------------------------------------------
  // Navigation & View Routing
  // -----------------------------------------------------------
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.target;
        this.switchView(targetView);
      });
    });

    // Brand logo returns to home
    const brand = document.querySelector('.logo-brand');
    if (brand) {
      brand.addEventListener('click', () => this.switchView('homeView'));
    }

    // Notification dropdown toggle
    const notifBtn = document.getElementById('notifBellBtn');
    const notifDropdown = document.getElementById('notificationDropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
      });
      document.addEventListener('click', () => {
        notifDropdown.classList.remove('show');
      });
      notifDropdown.addEventListener('click', (e) => e.stopPropagation());
    }
  },

  switchView(viewId) {
    const user = API.getCurrentUser();

    // Guard admin route
    if (viewId === 'adminView') {
      if (!user) {
        this.toast('กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin)', 'warning');
        this.openModal('loginModal');
        return;
      }
      if (user.role !== 'admin') {
        this.toast('สิทธิ์การเข้าถึงถูกจำกัดสำหรับเจ้าหน้าที่ห้องสมุดเท่านั้น', 'error');
        return;
      }
      AdminUI.loadDashboard();
    }

    // Guard myBookings route
    if (viewId === 'myBookingsView') {
      if (!user) {
        this.toast('กรุณาเข้าสู่ระบบเพื่อดูรายการจองของคุณ', 'warning');
        this.openModal('loginModal');
        return;
      }
      StudentUI.renderMyBookings('upcoming');
    }

    // Hide all views
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Show target view
    const targetEl = document.getElementById(viewId);
    if (targetEl) {
      targetEl.classList.add('active');
      this.activeView = viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav links active state
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.target === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // -----------------------------------------------------------
  // Authentication & Session
  // -----------------------------------------------------------
  setupAuth() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
          const res = await API.login(username, password);
          this.toast(res.message, 'success');
          this.closeModal('loginModal');
          this.updateUserUI(res.user);
          this.refreshNotifications();

          if (res.user.role === 'admin') {
            this.switchView('adminView');
          } else {
            this.switchView('roomsView');
          }
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    }

    // Register form
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const student_id = document.getElementById('regStudentId').value;
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const department = document.getElementById('regDepartment').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;

        try {
          const res = await API.register({ student_id, name, email, department, phone, password });
          this.toast(res.message, 'success');
          this.closeModal('registerModal');
          this.updateUserUI(res.user);
          this.refreshNotifications();
          this.switchView('roomsView');
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    }
  },

  checkInitialSession() {
    const user = API.getCurrentUser();
    this.updateUserUI(user);
  },

  updateUserUI(user) {
    const guestNav = document.getElementById('navGuestActions');
    const userNav = document.getElementById('navUserActions');
    const nameEl = document.getElementById('navUserName');
    const roleEl = document.getElementById('navUserRole');
    const avatarEl = document.getElementById('navUserAvatar');
    const adminLink = document.getElementById('navAdminLink');

    if (user) {
      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';
      if (nameEl) nameEl.textContent = user.name.split(' ')[0];
      if (roleEl) {
        roleEl.textContent = user.role.toUpperCase();
        roleEl.className = `role-badge ${user.role}`;
      }
      if (avatarEl) avatarEl.textContent = user.name.charAt(0);
      if (adminLink) {
        adminLink.style.display = user.role === 'admin' ? 'flex' : 'none';
      }
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (adminLink) adminLink.style.display = 'none';
    }
  },

  logout() {
    API.logout();
    this.updateUserUI(null);
    this.toast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    this.switchView('homeView');
    this.refreshNotifications();
  },

  // Quick switchers for demo testing
  async quickLoginStudent() {
    try {
      const res = await API.login('6601024', '123');
      this.toast(`เข้าสู่ระบบในฐานะนักศึกษา: ${res.user.name}`, 'success');
      this.closeModal('loginModal');
      this.updateUserUI(res.user);
      this.refreshNotifications();
      this.switchView('roomsView');
    } catch (e) {
      this.toast(e.message, 'error');
    }
  },

  async quickLoginAdmin() {
    try {
      const res = await API.login('ADMIN01', 'admin');
      this.toast(`เข้าสู่ระบบในฐานะผู้ดูแลระบบ: ${res.user.name}`, 'success');
      this.closeModal('loginModal');
      this.updateUserUI(res.user);
      this.refreshNotifications();
      this.switchView('adminView');
    } catch (e) {
      this.toast(e.message, 'error');
    }
  },

  // -----------------------------------------------------------
  // Notifications
  // -----------------------------------------------------------
  async refreshNotifications() {
    const user = API.getCurrentUser();
    const countEl = document.getElementById('notifBadgeCount');
    const listEl = document.getElementById('notificationList');

    if (!user) {
      if (countEl) countEl.style.display = 'none';
      if (listEl) listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #94a3b8;">กรุณาเข้าสู่ระบบ</div>';
      return;
    }

    try {
      const res = await API.getNotifications();
      this.notifications = res.data;

      const unreadCount = this.notifications.filter(n => n.status === 'unread').length;
      if (countEl) {
        if (unreadCount > 0) {
          countEl.textContent = unreadCount;
          countEl.style.display = 'flex';
        } else {
          countEl.style.display = 'none';
        }
      }

      if (listEl) {
        if (this.notifications.length === 0) {
          listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #94a3b8;">ไม่มีการแจ้งเตือน</div>';
          return;
        }

        listEl.innerHTML = this.notifications.map(n => `
          <div class="notification-item ${n.status === 'unread' ? 'unread' : ''}" onclick="App.markRead(${n.id})">
            <div>${n.message}</div>
            <div class="notification-time">${new Date(n.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  },

  async markRead(id) {
    try {
      await API.markNotificationRead(id);
      this.refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  },

  // -----------------------------------------------------------
  // Modals Management
  // -----------------------------------------------------------
  setupModals() {
    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('show');
        }
      });
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('show');
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
    }
  },

  // -----------------------------------------------------------
  // Toast System
  // -----------------------------------------------------------
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;

    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';

    toastEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <i class="${icon}" style="font-size: 1.25rem;"></i>
        <span style="font-size: 0.88rem; font-weight: 500;">${message}</span>
      </div>
      <button style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.2rem;" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(toastEl);
    setTimeout(() => {
      if (toastEl.parentElement) {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(100%)';
        toastEl.style.transition = 'all 0.3s ease';
        setTimeout(() => toastEl.remove(), 300);
      }
    }, 4000);
  }
};

// Bootstrap app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
