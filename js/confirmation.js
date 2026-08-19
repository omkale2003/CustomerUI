/**
 * KonkanTrip — Screen 09: Customer Booking Confirmation Controller
 * Authoritatively retrieves confirmed booking metadata, renders stay specifications,
 * room details, payment receipt, vertical status timeline, next steps, and recommendations.
 * Prevents duplicate bookings, handles already-confirmed/refresh states, and supports voucher printing.
 */

class KonkanConfirmationController {
  constructor() {
    this.bookingReference = 'KT-BK-890214';
    this.orderId = null;
    this.bookingData = null;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    await this.loadConfirmedBooking();
    await this.loadRecommendations();
  }

  cacheDom() {
    // Success Hero
    this.dom.heroStayTitle = document.getElementById('heroStayTitle');
    this.dom.bookingRefCode = document.getElementById('bookingRefCode');
    this.dom.copyRefBtn = document.getElementById('copyRefBtn');
    this.dom.alreadyConfirmedBadge = document.getElementById('alreadyConfirmedBadge');

    // Property Card
    this.dom.propImg = document.getElementById('confirmedPropImg');
    this.dom.propTitle = document.getElementById('confirmedPropTitle');
    this.dom.propLocation = document.getElementById('confirmedPropLocation');
    this.dom.propRating = document.getElementById('confirmedPropRating');
    this.dom.propBadge = document.getElementById('confirmedPropBadge');

    // Stay Details
    this.dom.checkInDate = document.getElementById('confirmedCheckInDate');
    this.dom.checkInTime = document.getElementById('confirmedCheckInTime');
    this.dom.checkOutDate = document.getElementById('confirmedCheckOutDate');
    this.dom.checkOutTime = document.getElementById('confirmedCheckOutTime');
    this.dom.stayGuests = document.getElementById('confirmedStayGuests');
    this.dom.stayNights = document.getElementById('confirmedStayNights');

    // Room Info
    this.dom.roomImg = document.getElementById('confirmedRoomImg');
    this.dom.roomTitle = document.getElementById('confirmedRoomTitle');
    this.dom.roomSpecs = document.getElementById('confirmedRoomSpecs');
    this.dom.roomMealPlan = document.getElementById('confirmedRoomMealPlan');
    this.dom.roomAmenities = document.getElementById('confirmedRoomAmenities');

    // Payment Summary
    this.dom.payRoomPrice = document.getElementById('payRoomPrice');
    this.dom.payDiscount = document.getElementById('payDiscount');
    this.dom.payTaxes = document.getElementById('payTaxes');
    this.dom.payTotal = document.getElementById('payTotal');
    this.dom.payMethod = document.getElementById('payMethod');
    this.dom.payStatus = document.getElementById('payStatus');
    this.dom.payTxnId = document.getElementById('payTxnId');

    // Important Info
    this.dom.infoCancellation = document.getElementById('infoCancellation');
    this.dom.infoCheckIn = document.getElementById('infoCheckIn');
    this.dom.infoCheckOut = document.getElementById('infoCheckOut');
    this.dom.infoHostPhone = document.getElementById('infoHostPhone');

    // Action CTAs
    this.dom.viewBookingBtn = document.getElementById('viewBookingBtn');
    this.dom.downloadVoucherBtn = document.getElementById('downloadVoucherBtn');
    this.dom.homeBtn = document.getElementById('homeBtn');
    this.dom.recSection = document.getElementById('recommendationsSection');
    this.dom.recGrid = document.getElementById('recommendationsGrid');

    // Modals
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.myBookingModal = document.getElementById('myBookingModal');
    this.dom.statusPendingModal = document.getElementById('statusPendingModal');
    this.dom.errorStateBanner = document.getElementById('confirmationErrorBanner');
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('bookingRef') || params.get('ref');
    const ord = params.get('orderId');

    if (ref) this.bookingReference = ref;
    if (ord) this.orderId = ord;
  }

  bindEvents() {
    // Copy Booking Reference
    this.dom.copyRefBtn?.addEventListener('click', () => {
      if (this.bookingData?.bookingReference) {
        navigator.clipboard.writeText(this.bookingData.bookingReference);
        this.showToast(`Copied booking reference: ${this.bookingData.bookingReference}`);
      }
    });

    // View My Booking CTA (Navigates to Screen 10 — Booking Details)
    this.dom.viewBookingBtn?.addEventListener('click', () => {
      const ref = this.bookingData?.bookingReference || this.bookingReference || 'KT-BK-890214';
      this.showToast('Opening booking details & management...');
      setTimeout(() => {
        window.location.href = `booking-details.html?ref=${encodeURIComponent(ref)}`;
      }, 300);
    });

    // Download Confirmation Voucher (Print View)
    this.dom.downloadVoucherBtn?.addEventListener('click', () => {
      this.showToast('Preparing printable confirmation voucher...');
      setTimeout(() => {
        window.print();
      }, 300);
    });

    // Go to Homepage
    this.dom.homeBtn?.addEventListener('click', () => {
      window.location.href = 'index.html';
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
  // Load Authoritative Confirmed Booking Data
  // =========================================================================

  async loadConfirmedBooking() {
    try {
      const data = await apiService.fetchConfirmedBooking(this.bookingReference);

      if (data.status === 'CONFIRMING' || data.status === 'PROCESSING') {
        this.openStatusPendingModal(data.message);
        return;
      }

      this.bookingData = data;
      this.renderBookingDetails();

      // Show "Already Confirmed" indicator if customer refreshed
      if (data.isAlreadyConfirmed && this.dom.alreadyConfirmedBadge) {
        this.dom.alreadyConfirmedBadge.style.display = 'inline-flex';
      }
    } catch (err) {
      console.error('Confirmation load error', err);
      if (this.dom.errorStateBanner) {
        this.dom.errorStateBanner.style.display = 'block';
      }
      this.showToast('We had trouble loading your reservation. Please contact support.');
    }
  }

  renderBookingDetails() {
    const b = this.bookingData;
    if (!b) return;

    // 1. Success Hero Section
    if (this.dom.heroStayTitle) this.dom.heroStayTitle.textContent = b.property.title;
    if (this.dom.bookingRefCode) this.dom.bookingRefCode.textContent = b.bookingReference;

    // 2. Property Card
    if (this.dom.propImg) this.dom.propImg.src = b.property.image;
    if (this.dom.propTitle) this.dom.propTitle.textContent = b.property.title;
    if (this.dom.propLocation) this.dom.propLocation.textContent = `📍 ${b.property.microLocation || b.property.destinationName}`;
    if (this.dom.propRating) this.dom.propRating.textContent = `★ ${b.property.rating} (${b.property.reviewsCount} reviews)`;
    if (this.dom.propBadge) this.dom.propBadge.textContent = b.property.badge;

    // 3. Stay Details (3 Columns)
    if (this.dom.checkInDate) this.dom.checkInDate.textContent = this.formatDateLong(b.stayDates.checkIn);
    if (this.dom.checkInTime) this.dom.checkInTime.textContent = `From ${b.stayDates.checkInTime}`;
    if (this.dom.checkOutDate) this.dom.checkOutDate.textContent = this.formatDateLong(b.stayDates.checkOut);
    if (this.dom.checkOutTime) this.dom.checkOutTime.textContent = `Until ${b.stayDates.checkOutTime}`;
    if (this.dom.stayGuests) this.dom.stayGuests.textContent = b.stayDates.guests;
    if (this.dom.stayNights) this.dom.stayNights.textContent = `${b.stayDates.nights} Nights Stay`;

    // 4. Room Info
    if (this.dom.roomImg) this.dom.roomImg.src = b.room.image;
    if (this.dom.roomTitle) this.dom.roomTitle.textContent = b.room.name;
    if (this.dom.roomSpecs) this.dom.roomSpecs.textContent = `🛏 ${b.room.bedType} · 👤 Capacity: ${b.room.capacity} Guests`;
    if (this.dom.roomMealPlan) this.dom.roomMealPlan.textContent = `✓ ${b.room.mealPlan}`;
    if (this.dom.roomAmenities) {
      this.dom.roomAmenities.innerHTML = b.room.amenities.map(a => `
        <span class="badge badge-sand" style="font-size:0.75rem;">${a}</span>
      `).join('');
    }

    // 5. Payment Summary
    const pay = b.paymentSummary;
    if (this.dom.payRoomPrice) this.dom.payRoomPrice.textContent = `₹${pay.roomPrice.toLocaleString('en-IN')}`;
    if (this.dom.payDiscount) this.dom.payDiscount.textContent = `- ₹${pay.discount.toLocaleString('en-IN')}`;
    if (this.dom.payTaxes) this.dom.payTaxes.textContent = `+ ₹${pay.taxes.toLocaleString('en-IN')}`;
    if (this.dom.payTotal) this.dom.payTotal.textContent = `₹${pay.totalPaid.toLocaleString('en-IN')}`;
    if (this.dom.payMethod) this.dom.payMethod.textContent = pay.paymentMethod;
    if (this.dom.payStatus) this.dom.payStatus.textContent = `✓ ${pay.paymentStatus}`;
    if (this.dom.payTxnId) this.dom.payTxnId.textContent = b.transactionId;

    // 6. Important Booking Information
    if (this.dom.infoCancellation) this.dom.infoCancellation.textContent = b.cancellationPolicy.summary;
    if (this.dom.infoCheckIn) this.dom.infoCheckIn.textContent = `${b.stayDates.checkInTime} onwards`;
    if (this.dom.infoCheckOut) this.dom.infoCheckOut.textContent = `By ${b.stayDates.checkOutTime}`;
    if (this.dom.infoHostPhone) this.dom.infoHostPhone.textContent = b.property.host?.phone || '+91 98201 45890';
  }

  async loadRecommendations() {
    try {
      const recs = await apiService.fetchRecommendedStays(this.bookingData?.property?.id || 'stay-03');
      if (this.dom.recGrid && recs && recs.length > 0) {
        this.dom.recGrid.innerHTML = recs.map(stay => `
          <div class="rec-stay-card">
            <img class="rec-stay-img" src="${stay.image}" alt="${stay.title}" />
            <div class="rec-stay-body">
              <span class="badge badge-sand" style="font-size:0.72rem; margin-bottom:4px;">${stay.badge}</span>
              <h4 style="font-size:1rem; font-weight:700; color:var(--color-text-primary); margin-bottom:2px;">${stay.title}</h4>
              <div style="font-size:0.8rem; color:var(--color-text-secondary); margin-bottom:6px;">📍 ${stay.destinationName}</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--color-primary);">₹${stay.pricePerNight.toLocaleString('en-IN')} <small style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:500;">/ night</small></div>
            </div>
          </div>
        `).join('');
        if (this.dom.recSection) this.dom.recSection.style.display = 'block';
      }
    } catch (e) {
      if (this.dom.recSection) this.dom.recSection.style.display = 'none';
    }
  }

  // =========================================================================
  // Modals & Drawers
  // =========================================================================

  openMyBookingModal() {
    const b = this.bookingData;
    if (!b) return;

    const modalBody = document.getElementById('myBookingModalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align:center; padding:10px 0 20px; border-bottom:1px solid var(--color-border-subtle);">
          <span class="badge badge-green" style="font-size:0.82rem; margin-bottom:8px;">Confirmed Reservation</span>
          <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800;">${b.property.title}</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary);">${b.property.address}</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0; background:#F8FCFC; padding:14px; border-radius:10px;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Booking Ref</span>
            <div style="font-size:1.05rem; font-weight:800; color:var(--color-primary);">${b.bookingReference}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Primary Guest</span>
            <div style="font-size:0.95rem; font-weight:700;">${b.guestDetails.name}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Check-In</span>
            <div style="font-size:0.95rem; font-weight:700;">${this.formatDateLong(b.stayDates.checkIn)}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Check-Out</span>
            <div style="font-size:0.95rem; font-weight:700;">${this.formatDateLong(b.stayDates.checkOut)}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:#FAFDFD; padding:12px 14px; border-radius:8px; border:1px solid var(--color-border-subtle); margin-bottom:16px;">
          <div>
            <div style="font-weight:700; font-size:0.92rem;">Total Amount Paid</div>
            <div style="font-size:0.78rem; color:var(--color-text-secondary);">${b.paymentSummary.paymentMethod}</div>
          </div>
          <div style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; color:var(--color-primary);">
            ₹${b.paymentSummary.totalPaid.toLocaleString('en-IN')}
          </div>
        </div>

        <div style="text-align:center; font-size:0.8rem; color:var(--color-text-secondary); margin-bottom:12px;">
          Show this QR code at property check-in desk:
        </div>

        <div style="display:flex; justify-content:center; margin-bottom:16px;">
          <div style="width:130px; height:130px; background:#fff; border:2px dashed var(--color-primary); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-direction:column;">
            <svg class="icon-inline" style="width:54px; height:54px; color:var(--color-primary);" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
            <span style="font-size:0.65rem; font-weight:700; margin-top:4px;">${b.bookingReference}</span>
          </div>
        </div>
      `;
    }

    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.myBookingModal?.classList.add('open');
  }

  openStatusPendingModal(message) {
    this.closeAllModals();
    const msgP = document.getElementById('statusPendingMessage');
    if (msgP) msgP.textContent = message || 'We are securely confirming your reservation with the host.';
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.statusPendingModal?.classList.add('open');
  }

  closeAllModals() {
    this.dom.modalBackdrop?.classList.remove('open');
    this.dom.myBookingModal?.classList.remove('open');
    this.dom.statusPendingModal?.classList.remove('open');
  }

  // =========================================================================
  // Dev State Switcher Modes
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);

    if (mode === 'CONFIRMING') {
      this.openStatusPendingModal('Confirming your booking... We are securely finalizing your room reservation.');
      this.showToast('Switched to Confirming State');
    } else if (mode === 'PAYMENT_RECEIVED_PENDING') {
      this.openStatusPendingModal('Payment received. We are finalizing reservation with the host. Please do not pay again.');
      this.showToast('Switched to Payment Received / Pending Confirmation State');
    } else if (mode === 'ALREADY_CONFIRMED') {
      this.loadConfirmedBooking();
      if (this.dom.alreadyConfirmedBadge) this.dom.alreadyConfirmedBadge.style.display = 'inline-flex';
      this.showToast('Switched to Already Confirmed State');
    } else if (mode === 'ERROR') {
      if (this.dom.errorStateBanner) this.dom.errorStateBanner.style.display = 'block';
      this.showToast('Switched to Confirmation Error State');
    } else {
      this.closeAllModals();
      if (this.dom.errorStateBanner) this.dom.errorStateBanner.style.display = 'none';
      this.loadConfirmedBooking();
      this.showToast('Switched to Confirmed State');
    }
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  formatDateLong(isoStr) {
    if (!isoStr) return '--';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  showToast(message) {
    if (!this.dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-bubble';
    toast.innerHTML = `
      <svg class="icon-inline icon-sm" style="color:var(--color-tropical-green);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
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
  window.konkanConfirmation = new KonkanConfirmationController();
  window.konkanConfirmation.init();
});
