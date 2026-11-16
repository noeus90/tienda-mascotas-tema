/**
 * Dog Grooming Appointments Calendar Controller
 * File: assets/grooming-calendar.js
 * Architecture: Clean Vanilla JS, event delegation, WAI-ARIA tablist & modal, dual i18n support.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'grooming_calendar_appointments';
  const AUTH_STORAGE_KEY = 'grooming_calendar_auth';

  class GroomingCalendar {
    constructor(container) {
      this.container = container;
      this.sectionId = container.dataset.sectionId;
      this.currentView = container.dataset.defaultView || 'month';
      this.selectedDate = new Date();
      this.filterStatus = 'all';
      this.filterService = 'all';
      this.searchQuery = '';
      this.activeAppointmentId = null;
      this.isCreatingNew = false;
      this.lastFocusedElement = null;

      // Access Control & PIN Gate Properties
      this.requirePin = container.dataset.requirePin === 'true';
      this.adminPin = (container.dataset.adminPin || '1234').trim();
      this.isDesignMode = container.dataset.designMode === 'true';
      this.pinGate = container.querySelector('[data-calendar-pin-gate]');
      this.pinInput = container.querySelector('[data-pin-input]');
      this.pinForm = container.querySelector('[data-pin-form]');
      this.pinError = container.querySelector('[data-pin-error]');

      // Check session storage authentication
      let hasSessionAuth = false;
      try {
        hasSessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
      } catch (e) {
        // Ignore storage exceptions
      }
      this.isAuthenticated = !this.requirePin || this.isDesignMode || hasSessionAuth;

      this.dataScript = container.querySelector('[data-grooming-calendar-data]');
      this.servicesScript = container.querySelector('[data-grooming-calendar-services]');
      this.services = [];
      if (this.servicesScript) {
        try {
          const parsedServices = JSON.parse(this.servicesScript.textContent);
          if (Array.isArray(parsedServices) && parsedServices.length > 0) {
            this.services = parsedServices;
          }
        } catch (e) {
          console.warn('Unable to parse calendar services JSON', e);
        }
      }
      if (!Array.isArray(this.services) || this.services.length === 0) {
        this.services = [
          { id: 'bath_hygiene', name: 'Baño Dermoprotector & Oídos', priceMini: 28, priceMedium: 34 },
          { id: 'scissor_cut', name: 'Corte a Tijera de Raza & Peinado', priceMini: 38, priceMedium: 46 },
          { id: 'deshedding', name: 'Deslanado Completo & Baño', priceMini: 35, priceMedium: 42 },
          { id: 'spa_ozone', name: 'Spa Ozonoterapia & Mascarilla', priceMini: 42, priceMedium: 50 },
        ];
      }

      this.viewContainer = container.querySelector(`#grooming-calendar-view-${this.sectionId}`);
      this.labelElement = container.querySelector(`#grooming-calendar-label-${this.sectionId}`);
      this.modalBackdrop = document.getElementById(`grooming-modal-${this.sectionId}`);

      this.applyAuthState();
      this.appointments = this.loadAppointments();
      this.initEvents();

      if (this.isAuthenticated) {
        this.updateMetrics();
        this.render();
      } else if (this.pinInput) {
        setTimeout(() => {
          this.pinInput.focus();
        }, 100);
      }
    }

    /**
     * Apply lock/unlock classes and element visibility
     */
    applyAuthState() {
      if (!this.requirePin || this.isDesignMode || this.isAuthenticated) {
        this.container.classList.remove('is-locked');
        this.container.classList.add('is-unlocked');
        if (this.pinGate) {
          this.pinGate.setAttribute('hidden', '');
        }
        if (this.pinError) {
          this.pinError.setAttribute('hidden', '');
        }
      } else {
        this.container.classList.add('is-locked');
        this.container.classList.remove('is-unlocked');
        if (this.pinGate) {
          this.pinGate.removeAttribute('hidden');
        }
      }
    }

    /**
     * Handle staff PIN verification
     */
    handlePinSubmit() {
      if (!this.pinInput) return;
      const entered = (this.pinInput.value || '').trim();

      if (entered === this.adminPin) {
        this.isAuthenticated = true;
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } catch (e) {
          // Ignore storage exceptions
        }
        this.applyAuthState();
        this.updateMetrics();
        this.render();

        const todayBtn = this.container.querySelector('[data-calendar-action="today"]');
        if (todayBtn) todayBtn.focus();
      } else {
        if (this.pinError) {
          this.pinError.removeAttribute('hidden');
        }
        const card = this.container.querySelector('.grooming-calendar-pin-card');
        if (card) {
          card.classList.remove('is-shaking');
          void card.offsetWidth;
          card.classList.add('is-shaking');
        }
        this.pinInput.value = '';
        this.pinInput.focus();
      }
    }

    /**
     * Load initial seed appointments or restore user modifications from localStorage
     */
    loadAppointments() {
      // 1. One-time reset to clear any previously saved demo/seed appointments
      const RESET_FLAG = 'grooming_calendar_cleared_v2';
      if (localStorage.getItem(RESET_FLAG) !== 'done') {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(RESET_FLAG, 'done');
        } catch (e) {
          console.warn('Unable to purge legacy appointments', e);
        }
        this.saveAppointments([]);
        return [];
      }

      let saved = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) saved = JSON.parse(raw);
      } catch (e) {
        console.warn('Unable to read appointments from localStorage', e);
      }

      if (Array.isArray(saved)) {
        // Filter out legacy dummy seeds if any lingered
        const realAppointments = saved.filter((apt) => apt && !String(apt.id).startsWith('apt-'));
        if (realAppointments.length !== saved.length) {
          this.saveAppointments(realAppointments);
          return realAppointments;
        }
        return saved;
      }

      // 2. Fallback to dataset in DOM (empty array by default)
      let seedList = [];
      if (this.dataScript) {
        try {
          const parsed = JSON.parse(this.dataScript.textContent);
          if (parsed && Array.isArray(parsed.appointments)) {
            seedList = parsed.appointments;
          }
        } catch (e) {
          console.error('Error parsing calendar seed data', e);
        }
      }

      if (!seedList || seedList.length === 0) {
        this.saveAppointments([]);
        return [];
      }

      const today = new Date();
      const normalized = seedList.map((apt) => {
        const aptDate = new Date(today);
        aptDate.setDate(today.getDate() + (apt.offsetDays || 0));
        const yyyy = aptDate.getFullYear();
        const mm = String(aptDate.getMonth() + 1).padStart(2, '0');
        const dd = String(aptDate.getDate()).padStart(2, '0');

        return {
          ...apt,
          date: `${yyyy}-${mm}-${dd}`,
        };
      });

      this.saveAppointments(normalized);
      return normalized;
    }

    saveAppointments(list) {
      // Always sort strictly chronologically by date and startTime
      list.sort((a, b) => (a.date + ' ' + a.startTime).localeCompare(b.date + ' ' + b.startTime));
      this.appointments = list;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('Unable to save appointments to localStorage', e);
      }
    }

    /**
     * Calculate summary metrics for the header cards
     */
    updateMetrics() {
      const counts = {
        confirmed: 0,
        pending: 0,
        completed: 0,
      };

      this.appointments.forEach((apt) => {
        if (counts[apt.status] !== undefined) {
          counts[apt.status]++;
        }
      });

      const confirmedEl = this.container.querySelector('[data-metric="confirmed"]');
      const pendingEl = this.container.querySelector('[data-metric="pending"]');
      const completedEl = this.container.querySelector('[data-metric="completed"]');

      if (confirmedEl) confirmedEl.textContent = counts.confirmed;
      if (pendingEl) pendingEl.textContent = counts.pending;
      if (completedEl) completedEl.textContent = counts.completed;
    }

    /**
     * Helper to format YYYY-MM-DD from a Date object
     */
    formatDateKey(dateObj) {
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    getLocale() {
      return document.documentElement.lang === 'en' ? 'en-US' : 'es-ES';
    }

    isEnglish() {
      return document.documentElement.lang === 'en';
    }

    /**
     * Filter appointments by status, service, and search query
     */
    getFilteredAppointments() {
      const query = this.searchQuery.trim().toLowerCase();

      return this.appointments.filter((apt) => {
        if (this.filterStatus !== 'all' && apt.status !== this.filterStatus) {
          return false;
        }
        if (this.filterService !== 'all' && apt.serviceId !== this.filterService) {
          return false;
        }
        if (query) {
          const matchPet = (apt.petName || '').toLowerCase().includes(query);
          const matchBreed = (apt.petBreed || '').toLowerCase().includes(query);
          const matchCustomer = (apt.customerName || '').toLowerCase().includes(query);
          const matchPhone = (apt.customerPhone || '').includes(query);
          if (!matchPet && !matchBreed && !matchCustomer && !matchPhone) {
            return false;
          }
        }
        return true;
      });
    }

    getServiceName(apt) {
      if (apt.serviceNameEs) return this.isEnglish() ? (apt.serviceNameEn || apt.serviceNameEs) : apt.serviceNameEs;
      const matched = this.services.find((s) => s.id === apt.serviceId);
      if (matched) return matched.name;
      return apt.serviceId || 'Peluquería Canina';
    }

    getStatusLabel(status) {
      const isEn = this.isEnglish();
      switch (status) {
        case 'confirmed':
          return isEn ? 'Confirmed' : 'Confirmada';
        case 'pending':
          return isEn ? 'Pending' : 'Pendiente';
        case 'completed':
          return isEn ? 'Completed' : 'Realizada';
        case 'cancelled':
          return isEn ? 'Cancelled' : 'Cancelada';
        default:
          return status;
      }
    }

    /**
     * Setup event delegation
     */
    initEvents() {
      // Toolbar clicks (today, prev, next, print, new appointment)
      this.container.addEventListener('click', (event) => {
        const actionBtn = event.target.closest('[data-calendar-action]');
        if (actionBtn) {
          const action = actionBtn.dataset.calendarAction;
          if (action === 'print') {
            this.handlePrintSchedule();
          } else if (action === 'new-appointment') {
            this.openNewAppointmentModal();
          } else {
            this.handleNavAction(action);
          }
          return;
        }

        const viewTab = event.target.closest('[data-calendar-view]');
        if (viewTab) {
          this.switchView(viewTab.dataset.calendarView);
          return;
        }

        // Click on appointment card/pill -> open modal
        const aptCard = event.target.closest('[data-appointment-id]');
        if (aptCard) {
          const aptId = aptCard.dataset.appointmentId;
          this.openModal(aptId);
          return;
        }

        // Click on "View day" or date cell header
        const dayJumpBtn = event.target.closest('[data-jump-to-day]');
        if (dayJumpBtn) {
          const targetDateStr = dayJumpBtn.dataset.jumpToDay;
          if (targetDateStr) {
            const [y, m, d] = targetDateStr.split('-').map(Number);
            this.selectedDate = new Date(y, m - 1, d);
            this.switchView('day');
          }
          return;
        }
      });

      // Search input live typing
      const searchInput = this.container.querySelector('[data-calendar-search]');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.render();
        });
      }

      // Filter selects
      const statusSelect = this.container.querySelector('[data-calendar-filter="status"]');
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          this.filterStatus = e.target.value;
          this.render();
        });
      }

      const serviceSelect = this.container.querySelector('[data-calendar-filter="service"]');
      if (serviceSelect) {
        serviceSelect.addEventListener('change', (e) => {
          this.filterService = e.target.value;
          this.render();
        });
      }

      // PIN gate listeners
      if (this.pinForm) {
        this.pinForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handlePinSubmit();
        });
      }

      if (this.pinInput) {
        this.pinInput.addEventListener('input', () => {
          if (this.pinError) {
            this.pinError.setAttribute('hidden', '');
          }
          if (this.pinInput.value.length >= this.adminPin.length) {
            this.handlePinSubmit();
          }
        });
      }

      // Keyboard navigation for WAI-ARIA tablist (Left/Right/Home/End)
      const tabList = this.container.querySelector('.grooming-calendar-view-tabs');
      if (tabList) {
        tabList.addEventListener('keydown', (event) => {
          const tabs = Array.from(tabList.querySelectorAll('[data-calendar-view]'));
          const currentTab = document.activeElement;
          const currentIndex = tabs.indexOf(currentTab);
          if (currentIndex === -1) return;

          let targetIndex = null;
          if (event.key === 'ArrowRight') {
            targetIndex = (currentIndex + 1) % tabs.length;
          } else if (event.key === 'ArrowLeft') {
            targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          } else if (event.key === 'Home') {
            targetIndex = 0;
          } else if (event.key === 'End') {
            targetIndex = tabs.length - 1;
          }

          if (targetIndex !== null) {
            event.preventDefault();
            const targetTab = tabs[targetIndex];
            this.switchView(targetTab.dataset.calendarView);
            targetTab.focus();
          }
        });
      }

      // Modal action handlers
      if (this.modalBackdrop) {
        this.modalBackdrop.addEventListener('click', (event) => {
          if (event.target === this.modalBackdrop || event.target.closest('[data-modal-action="close"]')) {
            this.closeModal();
            return;
          }

          const actionBtn = event.target.closest('[data-modal-action]');
          if (actionBtn) {
            const action = actionBtn.dataset.modalAction;
            if (this.isCreatingNew && action === 'save-new') {
              this.handleSaveNewAppointment();
              return;
            }

            if (this.activeAppointmentId) {
              if (action === 'confirm') {
                this.updateAppointmentStatus(this.activeAppointmentId, 'confirmed');
              } else if (action === 'complete') {
                this.updateAppointmentStatus(this.activeAppointmentId, 'completed');
              } else if (action === 'cancel') {
                this.updateAppointmentStatus(this.activeAppointmentId, 'cancelled');
              } else if (action === 'delete') {
                this.deleteAppointment(this.activeAppointmentId);
              }
            }
          }
        });

        // Close on Escape key & trap focus
        document.addEventListener('keydown', (event) => {
          if (this.modalBackdrop.hasAttribute('hidden')) return;

          if (event.key === 'Escape') {
            this.closeModal();
            return;
          }

          if (event.key === 'Tab') {
            const focusables = Array.from(
              this.modalBackdrop.querySelectorAll('button, input, select, textarea, [tabindex="0"]')
            ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        });
      }
    }

    handlePrintSchedule() {
      // Close any open modal before printing
      this.closeModal();

      document.body.classList.add('is-printing-calendar');
      this.container.classList.add('is-printing-calendar');

      const cleanup = () => {
        document.body.classList.remove('is-printing-calendar');
        this.container.classList.remove('is-printing-calendar');
        window.removeEventListener('afterprint', cleanup);
      };

      window.addEventListener('afterprint', cleanup, { once: true });

      // Trigger standard print dialog
      window.print();

      // Fallback cleanup in case afterprint does not fire in certain webviews
      setTimeout(cleanup, 2500);
    }

    /**
     * Delete a single appointment permanently
     */
    deleteAppointment(appointmentId) {
      const isEn = this.isEnglish();
      const confirmMsg = isEn
        ? 'Are you sure you want to permanently delete this appointment?'
        : '¿Estás seguro de que deseas eliminar permanentemente esta cita?';
      if (!window.confirm(confirmMsg)) return;

      const updated = this.appointments.filter((apt) => apt.id !== appointmentId);
      this.saveAppointments(updated);
      this.updateMetrics();
      this.closeModal();
      this.renderCurrentView();
    }

    handleNavAction(action) {
      if (action === 'today') {
        this.selectedDate = new Date();
      } else if (action === 'prev') {
        this.navigateDate(-1);
      } else if (action === 'next') {
        this.navigateDate(1);
      }
      this.render();
    }

    navigateDate(direction) {
      if (this.currentView === 'month') {
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + direction, 1);
      } else if (this.currentView === 'week') {
        const d = new Date(this.selectedDate);
        d.setDate(d.getDate() + direction * 7);
        this.selectedDate = d;
      } else if (this.currentView === 'day') {
        const d = new Date(this.selectedDate);
        d.setDate(d.getDate() + direction);
        this.selectedDate = d;
      }
    }

    switchView(viewName) {
      this.currentView = viewName;

      const tabs = this.container.querySelectorAll('[data-calendar-view]');
      tabs.forEach((tab) => {
        const isActive = tab.dataset.calendarView === viewName;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      this.render();
    }

    updateHeaderLabel() {
      if (!this.labelElement) return;
      const locale = this.getLocale();

      if (this.currentView === 'month') {
        const formatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
        this.labelElement.textContent = formatter.format(this.selectedDate);
      } else if (this.currentView === 'day') {
        const formatter = new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        this.labelElement.textContent = formatter.format(this.selectedDate);
      } else if (this.currentView === 'week') {
        const startOfWeek = new Date(this.selectedDate);
        const day = (startOfWeek.getDay() + 6) % 7;
        startOfWeek.setDate(startOfWeek.getDate() - day);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const fmtDay = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
        const fmtYear = new Intl.DateTimeFormat(locale, { year: 'numeric' });
        this.labelElement.textContent = `${fmtDay.format(startOfWeek)} – ${fmtDay.format(endOfWeek)} (${fmtYear.format(endOfWeek)})`;
      }
    }

    render() {
      this.updateHeaderLabel();
      if (!this.viewContainer) return;

      this.viewContainer.setAttribute('data-active-view', this.currentView);

      if (this.currentView === 'month') {
        this.renderMonthView();
      } else if (this.currentView === 'week') {
        this.renderWeekView();
      } else if (this.currentView === 'day') {
        this.renderDayView();
      }
    }

    /* ========================================================================
       1. RENDER MONTH VIEW
       ======================================================================== */
    renderMonthView() {
      const locale = this.getLocale();
      const filtered = this.getFilteredAppointments();

      const mapByDate = {};
      filtered.forEach((apt) => {
        if (!mapByDate[apt.date]) mapByDate[apt.date] = [];
        mapByDate[apt.date].push(apt);
      });
      // Ensure each day's appointments are strictly sorted chronologically
      Object.keys(mapByDate).forEach((dateKey) => {
        mapByDate[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      const year = this.selectedDate.getFullYear();
      const month = this.selectedDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const todayKey = this.formatDateKey(new Date());

      const weekdayNames = [];
      for (let i = 0; i < 7; i++) {
        const sampleDate = new Date(2026, 0, 5 + i);
        weekdayNames.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(sampleDate));
      }

      let html = '<div class="grooming-calendar-month-grid" role="grid" aria-label="Month View">';

      weekdayNames.forEach((wName) => {
        html += `<div class="calendar-month-day-header" role="columnheader">${wName}</div>`;
      });

      // Previous month fillers
      for (let i = startDayIndex - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const prevDate = new Date(year, month - 1, dayNum);
        const dateKey = this.formatDateKey(prevDate);
        html += this.buildMonthCellHtml(dateKey, dayNum, true, false, mapByDate[dateKey] || []);
      }

      // Current month
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const currDate = new Date(year, month, dayNum);
        const dateKey = this.formatDateKey(currDate);
        const isToday = dateKey === todayKey;
        html += this.buildMonthCellHtml(dateKey, dayNum, false, isToday, mapByDate[dateKey] || []);
      }

      // Next month fillers
      const totalCells = startDayIndex + daysInMonth;
      const remainder = totalCells % 7;
      const nextFillerCount = remainder === 0 ? 0 : 7 - remainder;

      for (let dayNum = 1; dayNum <= nextFillerCount; dayNum++) {
        const nextDate = new Date(year, month + 1, dayNum);
        const dateKey = this.formatDateKey(nextDate);
        html += this.buildMonthCellHtml(dateKey, dayNum, true, false, mapByDate[dateKey] || []);
      }

      html += '</div>';
      this.viewContainer.innerHTML = html;
    }

    buildMonthCellHtml(dateKey, dayNumber, isOtherMonth, isToday, appointments) {
      const otherClass = isOtherMonth ? ' is-other-month' : '';
      const todayClass = isToday ? ' is-today' : '';
      const count = appointments.length;

      let cellHtml = `<div class="calendar-month-day-cell${otherClass}${todayClass}" role="gridcell" data-date="${dateKey}">`;
      
      cellHtml += `
        <div class="calendar-cell-top">
          <span class="calendar-day-number">${dayNumber}</span>
          ${count > 0 ? `<span class="calendar-day-count-badge" aria-label="${count} appointments">${count}</span>` : ''}
        </div>
      `;

      cellHtml += '<div class="calendar-events-stack">';
      const maxDisplay = 2;
      appointments.slice(0, maxDisplay).forEach((apt) => {
        cellHtml += `
          <button
            type="button"
            class="calendar-event-pill status-${apt.status}"
            data-appointment-id="${apt.id}"
            title="${apt.startTime} · ${apt.petName} (${apt.petBreed}) - ${this.getServiceName(apt)}"
          >
            <span class="calendar-event-pill-time">${apt.startTime}</span>
            <span class="calendar-event-pill-name">🐾 ${apt.petName}</span>
          </button>
        `;
      });

      if (count > maxDisplay) {
        const remaining = count - maxDisplay;
        cellHtml += `
          <button
            type="button"
            class="calendar-more-btn"
            data-jump-to-day="${dateKey}"
          >
            +${remaining} ${this.isEnglish() ? 'more' : 'más'}
          </button>
        `;
      }
      cellHtml += '</div>';

      cellHtml += '</div>';
      return cellHtml;
    }

    /* ========================================================================
       2. RENDER WEEK VIEW
       ======================================================================== */
    renderWeekView() {
      const locale = this.getLocale();
      const filtered = this.getFilteredAppointments();

      const startOfWeek = new Date(this.selectedDate);
      const day = (startOfWeek.getDay() + 6) % 7;
      startOfWeek.setDate(startOfWeek.getDate() - day);

      const todayKey = this.formatDateKey(new Date());

      let html = '<div class="grooming-calendar-week-grid" role="grid" aria-label="Week View">';

      for (let i = 0; i < 7; i++) {
        const colDate = new Date(startOfWeek);
        colDate.setDate(colDate.getDate() + i);
        const dateKey = this.formatDateKey(colDate);
        const isToday = dateKey === todayKey;

        const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(colDate);
        const dayNum = colDate.getDate();

        const dayAppointments = filtered.filter((apt) => apt.date === dateKey);
        dayAppointments.sort((a, b) => a.startTime.localeCompare(b.startTime));

        html += `
          <div class="calendar-week-col${isToday ? ' is-today' : ''}" role="gridcell" data-date="${dateKey}">
            <div class="calendar-week-header-cell">
              <span class="calendar-week-day-name">${dayName}</span>
              <div class="calendar-week-day-num">${dayNum}</div>
            </div>
            <div class="calendar-week-body">
        `;

        if (dayAppointments.length === 0) {
          html += `
            <div style="font-size: 0.75rem; color: rgba(var(--color-foreground), 0.4); text-align: center; margin-top: 2rem;">
              —
            </div>
          `;
        } else {
          dayAppointments.forEach((apt) => {
            html += `
              <div
                class="calendar-week-card status-${apt.status}"
                data-appointment-id="${apt.id}"
                tabindex="0"
                role="button"
              >
                <span class="calendar-week-card-time">${apt.startTime} - ${apt.endTime}</span>
                <span class="calendar-week-card-pet">🐾 ${apt.petName} <small>(${apt.petBreed})</small></span>
                <span class="calendar-week-card-service">${this.getServiceName(apt)}</span>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      }

      html += '</div>';
      this.viewContainer.innerHTML = html;
    }

    /* ========================================================================
       3. RENDER DAY VIEW
       ======================================================================== */
    renderDayView() {
      const filtered = this.getFilteredAppointments();
      const selectedKey = this.formatDateKey(this.selectedDate);

      const dayAppointments = filtered.filter((apt) => apt.date === selectedKey);
      dayAppointments.sort((a, b) => a.startTime.localeCompare(b.startTime));

      const isEn = this.isEnglish();
      const locale = this.getLocale();
      const dateTitle = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(this.selectedDate);

      let html = '<div class="grooming-calendar-day-view">';

      html += `
        <div class="calendar-day-summary-bar">
          <div>
            <h3 class="calendar-day-summary-title">${dateTitle}</h3>
            <span style="font-size: 0.85rem; color: rgba(var(--color-foreground), 0.65);">
              ${dayAppointments.length} ${isEn ? 'appointments scheduled' : 'citas agendadas'}
            </span>
          </div>
          <div class="calendar-day-summary-pills">
            <span class="calendar-day-summary-pill">
              ⏰ ${dayAppointments.length > 0 ? `${dayAppointments[0].startTime} - ${dayAppointments[dayAppointments.length - 1].endTime}` : '09:00 - 20:00'}
            </span>
            <span class="calendar-day-summary-pill">
              📍 Peluquería Canina Principal
            </span>
          </div>
        </div>
      `;

      if (dayAppointments.length === 0) {
        html += `
          <div class="calendar-empty-state">
            <div class="calendar-empty-icon" aria-hidden="true">🐶</div>
            <p class="calendar-empty-text">
              ${isEn ? 'No appointments scheduled for this day.' : 'No hay citas programadas para este día.'}
            </p>
            <button
              type="button"
              class="grooming-calendar-btn-today"
              data-calendar-view="month"
            >
              ${isEn ? 'Return to month view' : 'Volver a vista mensual'}
            </button>
          </div>
        `;
      } else {
        html += '<div class="calendar-day-timeline">';
        dayAppointments.forEach((apt) => {
          html += `
            <div
              class="calendar-day-item status-${apt.status}"
              data-appointment-id="${apt.id}"
              tabindex="0"
              role="button"
            >
              <div class="calendar-day-time-box">
                <span class="calendar-day-time-start">${apt.startTime}</span>
                <span class="calendar-day-time-end">${apt.endTime}</span>
              </div>
              <div class="calendar-day-info">
                <div class="calendar-day-pet-row">
                  <h4 class="calendar-day-pet-title">
                    🐾 ${apt.petName}
                    <span class="calendar-day-breed-tag">${apt.petBreed} · ${apt.petSize}</span>
                  </h4>
                  <span class="calendar-day-status-pill status-${apt.status}">
                    ${this.getStatusLabel(apt.status)}
                  </span>
                </div>
                <div class="calendar-day-service-name">
                  ✂️ ${this.getServiceName(apt)} · <strong>${apt.price}</strong>
                </div>
                <div class="calendar-day-customer-meta">
                  <span>👤 ${apt.customerName}</span>
                  <span>📞 <a href="tel:${apt.customerPhone}">${apt.customerPhone}</a></span>
                  <span>✉️ <a href="mailto:${apt.customerEmail}">${apt.customerEmail}</a></span>
                </div>
                ${apt.notes ? `<div class="calendar-day-notes">📝 ${apt.notes}</div>` : ''}
              </div>
            </div>
          `;
        });
        html += '</div>';
      }

      html += '</div>';
      this.viewContainer.innerHTML = html;
    }

    /* ========================================================================
       4. MODAL DIALOG MANAGEMENT (View & Create)
       ======================================================================== */
    /**
     * Generate a WhatsApp direct chat URL with pre-filled appointment reminder message
     */
    getWhatsAppReminderUrl(apt) {
      if (!apt || !apt.customerPhone) return '';

      // Normalize phone number to international format digits
      let digits = apt.customerPhone.replace(/\D/g, '');
      if (!digits) return '';

      // If Spanish 9-digit mobile (starts with 6 or 7), prepend 34
      if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7'))) {
        digits = '34' + digits;
      }

      const isEn = this.isEnglish();
      const serviceName = this.getServiceName(apt);
      const customer = apt.customerName || (isEn ? 'there' : 'tutor/a');
      const pet = apt.petName || (isEn ? 'your pet' : 'tu peludo');

      let message = '';
      if (isEn) {
        message = `Hello ${customer}! 🐾 Reminding you of the dog grooming appointment for ${pet}:\n\n` +
          `📅 Date: ${apt.date}\n` +
          `⏰ Time: ${apt.startTime} - ${apt.endTime}\n` +
          `✂️ Service: ${serviceName}\n` +
          `📍 Location: Pet Grooming Salon & Natural Store\n\n` +
          `Please reply to confirm or let us know if you need to reschedule. We look forward to seeing ${pet}! 🐶`;
      } else {
        message = `¡Hola ${customer}! 🐾 Te recordamos la cita de peluquería canina para ${pet}:\n\n` +
          `📅 Fecha: ${apt.date}\n` +
          `⏰ Horario: ${apt.startTime} - ${apt.endTime}\n` +
          `✂️ Servicio: ${serviceName}\n` +
          `📍 Lugar: Peluquería Canina & Tienda Natural\n\n` +
          `Por favor, confírmanos si podrás asistir o si necesitas modificar el horario. ¡Te esperamos a ti y a ${pet}! 🐶`;
      }

      return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    }

    openModal(appointmentId) {
      if (!this.modalBackdrop) return;
      const apt = this.appointments.find((item) => item.id === appointmentId);
      if (!apt) return;

      this.lastFocusedElement = document.activeElement;
      this.activeAppointmentId = appointmentId;
      this.isCreatingNew = false;
      const isEn = this.isEnglish();
      const whatsappUrl = this.getWhatsAppReminderUrl(apt);

      const modalTitle = this.modalBackdrop.querySelector(`#grooming-modal-title-${this.sectionId}`);
      if (modalTitle) modalTitle.textContent = isEn ? 'Appointment Details' : 'Detalle de la Cita';

      const modalBadge = this.modalBackdrop.querySelector(`#modal-status-badge-${this.sectionId}`);
      if (modalBadge) {
        modalBadge.className = `calendar-day-status-pill status-${apt.status}`;
        modalBadge.textContent = this.getStatusLabel(apt.status);
        modalBadge.removeAttribute('hidden');
      }

      const modalBody = this.modalBackdrop.querySelector(`#modal-body-content-${this.sectionId}`);
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="grooming-modal-grid-row">
            <div class="grooming-modal-field">
              <span class="grooming-modal-field-label">${isEn ? 'Pet Companion' : 'Peludo'}</span>
              <span class="grooming-modal-field-value">🐾 ${apt.petName} (${apt.petBreed})</span>
            </div>
            <div class="grooming-modal-field">
              <span class="grooming-modal-field-label">${isEn ? 'Pet Parent' : 'Tutor / Contacto'}</span>
              <span class="grooming-modal-field-value">${apt.customerName}</span>
            </div>
          </div>

          <div class="grooming-modal-grid-row">
            <div class="grooming-modal-field">
              <span class="grooming-modal-field-label">${isEn ? 'Phone' : 'Teléfono'}</span>
              <span class="grooming-modal-field-value">
                <a href="tel:${apt.customerPhone}">${apt.customerPhone}</a>
                ${whatsappUrl ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="grooming-modal-whatsapp-link" title="${isEn ? 'Open WhatsApp' : 'Abrir WhatsApp'}">💬 WhatsApp</a>` : ''}
              </span>
            </div>
            <div class="grooming-modal-field">
              <span class="grooming-modal-field-label">${isEn ? 'Email' : 'Correo electrónico'}</span>
              <span class="grooming-modal-field-value"><a href="mailto:${apt.customerEmail}">${apt.customerEmail}</a></span>
            </div>
          </div>

          <div class="grooming-modal-grid-row">
            <div class="grooming-modal-field">
              <span class="grooming-modal-field-label">${isEn ? 'Service' : 'Servicio Contratado'}</span>
              <span class="grooming-modal-field-value">${this.getServiceName(apt)}</span>
            </div>
            <div class="grooming-modal-field">
              <span class="grooming-modal-field-label">${isEn ? 'Schedule' : 'Fecha y Hora'}</span>
              <span class="grooming-modal-field-value">${apt.date} (${apt.startTime} - ${apt.endTime})</span>
            </div>
          </div>

          <div class="grooming-modal-field">
            <span class="grooming-modal-field-label">${isEn ? 'Estimated Total' : 'Importe Estimado'}</span>
            <span class="grooming-modal-field-value" style="font-size: 1.15rem; font-weight: 800; color: #047857;">${apt.price}</span>
          </div>

          <div class="grooming-modal-field">
            <span class="grooming-modal-field-label">${isEn ? 'Special Care & Grooming Notes' : 'Notas y Cuidados Especiales'}</span>
            <div class="grooming-modal-notes-box">${apt.notes || (isEn ? 'No specific notes.' : 'Sin notas específicas.')}</div>
          </div>
        `;
      }

      // Show action buttons for existing appointment
      const leftActions = this.modalBackdrop.querySelector('.grooming-modal-actions-left');
      if (leftActions) {
        leftActions.innerHTML = `
          ${whatsappUrl ? `
            <a
              href="${whatsappUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="grooming-modal-btn btn-whatsapp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-12.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.185 1.564 5.938l-1.603 5.862 6.027-1.581c1.7 1.009 3.682 1.581 5.812 1.581 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
              </svg>
              <span>${isEn ? 'WhatsApp Reminder' : 'Recordatorio WhatsApp'}</span>
            </a>
          ` : ''}
          <button
            type="button"
            class="grooming-modal-btn btn-confirm"
            data-modal-action="confirm"
          >
            ${isEn ? 'Confirm Appointment' : 'Confirmar Cita'}
          </button>
          <button
            type="button"
            class="grooming-modal-btn btn-complete"
            data-modal-action="complete"
          >
            ${isEn ? 'Mark as Completed' : 'Marcar como Realizada'}
          </button>
          <button
            type="button"
            class="grooming-modal-btn btn-cancel"
            data-modal-action="cancel"
          >
            ${isEn ? 'Cancel Appointment' : 'Cancelar Cita'}
          </button>
          <button
            type="button"
            class="grooming-modal-btn btn-delete"
            data-modal-action="delete"
            title="${isEn ? 'Permanently delete this appointment' : 'Eliminar permanentemente esta cita'}"
          >
            ${isEn ? 'Delete' : '🗑️ Eliminar'}
          </button>
        `;
      }

      this.modalBackdrop.removeAttribute('hidden');
      const closeBtn = this.modalBackdrop.querySelector('.grooming-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }

    openNewAppointmentModal() {
      if (!this.modalBackdrop) return;
      this.lastFocusedElement = document.activeElement;
      this.activeAppointmentId = null;
      this.isCreatingNew = true;
      const isEn = this.isEnglish();

      const modalTitle = this.modalBackdrop.querySelector(`#grooming-modal-title-${this.sectionId}`);
      if (modalTitle) modalTitle.textContent = isEn ? 'Book New Dog Grooming Appointment' : 'Registrar Nueva Cita de Peluquería';

      const modalBadge = this.modalBackdrop.querySelector(`#modal-status-badge-${this.sectionId}`);
      if (modalBadge) modalBadge.setAttribute('hidden', '');

      const defaultDate = this.formatDateKey(this.selectedDate);

      let servicesOptionsHtml = '';
      this.services.forEach((s, idx) => {
        servicesOptionsHtml += `<option value="${s.id}" ${idx === 0 ? 'selected' : ''}>${s.name}</option>`;
      });
      const firstService = this.services[0];
      const defaultPrice = firstService ? `${firstService.priceMedium || firstService.priceMini || 35},00 €` : '35,00 €';

      const modalBody = this.modalBackdrop.querySelector(`#modal-body-content-${this.sectionId}`);
      if (modalBody) {
        modalBody.innerHTML = `
          <form class="grooming-modal-form" id="new-appointment-form-${this.sectionId}">
            <div class="grooming-modal-form-grid">
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-pet">${isEn ? 'Pet name *' : 'Nombre del peludo *'}</label>
                <input class="grooming-modal-input" type="text" id="new-apt-pet" required placeholder="Ej. Toby">
              </div>
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-breed">${isEn ? 'Dog breed' : 'Raza de perro'}</label>
                <input class="grooming-modal-input" type="text" id="new-apt-breed" placeholder="Ej. Caniche, Teckel...">
              </div>
            </div>

            <div class="grooming-modal-form-grid" style="margin-top: 0.75rem;">
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-customer">${isEn ? 'Pet parent *' : 'Nombre del tutor *'}</label>
                <input class="grooming-modal-input" type="text" id="new-apt-customer" required placeholder="Ej. María Sánchez">
              </div>
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-phone">${isEn ? 'Contact phone *' : 'Teléfono de contacto *'}</label>
                <input class="grooming-modal-input" type="tel" id="new-apt-phone" required placeholder="+34 600 000 000">
              </div>
            </div>

            <div class="grooming-modal-form-grid" style="margin-top: 0.75rem;">
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-service">${isEn ? 'Grooming service' : 'Servicio de peluquería'}</label>
                <select class="grooming-modal-input" id="new-apt-service">
                  ${servicesOptionsHtml}
                </select>
              </div>
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-date">${isEn ? 'Date' : 'Fecha'}</label>
                <input class="grooming-modal-input" type="date" id="new-apt-date" value="${defaultDate}" required>
              </div>
            </div>

            <div class="grooming-modal-form-grid" style="margin-top: 0.75rem;">
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-time">${isEn ? 'Start time' : 'Hora de inicio'}</label>
                <input class="grooming-modal-input" type="time" id="new-apt-time" value="10:00" required>
              </div>
              <div class="grooming-modal-field">
                <label class="grooming-modal-field-label" for="new-apt-price">${isEn ? 'Estimated price' : 'Precio estimado'}</label>
                <input class="grooming-modal-input" type="text" id="new-apt-price" value="${defaultPrice}">
              </div>
            </div>

            <div class="grooming-modal-field" style="margin-top: 0.75rem;">
              <label class="grooming-modal-field-label" for="new-apt-notes">${isEn ? 'Special notes' : 'Notas y cuidados'}</label>
              <textarea class="grooming-modal-input" id="new-apt-notes" rows="2" placeholder="Sensibilidad cutánea, nudos, temperamento..."></textarea>
            </div>
          </form>
        `;

        // Automatically update estimated price when service changes
        const serviceSelectEl = this.modalBackdrop.querySelector('#new-apt-service');
        const priceInputEl = this.modalBackdrop.querySelector('#new-apt-price');
        if (serviceSelectEl && priceInputEl) {
          serviceSelectEl.addEventListener('change', (e) => {
            const matched = this.services.find((s) => s.id === e.target.value);
            if (matched) {
              const p = matched.priceMedium || matched.priceMini || 35;
              priceInputEl.value = `${p},00 €`;
            }
          });
        }
      }

      const leftActions = this.modalBackdrop.querySelector('.grooming-modal-actions-left');
      if (leftActions) {
        leftActions.innerHTML = `
          <button
            type="button"
            class="grooming-modal-btn btn-confirm"
            data-modal-action="save-new"
          >
            💾 ${isEn ? 'Save Appointment' : 'Guardar Cita'}
          </button>
        `;
      }

      this.modalBackdrop.removeAttribute('hidden');
      const petInput = this.modalBackdrop.querySelector('#new-apt-pet');
      if (petInput) petInput.focus();
    }

    handleSaveNewAppointment() {
      const pet = this.modalBackdrop.querySelector('#new-apt-pet');
      const customer = this.modalBackdrop.querySelector('#new-apt-customer');
      const phone = this.modalBackdrop.querySelector('#new-apt-phone');
      const date = this.modalBackdrop.querySelector('#new-apt-date');
      const time = this.modalBackdrop.querySelector('#new-apt-time');
      const serviceSelect = this.modalBackdrop.querySelector('#new-apt-service');
      const breed = this.modalBackdrop.querySelector('#new-apt-breed');
      const price = this.modalBackdrop.querySelector('#new-apt-price');
      const notes = this.modalBackdrop.querySelector('#new-apt-notes');

      if (!pet || !pet.value.trim() || !customer || !customer.value.trim() || !phone || !phone.value.trim()) {
        alert(this.isEnglish() ? 'Please fill in pet name, parent and phone.' : 'Por favor, completa el nombre del perro, tutor y teléfono.');
        return;
      }

      const serviceOption = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex] : null;

      const startTimeVal = time && time.value ? time.value : '10:00';
      const targetDate = date ? date.value : this.formatDateKey(new Date());

      // Prevent slot collision / double booking
      const isConflict = this.appointments.some((apt) =>
        apt.date === targetDate &&
        apt.startTime === startTimeVal &&
        apt.status !== 'cancelled'
      );
      if (isConflict) {
        alert(this.isEnglish()
          ? 'That time slot is already booked for this date. Please choose a different time.'
          : 'Esa franja horaria ya está reservada para esa fecha. Por favor, elige otra hora.');
        return;
      }

      const [sh, sm] = startTimeVal.split(':').map(Number);
      const totalEndMins = (sh || 10) * 60 + (sm || 0) + 60;
      const endH = String(Math.floor(totalEndMins / 60)).padStart(2, '0');
      const endM = String(totalEndMins % 60).padStart(2, '0');
      const endTimeVal = `${endH}:${endM}`;

      const selectedServiceId = serviceSelect ? serviceSelect.value : (this.services[0]?.id || 'bath_hygiene');
      const matchedService = this.services.find((s) => s.id === selectedServiceId);
      const serviceName = matchedService ? matchedService.name : (serviceOption ? serviceOption.text : 'Peluquería Canina');

      const newApt = {
        id: `apt-${Date.now()}`,
        date: targetDate,
        startTime: startTimeVal,
        endTime: endTimeVal,
        customerName: customer.value.trim(),
        customerPhone: phone.value.trim(),
        customerEmail: 'contacto@cliente.es',
        petName: pet.value.trim(),
        petBreed: (breed && breed.value.trim()) || 'Mestizo',
        petSize: 'medium',
        serviceId: selectedServiceId,
        serviceNameEs: serviceName,
        serviceNameEn: serviceName,
        status: 'confirmed',
        price: (price && price.value.trim()) || '35,00 €',
        notes: (notes && notes.value.trim()) || '',
      };

      this.appointments.push(newApt);
      this.saveAppointments(this.appointments);
      this.updateMetrics();
      this.render();
      this.closeModal();
    }

    closeModal() {
      if (!this.modalBackdrop) return;
      this.modalBackdrop.setAttribute('hidden', '');
      this.activeAppointmentId = null;
      this.isCreatingNew = false;
      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
        this.lastFocusedElement.focus();
      }
    }

    updateAppointmentStatus(appointmentId, newStatus) {
      const idx = this.appointments.findIndex((item) => item.id === appointmentId);
      if (idx !== -1) {
        this.appointments[idx].status = newStatus;
        this.saveAppointments(this.appointments);
        this.updateMetrics();
        this.render();
        this.closeModal();
      }
    }
  }

  // Global instances registry for cross-component triggers
  window.groomingCalendarInstances = window.groomingCalendarInstances || [];

  window.refreshAllGroomingCalendars = function () {
    window.groomingCalendarInstances.forEach((inst) => {
      if (inst && typeof inst.render === 'function') {
        inst.updateMetrics();
        inst.render();
      }
    });
  };

  // Initialize on DOM ready
  function initAllGroomingCalendars() {
    document.querySelectorAll('.grooming-calendar-section').forEach((calendarEl) => {
      if (!calendarEl.__groomingCalendarInstance) {
        const instance = new GroomingCalendar(calendarEl);
        calendarEl.__groomingCalendarInstance = instance;
        window.groomingCalendarInstances.push(instance);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllGroomingCalendars);
  } else {
    initAllGroomingCalendars();
  }

  window.GroomingCalendar = GroomingCalendar;
})();
