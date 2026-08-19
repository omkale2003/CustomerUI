/**
 * KonkanTrip — Screen 07: Customer Review Booking & Final Confirmation Controller
 * Handles verified reservation rendering, stay dates, room specs, guest contact,
 * conditional special requests, cancellation terms, transparent price calculation explanation,
 * session countdown hold timer, session status modals (Price Changed, Room Unavailable, Expired),
 * and transition to Screen 08 (Payment).
 */

class KonkanReviewController {
  constructor() {
    this.sessionId = 'KT-BK-980123';
    this.propertyId = 'stay-03';
    this.roomId = 'room-03-a';
    this.sessionData = null;
    this.countdownSeconds = 14 * 60 + 15; // 14:15 remaining
    this.timerInterval = null;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    this.startHoldCountdown();
    await this.loadBookingSession();
  }

  cacheDom() {
    // Property Card
    this.dom.propImg = document.getElementById('reviewPropImg');
    this.dom.propTitle = document.getElementById('reviewPropTitle');
    this.dom.propMeta = document.getElementById('reviewPropMeta');
    this.dom.propBadge = document.getElementById('reviewPropBadge');
    this.dom.viewPropertyBtn = document.getElementById('viewPropertyLink');

    // Stay Dates Card
    this.dom.checkInDate = document.getElementById('reviewCheckInDate');
    this.dom.checkInTime = document.getElementById('reviewCheckInTime');
    this.dom.checkOutDate = document.getElementById('reviewCheckOutDate');
    this.dom.checkOutTime = document.getElementById('reviewCheckOutTime');
    this.dom.stayNightsGuests = document.getElementById('reviewStayNightsGuests');

    // Room Card
    this.dom.roomImg = document.getElementById('reviewRoomImg');
    this.dom.roomTitle = document.getElementById('reviewRoomTitle');
    this.dom.roomSpecs = document.getElementById('reviewRoomSpecs');
    this.dom.roomMealPlan = document.getElementById('reviewRoomMealPlan');
    this.dom.roomAmenities = document.getElementById('reviewRoomAmenities');

    // Guest Card
    this.dom.guestName = document.getElementById('reviewGuestName');
    this.dom.guestEmail = document.getElementById('reviewGuestEmail');
    this.dom.guestPhone = document.getElementById('reviewGuestPhone');
    this.dom.extraGuestsRow = document.getElementById('reviewExtraGuestsRow');
    this.dom.editDetailsBtn = document.getElementById('editGuestDetailsBtn');

    // Special Requests & Cancellation
    this.dom.specialRequestsCard = document.getElementById('reviewSpecialRequestsCard');
    this.dom.specialRequestsContent = document.getElementById('reviewSpecialRequestsContent');
    this.dom.cancellationPill = document.getElementById('reviewCancellationPill');
    this.dom.cancellationSummary = document.getElementById('reviewCancellationSummary');

    // Sticky Price Sidebar
    this.dom.priceBase = document.getElementById('reviewPriceBase');
    this.dom.priceDiscount = document.getElementById('reviewPriceDiscount');
    this.dom.priceTaxes = document.getElementById('reviewPriceTaxes');
    this.dom.priceTotal = document.getElementById('reviewPriceTotal');
    this.dom.priceMathToggle = document.getElementById('priceMathToggle');
    this.dom.priceMathPanel = document.getElementById('priceMathPanel');
    this.dom.priceMathFormula = document.getElementById('priceMathFormula');
    this.dom.sessionTimer = document.getElementById('reviewSessionTimer');
    this.dom.proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
    this.dom.mobileReviewTotal = document.getElementById('mobileReviewTotal');
    this.dom.mobileProceedBtn = document.getElementById('mobileProceedBtn');

    // Modals
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.priceChangeModal = document.getElementById('priceChangeModal');
    this.dom.pricePrevVal = document.getElementById('pricePrevVal');
    this.dom.priceUpdatedVal = document.getElementById('priceUpdatedVal');
    this.dom.roomUnavailableModal = document.getElementById('roomUnavailableModal');
    this.dom.sessionExpiredModal = document.getElementById('sessionExpiredModal');
    this.dom.cancellationModal = document.getElementById('cancellationModal');
    this.dom.cancellationModalBody = document.getElementById('cancellationModalBody');
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    const propId = params.get('propertyId');
    const roomId = params.get('roomId');

    if (bookingId) this.sessionId = bookingId;
    if (propId) this.propertyId = propId;
    if (roomId) this.roomId = roomId;
  }

  bindEvents() {
    // Edit Details CTA (Returns to Screen 06)
    this.dom.editDetailsBtn?.addEventListener('click', () => {
      this.returnToGuestDetails();
    });

    // View Property CTA (Opens property.html)
    this.dom.viewPropertyBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`property.html?id=${this.propertyId}`, '_blank');
    });

    // Expandable Price Math Calculation
    this.dom.priceMathToggle?.addEventListener('click', () => {
      const isOpen = this.dom.priceMathPanel?.classList.contains('open');
      if (isOpen) {
        this.dom.priceMathPanel?.classList.remove('open');
        this.dom.priceMathToggle.innerHTML = `How is this price calculated? ▾`;
      } else {
        this.dom.priceMathPanel?.classList.add('open');
        this.dom.priceMathToggle.innerHTML = `Hide price calculation ▴`;
      }
    });

    // Cancellation Policy Modal Trigger
    document.getElementById('viewFullCancellationBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openCancellationModal();
    });

    // Proceed to Payment CTAs
    this.dom.proceedPaymentBtn?.addEventListener('click', () => {
      this.proceedToPayment();
    });

    this.dom.mobileProceedBtn?.addEventListener('click', () => {
      this.proceedToPayment();
    });

    // Modal Actions
    document.getElementById('acceptPriceUpdateBtn')?.addEventListener('click', () => {
      this.acceptPriceUpdate();
    });

    document.getElementById('returnToRoomsBtn')?.addEventListener('click', () => {
      window.location.href = `property.html?id=${this.propertyId}#roomsSection`;
    });

    document.getElementById('searchAgainBtn')?.addEventListener('click', () => {
      window.location.href = `results.html?dest=Dapoli`;
    });

    document.getElementById('unavailableChooseRoomBtn')?.addEventListener('click', () => {
      window.location.href = `property.html?id=${this.propertyId}#roomsSection`;
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
  // Session Loading & Verified Data Rendering
  // =========================================================================

  async loadBookingSession() {
    try {
      const session = await apiService.fetchBookingSession(this.sessionId);

      if (session.status === 'EXPIRED') {
        this.openSessionExpiredModal();
        return;
      }

      if (session.status === 'ROOM_UNAVAILABLE') {
        this.openRoomUnavailableModal();
        return;
      }

      if (session.status === 'PRICE_CHANGED') {
        this.openPriceChangedModal(session.previousTotal, session.updatedTotal);
        return;
      }

      this.sessionData = session;
      this.renderVerifiedBooking();
    } catch (err) {
      console.error('Review load error', err);
      this.showToast('Could not load booking session.');
    }
  }

  renderVerifiedBooking() {
    const s = this.sessionData;
    if (!s) return;

    // 1. Property Card
    if (this.dom.propImg) this.dom.propImg.src = s.property.image;
    if (this.dom.propTitle) this.dom.propTitle.textContent = s.property.title;
    if (this.dom.propBadge) this.dom.propBadge.textContent = s.property.badge;
    if (this.dom.propMeta) {
      this.dom.propMeta.innerHTML = `
        <span>★ ${s.property.rating} (${s.property.reviewsCount} reviews)</span>
        <span>·</span>
        <span>📍 ${s.property.microLocation || s.property.destinationName}</span>
      `;
    }

    // 2. Stay Dates Card
    if (this.dom.checkInDate) this.dom.checkInDate.textContent = this.formatDateLong(s.dates.checkIn);
    if (this.dom.checkInTime) this.dom.checkInTime.textContent = `Check-in: ${s.dates.checkInTime}`;
    if (this.dom.checkOutDate) this.dom.checkOutDate.textContent = this.formatDateLong(s.dates.checkOut);
    if (this.dom.checkOutTime) this.dom.checkOutTime.textContent = `Check-out: ${s.dates.checkOutTime}`;
    if (this.dom.stayNightsGuests) {
      this.dom.stayNightsGuests.textContent = `${s.dates.nights} Nights · ${s.guests.adults + s.guests.children} Guests · ${s.guests.rooms} Room`;
    }

    // 3. Room Details Card
    if (this.dom.roomImg) this.dom.roomImg.src = s.room.image;
    if (this.dom.roomTitle) this.dom.roomTitle.textContent = s.room.name;
    if (this.dom.roomSpecs) {
      this.dom.roomSpecs.textContent = `🛏 ${s.room.bedType} · 👤 Capacity: ${s.room.capacity} Guests`;
    }
    if (this.dom.roomMealPlan) {
      this.dom.roomMealPlan.textContent = `✓ ${s.room.mealPlan}`;
    }
    if (this.dom.roomAmenities) {
      this.dom.roomAmenities.innerHTML = s.room.amenities.map(a => `
        <span class="badge badge-sand" style="font-size:0.75rem;">${a}</span>
      `).join('');
    }

    // 4. Guest Details Card
    if (this.dom.guestName) this.dom.guestName.textContent = `${s.mainGuest.firstName} ${s.mainGuest.lastName}`;
    if (this.dom.guestEmail) this.dom.guestEmail.textContent = s.mainGuest.email;
    if (this.dom.guestPhone) this.dom.guestPhone.textContent = `+91 ${s.mainGuest.phone}`;

    if (this.dom.extraGuestsRow) {
      if (s.otherGuests && s.otherGuests.length > 0) {
        this.dom.extraGuestsRow.innerHTML = `
          <div class="guest-info-label" style="margin-top:8px;">Additional Guests</div>
          <div style="font-size:0.9rem; font-weight:600; color:var(--color-text-primary);">
            ${s.otherGuests.map((g, idx) => `Guest ${idx + 2}: ${g.firstName} ${g.lastName}`).join(', ')}
          </div>
        `;
        this.dom.extraGuestsRow.style.display = 'block';
      } else {
        this.dom.extraGuestsRow.style.display = 'none';
      }
    }

    // 5. Special Requests (Conditional)
    if (this.dom.specialRequestsCard) {
      if (s.specialRequests && s.specialRequests.trim().length > 0) {
        this.dom.specialRequestsCard.style.display = 'block';
        if (this.dom.specialRequestsContent) {
          this.dom.specialRequestsContent.textContent = s.specialRequests;
        }
      } else {
        this.dom.specialRequestsCard.style.display = 'none';
      }
    }

    // 6. Cancellation Notice
    if (this.dom.cancellationPill) {
      this.dom.cancellationPill.textContent = `✓ Free cancellation until ${s.cancellationPolicy.freeUntil}`;
    }
    if (this.dom.cancellationSummary) {
      this.dom.cancellationSummary.textContent = s.cancellationPolicy.summary;
    }

    // 7. Sticky Price Summary Sidebar
    const p = s.pricing;
    if (this.dom.priceBase) this.dom.priceBase.textContent = `₹${p.basePrice.toLocaleString('en-IN')}`;
    if (this.dom.priceDiscount) this.dom.priceDiscount.textContent = `- ₹${p.discount.toLocaleString('en-IN')}`;
    if (this.dom.priceTaxes) this.dom.priceTaxes.textContent = `+ ₹${p.taxes.toLocaleString('en-IN')}`;
    if (this.dom.priceTotal) this.dom.priceTotal.textContent = `₹${p.totalAmount.toLocaleString('en-IN')}`;

    if (this.dom.mobileReviewTotal) {
      this.dom.mobileReviewTotal.textContent = `₹${p.totalAmount.toLocaleString('en-IN')} total`;
    }

    // Expandable Math Formula
    if (this.dom.priceMathFormula) {
      const perNight = (p.basePrice / s.dates.nights).toLocaleString('en-IN');
      this.dom.priceMathFormula.innerHTML = `
        <div>• <strong>Room Rate:</strong> ₹${perNight} × ${s.dates.nights} nights = ₹${p.basePrice.toLocaleString('en-IN')}</div>
        <div>• <strong>Seasonal Discount:</strong> 10% Monsoon savings = - ₹${p.discount.toLocaleString('en-IN')}</div>
        <div>• <strong>Government GST (12%):</strong> ₹${p.taxes.toLocaleString('en-IN')}</div>
        <div style="border-top:1px solid var(--color-border-subtle); margin-top:4px; padding-top:4px;">• <strong>Net Total:</strong> ₹${p.totalAmount.toLocaleString('en-IN')} INR</div>
      `;
    }
  }

  startHoldCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.countdownSeconds = 0;
        this.openSessionExpiredModal();
      }

      const mins = String(Math.floor(this.countdownSeconds / 60)).padStart(2, '0');
      const secs = String(this.countdownSeconds % 60).padStart(2, '0');
      if (this.dom.sessionTimer) {
        this.dom.sessionTimer.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  // =========================================================================
  // Navigation & Submission
  // =========================================================================

  returnToGuestDetails() {
    this.showToast('Returning to guest details editor...');
    const s = this.sessionData;
    const propId = s ? s.property.id : this.propertyId;
    const roomId = s ? s.room.roomId : this.roomId;
    const checkIn = s ? s.dates.checkIn : '2026-08-24';
    const checkOut = s ? s.dates.checkOut : '2026-08-26';
    const adults = s ? s.guests.adults : 2;
    const children = s ? s.guests.children : 0;
    const rooms = s ? s.guests.rooms : 1;

    setTimeout(() => {
      window.location.href = `booking.html?propertyId=${propId}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`;
    }, 300);
  }

  async proceedToPayment() {
    this.showToast('Securing inventory hold for payment gateway...');

    try {
      const lockResult = await apiService.lockBookingForPayment(this.sessionId);

      if (!lockResult.success) {
        this.showToast('Failed to initialize payment gateway.');
        return;
      }

      this.showToast('Verified! Proceeding to Screen 08 — Payment...');

      setTimeout(() => {
        window.location.href = `payment.html?orderId=${encodeURIComponent(lockResult.orderId)}&sessionId=${encodeURIComponent(this.sessionId)}&amount=${lockResult.amount}`;
      }, 480);
    } catch (err) {
      this.showToast(err.message || 'Payment transition error.');
    }
  }

  // =========================================================================
  // Exception Modals (Price Changed, Room Unavailable, Expired)
  // =========================================================================

  openPriceChangedModal(prev, updated) {
    if (this.dom.pricePrevVal) this.dom.pricePrevVal.textContent = `₹${prev.toLocaleString('en-IN')}`;
    if (this.dom.priceUpdatedVal) this.dom.priceUpdatedVal.textContent = `₹${updated.toLocaleString('en-IN')}`;
    this.pendingUpdatedPrice = updated;
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.priceChangeModal?.classList.add('open');
  }

  acceptPriceUpdate() {
    if (this.pendingUpdatedPrice && this.sessionData) {
      this.sessionData.pricing.totalAmount = this.pendingUpdatedPrice;
      this.renderVerifiedBooking();
    }
    this.closeAllModals();
    this.showToast('Price updated. You can proceed to payment.');
  }

  openRoomUnavailableModal() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.roomUnavailableModal?.classList.add('open');
  }

  openSessionExpiredModal() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.sessionExpiredModal?.classList.add('open');
  }

  openCancellationModal() {
    const s = this.sessionData;
    if (this.dom.cancellationModalBody) {
      this.dom.cancellationModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px; line-height:1.6; color:var(--color-text-primary);">
          <div style="background:#F4FAFA; padding:14px; border-radius:10px; border-left:4px solid var(--color-primary);">
            <h4 style="font-weight:700; margin-bottom:4px;">100% Full Refund Window</h4>
            <p style="font-size:0.9rem; color:var(--color-text-secondary);">${s?.cancellationPolicy?.summary || 'Cancel up to 24 hours before check-in for a 100% complete refund with zero cancellation fees.'}</p>
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
    this.dom.roomUnavailableModal?.classList.remove('open');
    this.dom.sessionExpiredModal?.classList.remove('open');
    this.dom.cancellationModal?.classList.remove('open');
  }

  // =========================================================================
  // Dev State Switcher Modes
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);

    if (mode === 'PRICE_CHANGED') {
      this.openPriceChangedModal(14515, 14815);
      this.showToast('Switched to Price Changed Alert State');
    } else if (mode === 'ROOM_UNAVAILABLE') {
      this.openRoomUnavailableModal();
      this.showToast('Switched to Room Unavailable State');
    } else if (mode === 'EXPIRED') {
      this.openSessionExpiredModal();
      this.showToast('Switched to Expired Session State');
    } else if (mode === 'ERROR') {
      this.showToast('Simulated 500 Payment Validation Error');
    } else {
      this.loadBookingSession();
      this.showToast('Switched to Active Session State');
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
  window.konkanReview = new KonkanReviewController();
  window.konkanReview.init();
});
