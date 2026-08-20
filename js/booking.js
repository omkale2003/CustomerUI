/**
 * KonkanTrip — Screen 06: Customer Guest Details & Booking Controller
 * Handles focused checkout flow, customer profile prefill, dynamic additional guests,
 * special requests chips, GST invoice progressive disclosure, live transparent price breakdown,
 * room hold countdown timer, price change alert modal, validation, and transition to Screen 07.
 */

class KonkanBookingController {
  constructor() {
    this.bookingState = {
      propertyId: 'stay-03',
      roomId: 'room-03-a',
      checkIn: '2026-08-24',
      checkOut: '2026-08-26',
      adults: 2,
      children: 0,
      rooms: 1,
      nights: 2,
      totalAmount: 14515,
      invoiceType: 'personal' // 'personal' or 'business'
    };

    this.propertyData = null;
    this.selectedRoom = null;
    this.customerProfile = null;
    this.countdownSeconds = 15 * 60; // 15-min inventory hold
    this.timerInterval = null;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    this.startHoldCountdown();
    await this.loadInitialData();
  }

  cacheDom() {
    // Form Inputs
    this.dom.firstName = document.getElementById('guestFirstName');
    this.dom.lastName = document.getElementById('guestLastName');
    this.dom.email = document.getElementById('guestEmail');
    this.dom.phone = document.getElementById('guestPhone');
    this.dom.prefillBanner = document.getElementById('prefillUserBanner');
    this.dom.prefillNameSpan = document.getElementById('prefillNameSpan');
    this.dom.prefillEditBtn = document.getElementById('prefillEditBtn');

    // Additional Guests & Requests
    this.dom.additionalGuestsSection = document.getElementById('additionalGuestsSection');
    this.dom.additionalGuestsContainer = document.getElementById('additionalGuestsContainer');
    this.dom.specialRequestsText = document.getElementById('specialRequestsText');
    this.dom.arrivalTimeSelect = document.getElementById('arrivalTimeSelect');

    // GST Invoice Toggle
    this.dom.invoiceRadioPersonal = document.getElementById('invoicePersonal');
    this.dom.invoiceRadioBusiness = document.getElementById('invoiceBusiness');
    this.dom.gstDisclosurePanel = document.getElementById('gstDisclosurePanel');
    this.dom.companyName = document.getElementById('companyName');
    this.dom.companyGstin = document.getElementById('companyGstin');
    this.dom.billingAddress = document.getElementById('billingAddress');

    // Terms & Alerts
    this.dom.termsCheckbox = document.getElementById('termsCheckbox');
    this.dom.alertBanner = document.getElementById('checkoutAlertBanner');
    this.dom.alertText = document.getElementById('checkoutAlertText');
    this.dom.reviewBookingCta = document.getElementById('reviewBookingCta');
    this.dom.mobileReviewCta = document.getElementById('mobileReviewCta');

    // Sticky Summary Elements
    this.dom.summaryPropImg = document.getElementById('summaryPropImg');
    this.dom.summaryPropTitle = document.getElementById('summaryPropTitle');
    this.dom.summaryPropLocation = document.getElementById('summaryPropLocation');
    this.dom.summaryPropRating = document.getElementById('summaryPropRating');
    this.dom.summaryDates = document.getElementById('summaryDates');
    this.dom.summaryNights = document.getElementById('summaryNights');
    this.dom.summaryGuests = document.getElementById('summaryGuests');
    this.dom.summaryRoomName = document.getElementById('summaryRoomName');
    this.dom.summaryBasePrice = document.getElementById('summaryBasePrice');
    this.dom.summaryDiscount = document.getElementById('summaryDiscount');
    this.dom.summaryTaxes = document.getElementById('summaryTaxes');
    this.dom.summaryTotal = document.getElementById('summaryTotal');
    this.dom.sessionTimer = document.getElementById('sessionCountdownTimer');
    this.dom.mobileStickyTotal = document.getElementById('mobileStickyTotal');

    // Modals
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.priceChangeModal = document.getElementById('priceChangeModal');
    this.dom.pricePrevVal = document.getElementById('pricePrevVal');
    this.dom.priceUpdatedVal = document.getElementById('priceUpdatedVal');
    this.dom.cancellationModal = document.getElementById('cancellationModal');
    this.dom.cancellationModalBody = document.getElementById('cancellationModalBody');
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const propId = params.get('propertyId') || params.get('id');
    const roomId = params.get('roomId');
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const adults = params.get('adults');
    const children = params.get('children');
    const rooms = params.get('rooms');

    if (propId) this.bookingState.propertyId = propId;
    if (roomId) this.bookingState.roomId = roomId;
    if (checkIn) this.bookingState.checkIn = checkIn;
    if (checkOut) this.bookingState.checkOut = checkOut;
    if (adults) this.bookingState.adults = parseInt(adults, 10);
    if (children) this.bookingState.children = parseInt(children, 10);
    if (rooms) this.bookingState.rooms = parseInt(rooms, 10);

    // Compute stay nights
    if (this.bookingState.checkIn && this.bookingState.checkOut) {
      const d1 = new Date(this.bookingState.checkIn);
      const d2 = new Date(this.bookingState.checkOut);
      const diff = Math.max(1, Math.round((d2 - d1) / (1000 * 3600 * 24)));
      this.bookingState.nights = diff;
    }
  }

  bindEvents() {
    // Logged-in profile Edit toggle
    this.dom.prefillEditBtn?.addEventListener('click', () => {
      this.enableFieldEditing();
    });

    // Special Requests Preset Chips
    document.querySelectorAll('.preset-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-request-text');
        this.appendSpecialRequest(text);
      });
    });

    // GST Invoice Toggle
    this.dom.invoiceRadioPersonal?.addEventListener('change', () => {
      this.bookingState.invoiceType = 'personal';
      this.dom.gstDisclosurePanel?.classList.remove('open');
      document.querySelectorAll('.radio-choice-card').forEach(c => c.classList.remove('active'));
      this.dom.invoiceRadioPersonal.closest('.radio-choice-card')?.classList.add('active');
    });

    this.dom.invoiceRadioBusiness?.addEventListener('change', () => {
      this.bookingState.invoiceType = 'business';
      this.dom.gstDisclosurePanel?.classList.add('open');
      document.querySelectorAll('.radio-choice-card').forEach(c => c.classList.remove('active'));
      this.dom.invoiceRadioBusiness.closest('.radio-choice-card')?.classList.add('active');
    });

    // Cancellation Policy Modal Trigger
    document.getElementById('viewPolicyModalLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openCancellationModal();
    });

    // Review Booking Submit CTAs
    this.dom.reviewBookingCta?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    this.dom.mobileReviewCta?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Price Change Modal Actions
    document.getElementById('acceptPriceChangeBtn')?.addEventListener('click', () => {
      this.acceptPriceChange();
    });

    document.getElementById('chooseOtherRoomBtn')?.addEventListener('click', () => {
      this.closeAllModals();
      window.location.href = `property.html?id=${this.bookingState.propertyId}#roomsSection`;
    });

    // Global Modal Close Buttons
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    this.dom.modalBackdrop?.addEventListener('click', () => {
      this.closeAllModals();
    });

    // Dev State Switcher Buttons
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
  // Initial Data & Profile Prefill
  // =========================================================================

  async loadInitialData() {
    try {
      // 1. Fetch Property Details
      this.propertyData = await apiService.fetchPropertyDetails(this.bookingState.propertyId);
      if (this.propertyData) {
        this.selectedRoom = this.propertyData.roomTypes?.find(r => r.roomId === this.bookingState.roomId) || this.propertyData.roomTypes?.[0];
      }

      // 2. Fetch Customer Profile for Prefill
      this.customerProfile = await apiService.fetchCustomerProfile();
      if (this.customerProfile) {
        this.prefillProfileData(this.customerProfile);
      }

      // 3. Render Additional Guests (if adults > 1)
      this.renderAdditionalGuests();

      // 4. Update Summary Card
      this.renderSummaryCard();
    } catch (e) {
      console.warn('Booking load error', e);
      this.showToast('Could not load property details.');
    }
  }

  prefillProfileData(profile) {
    if (this.dom.firstName) this.dom.firstName.value = profile.firstName || '';
    if (this.dom.lastName) this.dom.lastName.value = profile.lastName || '';
    if (this.dom.email) this.dom.email.value = profile.email || '';
    if (this.dom.phone) this.dom.phone.value = profile.phone || '';

    if (this.dom.companyName && profile.savedCompany) this.dom.companyName.value = profile.savedCompany.name;
    if (this.dom.companyGstin && profile.savedCompany) this.dom.companyGstin.value = profile.savedCompany.gstin;
    if (this.dom.billingAddress && profile.savedCompany) this.dom.billingAddress.value = profile.savedCompany.address;

    if (this.dom.prefillBanner && this.dom.prefillNameSpan) {
      this.dom.prefillNameSpan.textContent = `${profile.firstName} ${profile.lastName} (${profile.email})`;
      this.dom.prefillBanner.style.display = 'flex';
    }
  }

  enableFieldEditing() {
    this.dom.firstName?.focus();
    this.showToast('You can now edit your guest details.');
  }

  renderAdditionalGuests() {
    if (!this.dom.additionalGuestsSection || !this.dom.additionalGuestsContainer) return;

    const extraAdults = Math.max(0, this.bookingState.adults - 1);
    if (extraAdults === 0) {
      this.dom.additionalGuestsSection.style.display = 'none';
      return;
    }

    this.dom.additionalGuestsSection.style.display = 'block';
    let html = '';

    for (let i = 1; i <= extraAdults; i++) {
      html += `
        <div style="background:var(--color-bg-subtle); padding:14px; border-radius:var(--radius-md); margin-bottom:12px; border:1px solid var(--color-border-subtle);">
          <h4 style="font-size:0.92rem; font-weight:700; color:var(--color-text-primary); margin-bottom:8px;">Guest ${i + 1}</h4>
          <div class="input-grid-2" style="margin-bottom:0;">
            <div class="input-field-group">
              <label class="field-label-persistent">First name</label>
              <input type="text" class="input-styled extra-guest-fn" placeholder="First name" />
            </div>
            <div class="input-field-group">
              <label class="field-label-persistent">Last name</label>
              <input type="text" class="input-styled extra-guest-ln" placeholder="Last name" />
            </div>
          </div>
        </div>
      `;
    }

    this.dom.additionalGuestsContainer.innerHTML = html;
  }

  appendSpecialRequest(text) {
    if (!this.dom.specialRequestsText) return;
    const current = this.dom.specialRequestsText.value.trim();
    if (current.includes(text)) return;
    this.dom.specialRequestsText.value = current ? `${current}\n• ${text}` : `• ${text}`;
    this.showToast(`Added request: "${text}"`);
  }

  // =========================================================================
  // Summary & Price Calculation
  // =========================================================================

  renderSummaryCard() {
    const p = this.propertyData;
    const r = this.selectedRoom;
    if (!p || !r) return;

    const nights = this.bookingState.nights || 2;
    const rooms = this.bookingState.rooms || 1;

    const basePrice = r.pricePerNight * nights * rooms;
    const taxes = r.taxesPerNight * nights * rooms;
    const discount = Math.round(basePrice * 0.10); // 10% seasonal discount
    const total = basePrice - discount + taxes;
    this.bookingState.totalAmount = total;

    if (this.dom.summaryPropImg) this.dom.summaryPropImg.src = p.image;
    if (this.dom.summaryPropTitle) this.dom.summaryPropTitle.textContent = p.title;
    if (this.dom.summaryPropLocation) this.dom.summaryPropLocation.textContent = `📍 ${p.microLocation || p.destinationName}`;
    if (this.dom.summaryPropRating) this.dom.summaryPropRating.textContent = `★ ${p.rating}`;

    if (this.dom.summaryDates) this.dom.summaryDates.textContent = `${this.formatDateShort(this.bookingState.checkIn)} – ${this.formatDateShort(this.bookingState.checkOut)}`;
    if (this.dom.summaryNights) this.dom.summaryNights.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
    if (this.dom.summaryGuests) this.dom.summaryGuests.textContent = `${this.bookingState.adults + this.bookingState.children} Guests · ${rooms} Room`;
    if (this.dom.summaryRoomName) this.dom.summaryRoomName.textContent = r.name;

    if (this.dom.summaryBasePrice) this.dom.summaryBasePrice.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
    if (this.dom.summaryDiscount) this.dom.summaryDiscount.textContent = `- ₹${discount.toLocaleString('en-IN')}`;
    if (this.dom.summaryTaxes) this.dom.summaryTaxes.textContent = `+ ₹${taxes.toLocaleString('en-IN')}`;
    if (this.dom.summaryTotal) this.dom.summaryTotal.textContent = `₹${total.toLocaleString('en-IN')}`;

    if (this.dom.mobileStickyTotal) {
      this.dom.mobileStickyTotal.textContent = `₹${total.toLocaleString('en-IN')} total`;
    }
  }

  startHoldCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.countdownSeconds = 0;
        this.showToast('Room hold expired. Price refreshed.');
      }

      const mins = String(Math.floor(this.countdownSeconds / 60)).padStart(2, '0');
      const secs = String(this.countdownSeconds % 60).padStart(2, '0');
      if (this.dom.sessionTimer) {
        this.dom.sessionTimer.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  // =========================================================================
  // Validation & Form Submission
  // =========================================================================

  async handleFormSubmit() {
    this.hideAlert();

    // 1. Gather other guests
    const otherGuests = [];
    document.querySelectorAll('.extra-guest-fn').forEach((input, idx) => {
      const fn = input.value.trim();
      const ln = document.querySelectorAll('.extra-guest-ln')[idx]?.value.trim();
      if (fn || ln) otherGuests.push({ firstName: fn, lastName: ln });
    });

    // 2. Gather payload
    const payload = {
      propertyId: this.bookingState.propertyId,
      roomId: this.bookingState.roomId,
      checkIn: this.bookingState.checkIn,
      checkOut: this.bookingState.checkOut,
      adults: this.bookingState.adults,
      children: this.bookingState.children,
      rooms: this.bookingState.rooms,
      firstName: this.dom.firstName?.value,
      lastName: this.dom.lastName?.value,
      email: this.dom.email?.value,
      phone: this.dom.phone?.value,
      otherGuests,
      specialRequests: this.dom.specialRequestsText?.value,
      arrivalTime: this.dom.arrivalTimeSelect?.value,
      termsAccepted: this.dom.termsCheckbox?.checked,
      invoiceType: this.bookingState.invoiceType,
      gstInvoice: this.bookingState.invoiceType === 'business' ? {
        companyName: this.dom.companyName?.value,
        gstin: this.dom.companyGstin?.value,
        billingAddress: this.dom.billingAddress?.value
      } : null,
      basePrice: this.selectedRoom?.pricePerNight * (this.bookingState.nights || 2),
      discount: Math.round(this.selectedRoom?.pricePerNight * (this.bookingState.nights || 2) * 0.10),
      taxes: this.selectedRoom?.taxesPerNight * (this.bookingState.nights || 2),
      totalAmount: this.bookingState.totalAmount
    };

    // 3. Client Validation
    if (!payload.firstName || payload.firstName.trim().length < 2) {
      this.showAlert('Please enter your first name.');
      this.dom.firstName?.focus();
      return;
    }
    if (!payload.lastName || payload.lastName.trim().length < 1) {
      this.showAlert('Please enter your last name.');
      this.dom.lastName?.focus();
      return;
    }
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      this.showAlert('Please enter a valid email address.');
      this.dom.email?.focus();
      return;
    }
    if (!payload.phone || payload.phone.replace(/\D/g, '').length < 10) {
      this.showAlert('Please enter a valid 10-digit mobile number.');
      this.dom.phone?.focus();
      return;
    }
    if (!payload.termsAccepted) {
      this.showAlert('Please accept the booking terms and cancellation policy to continue.');
      return;
    }

    this.showToast('Validating booking details with property host...');

    // 4. Backend Validation
    try {
      const response = await apiService.validateBookingForm(payload);

      if (!response.valid) {
        if (response.priceChanged) {
          this.openPriceChangeModal(response.previousTotal, response.updatedTotal);
        } else {
          this.showAlert(response.message || 'Validation error.');
        }
        return;
      }

      // Save Booking Session for Screen 07
      try {
        localStorage.setItem('konkan_trip_active_booking_draft_v1', JSON.stringify(response));
      } catch (e) {}

      this.showToast('Details verified! Advancing to Review Booking...');

      // Proceed to Review Booking
      setTimeout(() => {
        window.location.href = `review.html?bookingId=${encodeURIComponent(response.bookingId)}&propertyId=${encodeURIComponent(payload.propertyId)}&roomId=${encodeURIComponent(payload.roomId)}`;
      }, 480);

    } catch (err) {
      this.showAlert(err.message || 'Booking validation error.');
    }
  }

  showAlert(msg) {
    if (this.dom.alertBanner && this.dom.alertText) {
      this.dom.alertText.textContent = msg;
      this.dom.alertBanner.classList.add('visible');
      this.dom.alertBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    this.showToast(msg);
  }

  hideAlert() {
    if (this.dom.alertBanner) {
      this.dom.alertBanner.classList.remove('visible');
    }
  }

  // =========================================================================
  // Price Change Modal & Cancellation Modal
  // =========================================================================

  openPriceChangeModal(prev, updated) {
    if (this.dom.pricePrevVal) this.dom.pricePrevVal.textContent = `₹${prev.toLocaleString('en-IN')}`;
    if (this.dom.priceUpdatedVal) this.dom.priceUpdatedVal.textContent = `₹${updated.toLocaleString('en-IN')}`;
    this.pendingUpdatedPrice = updated;
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.priceChangeModal?.classList.add('open');
  }

  acceptPriceChange() {
    if (this.pendingUpdatedPrice) {
      this.bookingState.totalAmount = this.pendingUpdatedPrice;
      if (this.dom.summaryTotal) this.dom.summaryTotal.textContent = `₹${this.pendingUpdatedPrice.toLocaleString('en-IN')}`;
      if (this.dom.mobileStickyTotal) this.dom.mobileStickyTotal.textContent = `₹${this.pendingUpdatedPrice.toLocaleString('en-IN')} total`;
    }
    this.closeAllModals();
    this.showToast('Price updated. You can now proceed.');
  }

  openCancellationModal() {
    const p = this.propertyData;
    if (this.dom.cancellationModalBody) {
      this.dom.cancellationModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px; line-height:1.6; color:var(--color-text-primary);">
          <div style="background:#F4FAFA; padding:14px; border-radius:10px; border-left:4px solid var(--color-primary);">
            <h4 style="font-weight:700; margin-bottom:4px;">100% Full Refund Window</h4>
            <p style="font-size:0.9rem; color:var(--color-text-secondary);">${p?.cancellationDetailed || 'Cancel up to 48 hours before check-in for a 100% complete refund with zero cancellation fees.'}</p>
          </div>
          <div style="background:#FFF9F2; padding:14px; border-radius:10px; border-left:4px solid var(--color-konkan-sun);">
            <h4 style="font-weight:700; margin-bottom:4px;">Monsoon Rescheduling Protection</h4>
            <p style="font-size:0.9rem; color:var(--color-text-secondary);">In case of heavy rainfall sea advisories or road weather warnings, guests are permitted 1 free date change with zero penalty.</p>
          </div>
        </div>
      `;
    }
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.cancellationModal?.classList.add('open');
  }

  closeAllModals() {
    this.dom.modalBackdrop?.classList.remove('open');
    this.dom.priceChangeModal?.classList.remove('open');
    this.dom.cancellationModal?.classList.remove('open');
  }

  // =========================================================================
  // Dev State Switcher Modes
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);
    this.hideAlert();

    if (mode === 'PREFILLED_USER') {
      this.prefillProfileData(CUSTOMER_PROFILE_MOCK);
      this.showToast('Switched to Prefilled Logged-in Profile State');
    } else if (mode === 'PRICE_CHANGED_ALERT') {
      this.openPriceChangeModal(14515, 14815);
      this.showToast('Switched to Price Changed Alert State');
    } else if (mode === 'ERROR') {
      this.showAlert('Simulated 503 Payment & Booking Gateway Error');
      this.showToast('Switched to API Error State');
    } else {
      this.dom.firstName.value = '';
      this.dom.lastName.value = '';
      this.dom.email.value = '';
      this.dom.phone.value = '';
      if (this.dom.prefillBanner) this.dom.prefillBanner.style.display = 'none';
      this.showToast('Switched to Blank Success State');
    }
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  formatDateShort(isoStr) {
    if (!isoStr) return '--';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
  window.konkanBooking = new KonkanBookingController();
  window.konkanBooking.init();
});
