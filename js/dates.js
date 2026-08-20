/**
 * KonkanTrip - Screen 03: Date & Guest Selection Controller
 * Handles two-month calendar rendering, check-in/out range selection,
 * hover preview, minimum stay business rules, guest steppers, live summary,
 * validation alerts, dev state switcher, and transition to Screen 04.
 */

class KonkanDatesController {
  constructor() {
    this.destination = {
      name: 'Dapoli',
      district: 'Ratnagiri District',
      state: 'Maharashtra',
      minimumStay: 2,
      maximumStay: 14,
      seasonalNotice: 'Monsoon special: Flexible 24h cancellation on coastal cliff villas.',
      pricingRange: '₹3,800 – ₹12,500 / night'
    };

    this.datesState = {
      checkIn: null,   // Date object
      checkOut: null,  // Date object
      hoverDate: null  // Date object during selection
    };

    this.guestState = {
      rooms: 1,
      adults: 2,
      children: 0,
      pets: false
    };

    this.calendarMonthOffset = 0; // 0 = current month, 1 = next month, etc.
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.readQueryParams();
    this.initDefaultDates();
    this.bindEvents();
    
    // Fetch real backend destination metadata & rules
    await this.loadDestinationRules();
    this.renderCalendar();
    this.updateStaySummary();
    this.updateWishlistCount();
  }

  cacheDom() {
    // Header & Navigation
    this.dom.siteHeader = document.getElementById('siteHeader');
    this.dom.destNameDisplay = document.getElementById('destNameDisplay');
    this.dom.destDistrictDisplay = document.getElementById('destDistrictDisplay');
    this.dom.changeDestLink = document.getElementById('changeDestLink');

    // Calendar
    this.dom.dualMonthsWrapper = document.getElementById('dualMonthsWrapper');
    this.dom.calPrevBtn = document.getElementById('calPrevBtn');
    this.dom.calNextBtn = document.getElementById('calNextBtn');
    this.dom.calDateStatusPill = document.getElementById('calDateStatusPill');
    this.dom.minStayBadge = document.getElementById('minStayBadge');

    // Guest Selector
    this.dom.guestTriggerCard = document.getElementById('guestTriggerCard');
    this.dom.guestPopoverPanel = document.getElementById('guestPopoverPanel');
    this.dom.guestSummaryText = document.getElementById('guestSummaryText');
    this.dom.adultsVal = document.getElementById('adultsCount');
    this.dom.childrenVal = document.getElementById('childrenCount');
    this.dom.roomsVal = document.getElementById('roomsCount');
    this.dom.childAgeContainer = document.getElementById('childAgeContainer');
    this.dom.datesPetsToggle = document.getElementById('datesPetsToggle');
    this.dom.guestDoneBtn = document.getElementById('guestDoneBtn');

    // Stay Live Summary Card
    this.dom.summaryDestText = document.getElementById('summaryDestText');
    this.dom.summaryDatesText = document.getElementById('summaryDatesText');
    this.dom.summaryNightsText = document.getElementById('summaryNightsText');
    this.dom.summaryGuestsText = document.getElementById('summaryGuestsText');
    this.dom.summaryAdvisoryText = document.getElementById('summaryAdvisoryText');
    this.dom.validationAlertBox = document.getElementById('validationAlertBox');
    this.dom.validationAlertText = document.getElementById('validationAlertText');
    this.dom.searchStaysCta = document.getElementById('searchStaysCta');

    // State Area
    this.dom.stateFeedbackArea = document.getElementById('stateFeedbackArea');

    // Mobile specific
    this.dom.mobileCheckInCard = document.getElementById('mobileCheckInCard');
    this.dom.mobileCheckOutCard = document.getElementById('mobileCheckOutCard');
    this.dom.mobileCheckInVal = document.getElementById('mobileCheckInVal');
    this.dom.mobileCheckOutVal = document.getElementById('mobileCheckOutVal');
    this.dom.mobileBottomSummary = document.getElementById('mobileBottomSummary');
    this.dom.mobileBottomCta = document.getElementById('mobileBottomCta');

    // Modals & Drawers
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.wishlistDrawer = document.getElementById('wishlistDrawer');
    this.dom.wishlistDrawerBody = document.getElementById('wishlistDrawerBody');
    this.dom.tripsDrawer = document.getElementById('tripsDrawer');
    this.dom.tripsDrawerBody = document.getElementById('tripsDrawerBody');
    this.dom.authModal = document.getElementById('authModal');
    this.dom.mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    this.dom.toastContainer = document.getElementById('toastContainer');
    this.dom.wishlistBadges = document.querySelectorAll('.wishlist-count-badge');
  }

  readQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('dest') || params.get('destination');
    const adults = params.get('adults');
    const children = params.get('children');
    const rooms = params.get('rooms');

    if (dest) {
      this.destination.name = decodeURIComponent(dest);
    } else {
      const stored = apiService.getSelectedDestination();
      if (stored && stored.name) {
        this.destination.name = stored.name;
        this.destination.district = stored.district || 'Maharashtra';
      }
    }

    if (adults) this.guestState.adults = parseInt(adults, 10);
    if (children) this.guestState.children = parseInt(children, 10);
    if (rooms) this.guestState.rooms = parseInt(rooms, 10);
    if (params.get('pets') === 'true') {
      this.guestState.pets = true;
      if (this.dom.datesPetsToggle) this.dom.datesPetsToggle.checked = true;
    }
  }

  initDefaultDates() {
    const today = new Date();
    // Default check-in: 5 days from today
    const checkIn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
    // Default check-out: checkIn + minimumStay (2 nights)
    const checkOut = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + this.destination.minimumStay);

    this.datesState.checkIn = checkIn;
    this.datesState.checkOut = checkOut;
  }

  async loadDestinationRules() {
    try {
      const rules = await apiService.fetchDestinationDetails(this.destination.name);
      if (rules) {
        this.destination = { ...this.destination, ...rules };
      }

      if (this.dom.destNameDisplay) this.dom.destNameDisplay.textContent = this.destination.name;
      if (this.dom.destDistrictDisplay) this.dom.destDistrictDisplay.textContent = `${this.destination.district}, Maharashtra`;
      if (this.dom.minStayBadge) this.dom.minStayBadge.textContent = `Minimum stay: ${this.destination.minimumStay} nights`;
      if (this.dom.summaryAdvisoryText) this.dom.summaryAdvisoryText.textContent = this.destination.seasonalNotice || '';
    } catch (e) {
      console.warn('Could not load destination rules', e);
    }
  }

  bindEvents() {
    // Month navigation
    this.dom.calPrevBtn?.addEventListener('click', () => {
      if (this.calendarMonthOffset > 0) {
        this.calendarMonthOffset--;
        this.renderCalendar();
      }
    });

    this.dom.calNextBtn?.addEventListener('click', () => {
      this.calendarMonthOffset++;
      this.renderCalendar();
    });

    // Guest Selector toggle
    this.dom.guestTriggerCard?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleGuestPopover();
    });

    this.dom.guestDoneBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeGuestPopover();
    });

    // Guest counter buttons
    document.querySelectorAll('[data-guest-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-guest-action');
        const target = btn.getAttribute('data-guest-target');
        this.handleGuestCounter(target, action);
      });
    });

    // Pet Friendly toggle
    this.dom.datesPetsToggle?.addEventListener('change', (e) => {
      this.guestState.pets = e.target.checked;
      this.updateStaySummary();
    });

    // Close guest popover on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#guestTriggerCard') && !e.target.closest('#guestPopoverPanel')) {
        this.closeGuestPopover();
      }
    });

    // Search Stays CTA click
    this.dom.searchStaysCta?.addEventListener('click', () => {
      this.validateAndSearch();
    });

    this.dom.mobileBottomCta?.addEventListener('click', () => {
      this.validateAndSearch();
    });

    // Global Modal Close Buttons
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    this.dom.modalBackdrop?.addEventListener('click', () => {
      this.closeAllModals();
    });

    // Header Drawer Actions
    document.querySelectorAll('[data-action="open-wishlist"]').forEach(el => {
      el.addEventListener('click', () => this.openWishlistDrawer());
    });

    document.querySelectorAll('[data-action="open-trips"]').forEach(el => {
      el.addEventListener('click', () => this.openTripsDrawer());
    });

    document.querySelectorAll('[data-action="open-auth"]').forEach(el => {
      el.addEventListener('click', () => this.openAuthModal());
    });

    document.querySelectorAll('[data-action="toggle-mobile-menu"]').forEach(el => {
      el.addEventListener('click', () => this.openMobileMenu());
    });

    // Dev State Switcher
    document.querySelectorAll('.dev-state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dev-state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.switchDevState(mode);
      });
    });
  }

  // =========================================================================
  // Calendar Rendering & Logic
  // =========================================================================

  renderCalendar() {
    if (!this.dom.dualMonthsWrapper) return;

    // Disable prev button if on current month
    if (this.dom.calPrevBtn) {
      this.dom.calPrevBtn.disabled = this.calendarMonthOffset === 0;
    }

    const today = new Date();
    const baseMonthDate = new Date(today.getFullYear(), today.getMonth() + this.calendarMonthOffset, 1);
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + this.calendarMonthOffset + 1, 1);

    const month1Html = this.generateMonthHtml(baseMonthDate);
    const month2Html = this.generateMonthHtml(nextMonthDate);

    this.dom.dualMonthsWrapper.innerHTML = month1Html + month2Html;

    // Update status pill
    if (this.dom.calDateStatusPill) {
      if (!this.datesState.checkIn) {
        this.dom.calDateStatusPill.textContent = '1. Select Check-in Date';
      } else if (!this.datesState.checkOut) {
        this.dom.calDateStatusPill.textContent = `2. Select Checkout Date (Min. ${this.destination.minimumStay} nights)`;
      } else {
        const nights = this.calculateNights(this.datesState.checkIn, this.datesState.checkOut);
        this.dom.calDateStatusPill.textContent = `${nights} Nights Selected (${this.formatDateShort(this.datesState.checkIn)} – ${this.formatDateShort(this.datesState.checkOut)})`;
      }
    }

    this.bindCalendarCellEvents();
  }

  generateMonthHtml(monthDate) {
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Days count and starting weekday
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayIndex = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const weekdaysHtml = weekdays.map(w => `<div class="weekday-col-label">${w}</div>`).join('');

    let daysHtml = '';
    // Empty cells before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      daysHtml += `<div class="date-cell date-cell-empty"></div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, monthIndex, d);
      cellDate.setHours(0, 0, 0, 0);

      const isPast = cellDate < today;
      const isCheckIn = this.isSameDate(cellDate, this.datesState.checkIn);
      const isCheckOut = this.isSameDate(cellDate, this.datesState.checkOut);
      const isInRange = this.isDateInRange(cellDate, this.datesState.checkIn, this.datesState.checkOut);
      const isHoverRange = this.isDateInHoverRange(cellDate);

      let classes = ['date-cell'];
      if (isPast) classes.push('date-cell-disabled');
      if (isCheckIn) {
        classes.push('date-cell-checkin');
        if (this.datesState.checkOut) classes.push('has-range');
      }
      if (isCheckOut) {
        classes.push('date-cell-checkout');
        if (this.datesState.checkIn) classes.push('has-range');
      }
      if (isInRange) classes.push('date-cell-in-range');
      if (isHoverRange) classes.push('date-cell-hover-range');

      const dateStr = this.formatDateISO(cellDate);

      daysHtml += `
        <div class="${classes.join(' ')}" data-date="${dateStr}" role="gridcell" tabindex="${isPast ? '-1' : '0'}">
          <span class="date-cell-number">${d}</span>
        </div>
      `;
    }

    return `
      <div class="single-month-block">
        <h3 class="month-title-header">${monthName}</h3>
        <div class="weekdays-grid">${weekdaysHtml}</div>
        <div class="month-days-grid">${daysHtml}</div>
      </div>
    `;
  }

  bindCalendarCellEvents() {
    const cells = this.dom.dualMonthsWrapper.querySelectorAll('.date-cell:not(.date-cell-empty):not(.date-cell-disabled)');

    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const dateStr = cell.getAttribute('data-date');
        if (!dateStr) return;
        const clickedDate = new Date(dateStr + 'T00:00:00');
        this.handleDateClick(clickedDate);
      });

      cell.addEventListener('mouseenter', () => {
        const dateStr = cell.getAttribute('data-date');
        if (!dateStr) return;
        const hoveredDate = new Date(dateStr + 'T00:00:00');
        this.handleDateHover(hoveredDate);
      });
    });

    this.dom.dualMonthsWrapper.addEventListener('mouseleave', () => {
      this.datesState.hoverDate = null;
      this.renderCalendar();
    });
  }

  handleDateClick(clickedDate) {
    this.hideValidationAlert();

    if (!this.datesState.checkIn || (this.datesState.checkIn && this.datesState.checkOut)) {
      // Step 1: Select Check-in
      this.datesState.checkIn = clickedDate;
      this.datesState.checkOut = null;
      this.renderCalendar();
      this.updateStaySummary();
      this.showToast(`Check-in selected: ${this.formatDateShort(clickedDate)}. Now choose checkout.`);
    } else if (this.datesState.checkIn && !this.datesState.checkOut) {
      // Step 2: Select Check-out
      if (clickedDate <= this.datesState.checkIn) {
        // Reset check-in to clicked earlier date
        this.datesState.checkIn = clickedDate;
        this.datesState.checkOut = null;
        this.renderCalendar();
        this.updateStaySummary();
        this.showToast(`Check-in updated: ${this.formatDateShort(clickedDate)}`);
      } else {
        const nights = this.calculateNights(this.datesState.checkIn, clickedDate);
        if (nights < this.destination.minimumStay) {
          this.showValidationAlert(`Minimum stay for ${this.destination.name} is ${this.destination.minimumStay} nights.`);
        }
        this.datesState.checkOut = clickedDate;
        this.renderCalendar();
        this.updateStaySummary();
        this.showToast(`Dates confirmed: ${this.formatDateShort(this.datesState.checkIn)} to ${this.formatDateShort(clickedDate)} (${nights} nights)`);
      }
    }
  }

  handleDateHover(hoveredDate) {
    if (this.datesState.checkIn && !this.datesState.checkOut) {
      if (hoveredDate > this.datesState.checkIn) {
        this.datesState.hoverDate = hoveredDate;
        this.renderCalendar();
      }
    }
  }

  isDateInRange(date, start, end) {
    if (!start || !end || !date) return false;
    return date > start && date < end;
  }

  isDateInHoverRange(date) {
    if (!this.datesState.checkIn || this.datesState.checkOut || !this.datesState.hoverDate) return false;
    return date > this.datesState.checkIn && date <= this.datesState.hoverDate;
  }

  isSameDate(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.round(diff / (1000 * 3600 * 24)));
  }

  formatDateShort(d) {
    if (!d) return '--';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  formatDateFull(d) {
    if (!d) return '--';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateISO(d) {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }

  // =========================================================================
  // Guest & Room Steppers
  // =========================================================================

  toggleGuestPopover() {
    const isOpen = this.dom.guestPopoverPanel?.classList.contains('open');
    if (isOpen) {
      this.closeGuestPopover();
    } else {
      this.openGuestPopover();
    }
  }

  openGuestPopover() {
    this.dom.guestPopoverPanel?.classList.add('open');
    this.dom.guestTriggerCard?.classList.add('open');
  }

  closeGuestPopover() {
    this.dom.guestPopoverPanel?.classList.remove('open');
    this.dom.guestTriggerCard?.classList.remove('open');
  }

  handleGuestCounter(target, action) {
    if (target === 'adults') {
      if (action === 'inc') this.guestState.adults = Math.min(10, this.guestState.adults + 1);
      if (action === 'dec') this.guestState.adults = Math.max(1, this.guestState.adults - 1);
      if (this.dom.adultsVal) this.dom.adultsVal.textContent = this.guestState.adults;
    } else if (target === 'children') {
      if (action === 'inc') this.guestState.children = Math.min(6, this.guestState.children + 1);
      if (action === 'dec') this.guestState.children = Math.max(0, this.guestState.children - 1);
      if (this.dom.childrenVal) this.dom.childrenVal.textContent = this.guestState.children;
    } else if (target === 'rooms') {
      if (action === 'inc') this.guestState.rooms = Math.min(5, this.guestState.rooms + 1);
      if (action === 'dec') this.guestState.rooms = Math.max(1, this.guestState.rooms - 1);
      if (this.dom.roomsVal) this.dom.roomsVal.textContent = this.guestState.rooms;
    }

    // Toggle child age notice
    if (this.dom.childAgeContainer) {
      this.dom.childAgeContainer.style.display = this.guestState.children > 0 ? 'block' : 'none';
    }

    this.updateStaySummary();
  }

  // =========================================================================
  // Live Stay Summary Card Updates
  // =========================================================================

  updateStaySummary() {
    // Destination
    if (this.dom.summaryDestText) {
      this.dom.summaryDestText.textContent = `${this.destination.name}, ${this.destination.district}`;
    }

    // Dates
    if (this.dom.summaryDatesText) {
      if (this.datesState.checkIn && this.datesState.checkOut) {
        this.dom.summaryDatesText.textContent = `${this.formatDateShort(this.datesState.checkIn)} – ${this.formatDateShort(this.datesState.checkOut)}`;
      } else if (this.datesState.checkIn) {
        this.dom.summaryDatesText.textContent = `${this.formatDateShort(this.datesState.checkIn)} – Select Checkout`;
      } else {
        this.dom.summaryDatesText.textContent = 'Select Dates';
      }
    }

    // Nights
    if (this.dom.summaryNightsText) {
      const nights = this.calculateNights(this.datesState.checkIn, this.datesState.checkOut);
      this.dom.summaryNightsText.textContent = nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '--';
    }

    // Guests string
    const childText = this.guestState.children > 0 ? `, ${this.guestState.children} Child${this.guestState.children > 1 ? 'ren' : ''}` : '';
    const roomText = `${this.guestState.rooms} Room${this.guestState.rooms > 1 ? 's' : ''}`;
    const petText = this.guestState.pets ? ' · 🐾 Pets' : '';
    const guestString = `${this.guestState.adults} Adults${childText} · ${roomText}${petText}`;

    if (this.dom.summaryGuestsText) {
      this.dom.summaryGuestsText.textContent = guestString;
    }
    if (this.dom.guestSummaryText) {
      this.dom.guestSummaryText.textContent = guestString;
    }

    // Mobile cards sync
    if (this.dom.mobileCheckInVal) {
      this.dom.mobileCheckInVal.textContent = this.formatDateShort(this.datesState.checkIn);
    }
    if (this.dom.mobileCheckOutVal) {
      this.dom.mobileCheckOutVal.textContent = this.formatDateShort(this.datesState.checkOut);
    }
    if (this.dom.mobileBottomSummary) {
      const nights = this.calculateNights(this.datesState.checkIn, this.datesState.checkOut);
      this.dom.mobileBottomSummary.textContent = `${this.destination.name} · ${nights} Nights · ${this.guestState.adults} Guests`;
    }
  }

  // =========================================================================
  // Validation & Search Stays Transition
  // =========================================================================

  validateAndSearch() {
    this.hideValidationAlert();

    if (!this.datesState.checkIn) {
      this.showValidationAlert('Please select a check-in date.');
      return;
    }

    if (!this.datesState.checkOut) {
      this.showValidationAlert('Please select a checkout date.');
      return;
    }

    if (this.datesState.checkOut <= this.datesState.checkIn) {
      this.showValidationAlert('Checkout must be after check-in.');
      return;
    }

    const nights = this.calculateNights(this.datesState.checkIn, this.datesState.checkOut);
    if (nights < this.destination.minimumStay) {
      this.showValidationAlert(`Minimum stay for ${this.destination.name} is ${this.destination.minimumStay} nights.`);
      return;
    }

    const totalGuests = this.guestState.adults + this.guestState.children;
    if (totalGuests < 1) {
      this.showValidationAlert('Please choose at least one guest.');
      return;
    }

    // Build Search Query parameters for Screen 04
    const checkInStr = this.formatDateISO(this.datesState.checkIn);
    const checkOutStr = this.formatDateISO(this.datesState.checkOut);
    const destParam = encodeURIComponent(this.destination.name);
    const adults = this.guestState.adults;
    const children = this.guestState.children;
    const rooms = this.guestState.rooms;

    this.showToast(`Criteria verified! Searching verified stays in ${this.destination.name}...`);

    // Seamless navigation to Screen 04 (Search Results Discovery)
    setTimeout(() => {
      window.location.href = `results.html?dest=${destParam}&checkIn=${checkInStr}&checkOut=${checkOutStr}&adults=${adults}&children=${children}&rooms=${rooms}&nights=${nights}${this.guestState.pets ? '&pets=true' : ''}`;
    }, 450);
  }

  showValidationAlert(msg) {
    if (this.dom.validationAlertBox && this.dom.validationAlertText) {
      this.dom.validationAlertText.textContent = msg;
      this.dom.validationAlertBox.classList.add('visible');
    }
    this.showToast(msg);
  }

  hideValidationAlert() {
    if (this.dom.validationAlertBox) {
      this.dom.validationAlertBox.classList.remove('visible');
    }
  }

  // =========================================================================
  // State Switcher (Success / Loading / No Availability / Error / Validation)
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);
    this.clearStateFeedback();
    this.hideValidationAlert();

    if (mode === 'LOADING') {
      this.renderLoadingSkeletons();
      this.showToast('Switched to Loading Skeletons State');
    } else if (mode === 'EMPTY' || mode === 'NO_AVAILABILITY') {
      this.renderNoAvailabilityState();
      this.showToast('Switched to No Availability State');
    } else if (mode === 'ERROR') {
      this.renderApiError('Simulated Network Error', () => this.switchDevState('SUCCESS'));
      this.showToast('Switched to API Error State');
    } else {
      this.renderCalendar();
      this.updateStaySummary();
      this.showToast('Switched to Success Loaded State');
    }
  }

  renderLoadingSkeletons() {
    if (this.dom.dualMonthsWrapper) {
      this.dom.dualMonthsWrapper.innerHTML = `
        <div class="skeleton-card" style="height: 320px;"></div>
        <div class="skeleton-card" style="height: 320px;"></div>
      `;
    }
  }

  renderNoAvailabilityState() {
    if (this.dom.stateFeedbackArea) {
      this.dom.stateFeedbackArea.innerHTML = `
        <div class="no-avail-card">
          <div class="no-results-icon-bubble">
            <svg class="icon-inline" style="width:34px; height:34px;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h3 class="no-results-title">No Stays Available for Selected Dates</h3>
          <p class="no-results-desc">
            All beachfront villas and heritage wadas in <strong>${this.destination.name}</strong> are currently reserved for these dates.
          </p>
          <div class="alt-dates-chips">
            <button class="alt-chip-btn" onclick="window.konkanDates.selectNextWeekend()">Next Weekend (Fri–Sun)</button>
            <button class="alt-chip-btn" onclick="window.konkanDates.selectInTwoWeeks()">Following Weekend</button>
            <button class="alt-chip-btn" onclick="window.konkanDates.selectMidweekSpecial()">Midweek Special (-20% Off)</button>
          </div>
        </div>
      `;
    }
  }

  selectNextWeekend() {
    const today = new Date();
    const nextFri = new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((5 + 7 - today.getDay()) % 7 || 7));
    const nextSun = new Date(nextFri.getFullYear(), nextFri.getMonth(), nextFri.getDate() + 2);
    this.datesState.checkIn = nextFri;
    this.datesState.checkOut = nextSun;
    this.switchDevState('SUCCESS');
  }

  selectInTwoWeeks() {
    const today = new Date();
    const inTwoWeeksFri = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    const inTwoWeeksSun = new Date(inTwoWeeksFri.getFullYear(), inTwoWeeksFri.getMonth(), inTwoWeeksFri.getDate() + 2);
    this.datesState.checkIn = inTwoWeeksFri;
    this.datesState.checkOut = inTwoWeeksSun;
    this.switchDevState('SUCCESS');
  }

  selectMidweekSpecial() {
    const today = new Date();
    const nextTue = new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((2 + 7 - today.getDay()) % 7 || 7));
    const nextThu = new Date(nextTue.getFullYear(), nextTue.getMonth(), nextTue.getDate() + 2);
    this.datesState.checkIn = nextTue;
    this.datesState.checkOut = nextThu;
    this.switchDevState('SUCCESS');
  }

  renderApiError(message, retryCallback) {
    if (this.dom.stateFeedbackArea) {
      this.dom.stateFeedbackArea.innerHTML = `
        <div class="api-error-card">
          <div class="api-error-icon-bubble">
            <svg class="icon-inline" style="width:32px; height:32px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 class="api-error-title">Something went wrong.</h3>
          <p class="api-error-desc">We couldn't connect to the inventory system. (${message})</p>
          <button class="btn btn-primary" id="retryDatesBtn">
            <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>Try Again</span>
          </button>
        </div>
      `;

      document.getElementById('retryDatesBtn')?.addEventListener('click', () => {
        this.clearStateFeedback();
        if (typeof retryCallback === 'function') retryCallback();
      });
    }
  }

  clearStateFeedback() {
    if (this.dom.stateFeedbackArea) {
      this.dom.stateFeedbackArea.innerHTML = '';
    }
  }

  // =========================================================================
  // Drawers & Modals
  // =========================================================================

  openWishlistDrawer() {
    this.closeAllModals();
    const wishlistIds = apiService.getWishlist();

    if (this.dom.wishlistDrawerBody) {
      if (wishlistIds.length === 0) {
        this.dom.wishlistDrawerBody.innerHTML = `
          <div style="text-align: center; padding: 48px 16px;">
            <p style="color: var(--color-text-secondary);">No saved coastal stays yet.</p>
          </div>
        `;
      } else {
        const savedStays = STAYS_DATA.filter(s => wishlistIds.includes(s.id));
        this.dom.wishlistDrawerBody.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${savedStays.map(s => `
              <div style="display:flex; gap:12px; align-items:center; background:#F8FCFC; padding:10px; border-radius:12px; border:1px solid var(--color-border-subtle);">
                <img src="${s.image}" style="width:68px; height:68px; border-radius:8px; object-fit:cover;" />
                <div style="flex:1;">
                  <h4 style="font-size:0.95rem; font-weight:700;">${s.title}</h4>
                  <div style="font-size:0.8rem; color:var(--color-text-secondary);">${s.destinationName}</div>
                  <div style="font-size:0.9rem; font-weight:800; color:var(--color-primary); margin-top:3px;">₹${s.pricePerNight.toLocaleString('en-IN')}/night</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    this.dom.modalBackdrop?.classList.add('open');
    this.dom.wishlistDrawer?.classList.add('open');
  }

  openTripsDrawer() {
    this.closeAllModals();
    const trips = apiService.getMyTrips();

    if (this.dom.tripsDrawerBody) {
      this.dom.tripsDrawerBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${trips.map(trip => `
            <div style="background:#FAFDFD; border:1px solid var(--color-border-subtle); border-radius:12px; padding:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge badge-green">${trip.status}</span>
                <span style="font-size:0.75rem; color:var(--color-text-secondary); font-family:monospace;">${trip.id}</span>
              </div>
              <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:4px;">${trip.stayTitle}</h4>
              <div style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:8px;">${trip.destinationName}</div>
              <div style="font-size:0.82rem; color:var(--color-text-primary); font-weight:600;">
                Dates: ${trip.checkIn} to ${trip.checkOut}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.dom.modalBackdrop?.classList.add('open');
    this.dom.tripsDrawer?.classList.add('open');
  }

  openAuthModal() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.authModal?.classList.add('open');
  }

  openMobileMenu() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.mobileMenuDrawer?.classList.add('open');
  }

  closeAllModals() {
    this.dom.modalBackdrop?.classList.remove('open');
    this.dom.wishlistDrawer?.classList.remove('open');
    this.dom.tripsDrawer?.classList.remove('open');
    this.dom.authModal?.classList.remove('open');
    this.dom.mobileMenuDrawer?.classList.remove('open');
    this.closeGuestPopover();
  }

  updateWishlistCount() {
    const list = apiService.getWishlist();
    this.dom.wishlistBadges?.forEach(b => {
      b.textContent = list.length;
    });
  }

  showToast(message) {
    if (!this.dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-bubble';
    toast.innerHTML = `
      <svg class="icon-inline icon-sm" style="color:var(--color-konkan-sun);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <span>${message}</span>
    `;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.konkanDates = new KonkanDatesController();
  window.konkanDates.init();
});
