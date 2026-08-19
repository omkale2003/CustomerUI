/**
 * KonkanTrip — Screen 10: Customer My Booking / Booking Details Controller
 * Handles authoritative reservation loading, stay specifications, room details,
 * live status timeline, cancellation modal workflow with refund calculation,
 * contact triggers, voucher printing, and 10 granular booking states.
 */

class KonkanBookingDetailsController {
  constructor() {
    this.bookingReference = 'KT-BK-890214';
    this.bookingData = null;
    this.isCancelling = false;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    await this.loadBookingDetails();
  }

  cacheDom() {
    // Header & Badges
    this.dom.headerRefCode = document.getElementById('detailsBookingRef');
    this.dom.headerStatusPill = document.getElementById('detailsStatusPill');
    this.dom.headerBookedOn = document.getElementById('detailsBookedOn');
    this.dom.copyRefBtn = document.getElementById('detailsCopyRefBtn');

    // Property Section
    this.dom.propImg = document.getElementById('detailsPropImg');
    this.dom.propTitle = document.getElementById('detailsPropTitle');
    this.dom.propLocation = document.getElementById('detailsPropLocation');
    this.dom.propRating = document.getElementById('detailsPropRating');
    this.dom.propBadge = document.getElementById('detailsPropBadge');
    this.dom.viewPropertyBtn = document.getElementById('detailsViewPropBtn');

    // Stay Details
    this.dom.checkInDate = document.getElementById('detailsCheckInDate');
    this.dom.checkInTime = document.getElementById('detailsCheckInTime');
    this.dom.checkOutDate = document.getElementById('detailsCheckOutDate');
    this.dom.checkOutTime = document.getElementById('detailsCheckOutTime');
    this.dom.stayGuests = document.getElementById('detailsStayGuests');
    this.dom.stayDuration = document.getElementById('detailsStayDuration');

    // Room Info
    this.dom.roomImg = document.getElementById('detailsRoomImg');
    this.dom.roomTitle = document.getElementById('detailsRoomTitle');
    this.dom.roomSpecs = document.getElementById('detailsRoomSpecs');
    this.dom.roomMealPlan = document.getElementById('detailsRoomMealPlan');
    this.dom.roomAmenities = document.getElementById('detailsRoomAmenities');

    // Guest Info
    this.dom.guestName = document.getElementById('detailsGuestName');
    this.dom.guestEmail = document.getElementById('detailsGuestEmail');
    this.dom.guestPhone = document.getElementById('detailsGuestPhone');
    this.dom.extraGuestsRow = document.getElementById('detailsExtraGuestsRow');

    // Special Requests & Cancellation
    this.dom.specialRequestsCard = document.getElementById('detailsSpecialRequestsCard');
    this.dom.specialRequestsContent = document.getElementById('detailsSpecialRequestsContent');
    this.dom.cancellationPolicyCard = document.getElementById('detailsCancellationCard');
    this.dom.cancellationPolicyText = document.getElementById('detailsCancellationText');
    this.dom.cancelBookingBtn = document.getElementById('detailsCancelBookingBtn');

    // Status Timeline
    this.dom.statusTimeline = document.getElementById('detailsStatusTimeline');

    // Property Contact & Support
    this.dom.contactHostName = document.getElementById('detailsHostName');
    this.dom.contactHostPhone = document.getElementById('detailsHostPhone');
    this.dom.contactHostEmail = document.getElementById('detailsHostEmail');
    this.dom.contactHostAddress = document.getElementById('detailsHostAddress');
    this.dom.contactHostBtn = document.getElementById('contactHostBtn');
    this.dom.supportBtn = document.getElementById('detailsSupportBtn');

    // Sticky Actions Sidebar
    this.dom.sidebarStatusPill = document.getElementById('sidebarStatusPill');
    this.dom.sidebarTotalAmount = document.getElementById('sidebarTotalAmount');
    this.dom.sidebarRoomPrice = document.getElementById('sidebarRoomPrice');
    this.dom.sidebarDiscount = document.getElementById('sidebarDiscount');
    this.dom.sidebarTaxes = document.getElementById('sidebarTaxes');
    this.dom.sidebarPayMethod = document.getElementById('sidebarPayMethod');
    this.dom.sidebarPaidDate = document.getElementById('sidebarPaidDate');
    this.dom.sidebarDownloadBtn = document.getElementById('sidebarDownloadBtn');
    this.dom.sidebarSupportBtn = document.getElementById('sidebarSupportBtn');
    this.dom.sidebarCancelBtn = document.getElementById('sidebarCancelBtn');
    this.dom.sidebarRefundStatusBtn = document.getElementById('sidebarRefundStatusBtn');

    // Mobile Actions
    this.dom.mobileContactBtn = document.getElementById('mobileContactBtn');
    this.dom.mobileManageBtn = document.getElementById('mobileManageBtn');

    // Modals & States
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.cancellationModal = document.getElementById('cancellationModal');
    this.dom.confirmCancelSubmitBtn = document.getElementById('confirmCancelSubmitBtn');
    this.dom.contactModal = document.getElementById('contactModal');
    this.dom.contactModalBody = document.getElementById('contactModalBody');
    this.dom.supportModal = document.getElementById('supportModal');
    this.dom.notFoundCard = document.getElementById('bookingNotFoundCard');
    this.dom.apiErrorCard = document.getElementById('bookingApiErrorCard');
    this.dom.mainGridContainer = document.getElementById('mainBookingGridContainer');
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('bookingRef') || params.get('bookingId');
    if (ref) this.bookingReference = ref;
  }

  bindEvents() {
    // Copy Booking Reference
    this.dom.copyRefBtn?.addEventListener('click', () => {
      if (this.bookingData?.bookingReference) {
        navigator.clipboard.writeText(this.bookingData.bookingReference);
        this.showToast(`Copied booking reference: ${this.bookingData.bookingReference}`);
      }
    });

    // View Property Link
    this.dom.viewPropertyBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const propId = this.bookingData?.property?.id || 'stay-03';
      window.location.href = `property.html?id=${propId}`;
    });

    // Cancel Booking Action (Triggers Confirmation Modal)
    this.dom.cancelBookingBtn?.addEventListener('click', () => {
      this.openCancellationModal();
    });

    this.dom.sidebarCancelBtn?.addEventListener('click', () => {
      this.openCancellationModal();
    });

    // Confirm Cancellation Submit (Authoritative Backend Flow)
    this.dom.confirmCancelSubmitBtn?.addEventListener('click', () => {
      this.executeCancellation();
    });

    // View Refund Status Action
    this.dom.sidebarRefundStatusBtn?.addEventListener('click', () => {
      this.openRefundStatusModal();
    });

    // Download Confirmation Voucher (Print View)
    this.dom.sidebarDownloadBtn?.addEventListener('click', () => {
      this.showToast('Generating official booking confirmation voucher...');
      setTimeout(() => {
        window.print();
      }, 300);
    });

    // Contact Property Triggers
    this.dom.contactHostBtn?.addEventListener('click', () => {
      this.openContactPropertyModal();
    });

    this.dom.mobileContactBtn?.addEventListener('click', () => {
      this.openContactPropertyModal();
    });

    // Support Triggers
    this.dom.supportBtn?.addEventListener('click', () => {
      this.openSupportModal();
    });

    this.dom.sidebarSupportBtn?.addEventListener('click', () => {
      this.openSupportModal();
    });

    // Mobile Manage Trigger
    this.dom.mobileManageBtn?.addEventListener('click', () => {
      if (this.bookingData?.status === 'CANCELLED') {
        this.openRefundStatusModal();
      } else {
        this.openCancellationModal();
      }
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
  // Load Authoritative Booking Details
  // =========================================================================

  async loadBookingDetails() {
    this.renderLoadingSkeletons();

    try {
      const data = await apiService.fetchBookingDetails(this.bookingReference);

      if (data.status === 'NOT_FOUND') {
        this.renderNotFoundState();
        return;
      }

      this.bookingData = data;
      this.renderVerifiedBookingUI();
    } catch (err) {
      console.error('Booking details load error', err);
      this.renderApiErrorState(err.message);
    }
  }

  renderVerifiedBookingUI() {
    const b = this.bookingData;
    if (!b) return;

    if (this.dom.mainGridContainer) this.dom.mainGridContainer.style.display = 'grid';
    if (this.dom.notFoundCard) this.dom.notFoundCard.style.display = 'none';
    if (this.dom.apiErrorCard) this.dom.apiErrorCard.style.display = 'none';

    // 1. Header & Badges
    if (this.dom.headerRefCode) this.dom.headerRefCode.textContent = b.bookingReference;
    if (this.dom.headerBookedOn) this.dom.headerBookedOn.textContent = `Booked on ${b.bookedOn || '19 Aug 2026'}`;
    this.updateStatusBadges(b.status);

    // 2. Property Card
    if (this.dom.propImg) this.dom.propImg.src = b.property.image;
    if (this.dom.propTitle) this.dom.propTitle.textContent = b.property.title;
    if (this.dom.propLocation) this.dom.propLocation.textContent = `📍 ${b.property.address || b.property.microLocation}`;
    if (this.dom.propRating) this.dom.propRating.textContent = `★ ${b.property.rating} (${b.property.reviewsCount} reviews)`;
    if (this.dom.propBadge) this.dom.propBadge.textContent = b.property.badge;

    // 3. Stay Details
    if (this.dom.checkInDate) this.dom.checkInDate.textContent = this.formatDateLong(b.stayDates.checkIn);
    if (this.dom.checkInTime) this.dom.checkInTime.textContent = `From ${b.stayDates.checkInTime}`;
    if (this.dom.checkOutDate) this.dom.checkOutDate.textContent = this.formatDateLong(b.stayDates.checkOut);
    if (this.dom.checkOutTime) this.dom.checkOutTime.textContent = `Until ${b.stayDates.checkOutTime}`;
    if (this.dom.stayGuests) this.dom.stayGuests.textContent = b.stayDates.guests;
    if (this.dom.stayDuration) this.dom.stayDuration.textContent = `${b.stayDates.nights} Nights Duration`;

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

    // 5. Guest Details
    if (this.dom.guestName) this.dom.guestName.textContent = b.guestDetails.name;
    if (this.dom.guestEmail) this.dom.guestEmail.textContent = b.guestDetails.email;
    if (this.dom.guestPhone) this.dom.guestPhone.textContent = `+91 ${b.guestDetails.phone}`;

    // 6. Special Requests (Conditional)
    if (this.dom.specialRequestsCard) {
      if (b.specialRequests && b.specialRequests.trim().length > 0) {
        this.dom.specialRequestsCard.style.display = 'block';
        if (this.dom.specialRequestsContent) {
          this.dom.specialRequestsContent.textContent = b.specialRequests;
        }
      } else {
        this.dom.specialRequestsCard.style.display = 'none';
      }
    }

    // 7. Cancellation Policy & Action
    if (this.dom.cancellationPolicyText) {
      this.dom.cancellationPolicyText.textContent = b.cancellationPolicy.summary;
    }
    if (this.dom.cancelBookingBtn) {
      this.dom.cancelBookingBtn.style.display = (b.status === 'CONFIRMED' || b.status === 'UPCOMING') ? 'inline-flex' : 'none';
    }
    if (this.dom.sidebarCancelBtn) {
      this.dom.sidebarCancelBtn.style.display = (b.status === 'CONFIRMED' || b.status === 'UPCOMING') ? 'inline-flex' : 'none';
    }
    if (this.dom.sidebarRefundStatusBtn) {
      this.dom.sidebarRefundStatusBtn.style.display = (b.status === 'CANCELLED' || b.status === 'REFUNDED') ? 'inline-flex' : 'none';
    }

    // 8. Booking Timeline
    this.renderTimeline(b.status);

    // 9. Property & Platform Contacts
    if (this.dom.contactHostName) this.dom.contactHostName.textContent = b.property.host?.name || 'Ketan & Dr. Meera Salvi';
    if (this.dom.contactHostPhone) this.dom.contactHostPhone.textContent = b.property.host?.phone || '+91 98201 45890';
    if (this.dom.contactHostEmail) this.dom.contactHostEmail.textContent = 'stay@ocean-song.konkantrip.com';
    if (this.dom.contactHostAddress) this.dom.contactHostAddress.textContent = b.property.address;

    // 10. Sticky Sidebar Summary
    const pay = b.paymentSummary;
    if (this.dom.sidebarTotalAmount) this.dom.sidebarTotalAmount.textContent = `₹${pay.totalPaid.toLocaleString('en-IN')}`;
    if (this.dom.sidebarRoomPrice) this.dom.sidebarRoomPrice.textContent = `₹${pay.roomPrice.toLocaleString('en-IN')}`;
    if (this.dom.sidebarDiscount) this.dom.sidebarDiscount.textContent = `- ₹${pay.discount.toLocaleString('en-IN')}`;
    if (this.dom.sidebarTaxes) this.dom.sidebarTaxes.textContent = `+ ₹${pay.taxes.toLocaleString('en-IN')}`;
    if (this.dom.sidebarPayMethod) this.dom.sidebarPayMethod.textContent = pay.paymentMethod;
    if (this.dom.sidebarPaidDate) this.dom.sidebarPaidDate.textContent = pay.paidAt || '19 Aug 2026, 3:30 PM';
  }

  updateStatusBadges(status) {
    let text = '✓ Confirmed';
    let className = 'confirmed';

    if (status === 'UPCOMING') {
      text = '● Stay Upcoming';
      className = 'upcoming';
    } else if (status === 'CANCELLED') {
      text = '✕ Booking Cancelled';
      className = 'cancelled';
    } else if (status === 'REFUND_PROCESSING' || status === 'REFUNDED') {
      text = status === 'REFUNDED' ? '✓ Refund Completed' : '↩ Refund Processing';
      className = 'refund-processing';
    } else if (status === 'COMPLETED') {
      text = '✓ Stay Completed';
      className = 'completed';
    } else if (status === 'PAYMENT_PENDING') {
      text = '● Payment Pending';
      className = 'payment-pending';
    }

    if (this.dom.headerStatusPill) {
      this.dom.headerStatusPill.className = `status-badge-pill ${className}`;
      this.dom.headerStatusPill.textContent = text;
    }
    if (this.dom.sidebarStatusPill) {
      this.dom.sidebarStatusPill.className = `status-badge-pill ${className}`;
      this.dom.sidebarStatusPill.textContent = text;
    }
  }

  renderTimeline(status) {
    if (!this.dom.statusTimeline) return;

    if (status === 'CANCELLED' || status === 'REFUNDED') {
      this.dom.statusTimeline.innerHTML = `
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Booking Created</div>
          <div class="timeline-sub">19 Aug 2026, 3:30 PM</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Payment Received & Verified</div>
          <div class="timeline-sub">₹14,515 confirmed via UPI</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon cancelled">✕</div>
          <div class="timeline-title" style="color:var(--color-error);">Booking Cancelled</div>
          <div class="timeline-sub">Inventory released per policy</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon refund">↩</div>
          <div class="timeline-title" style="color:#B57418;">
            ${status === 'REFUNDED' ? '100% Refund Credited' : 'Refund Processing (₹14,515)'}
          </div>
          <div class="timeline-sub">Estimated in 2–4 bank working days</div>
        </div>
      `;
    } else if (status === 'COMPLETED') {
      this.dom.statusTimeline.innerHTML = `
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Booking Created & Paid</div>
          <div class="timeline-sub">10 Jul 2026</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Stay Completed</div>
          <div class="timeline-sub">Checked out on 12 Jul 2026</div>
        </div>
      `;
    } else {
      this.dom.statusTimeline.innerHTML = `
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Booking Created</div>
          <div class="timeline-sub">Session registered and confirmed</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Payment Received & Verified</div>
          <div class="timeline-sub">₹14,515 securely processed</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon">✓</div>
          <div class="timeline-title">Room Inventory Reserved</div>
          <div class="timeline-sub">Host notified & room locked</div>
        </div>
        <div class="timeline-row-item">
          <div class="timeline-dot-icon upcoming">●</div>
          <div class="timeline-title" style="color:var(--color-primary);">Stay Upcoming</div>
          <div class="timeline-sub">Check-in on 24 Aug 2026, 1:00 PM</div>
        </div>
      `;
    }
  }

  // =========================================================================
  // Cancellation Workflow
  // =========================================================================

  openCancellationModal() {
    const b = this.bookingData;
    if (!b) return;

    const modalProp = document.getElementById('cancelModalPropTitle');
    const modalDates = document.getElementById('cancelModalDates');
    const modalAmount = document.getElementById('cancelModalAmountPaid');
    const modalRefund = document.getElementById('cancelModalRefundEst');

    if (modalProp) modalProp.textContent = b.property.title;
    if (modalDates) modalDates.textContent = `${this.formatDateLong(b.stayDates.checkIn)} – ${this.formatDateLong(b.stayDates.checkOut)}`;
    if (modalAmount) modalAmount.textContent = `₹${b.paymentSummary.totalPaid.toLocaleString('en-IN')}`;
    if (modalRefund) modalRefund.textContent = `₹${b.paymentSummary.totalPaid.toLocaleString('en-IN')}`;

    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.cancellationModal?.classList.add('open');
  }

  async executeCancellation() {
    if (this.isCancelling) return;
    this.isCancelling = true;

    if (this.dom.confirmCancelSubmitBtn) {
      this.dom.confirmCancelSubmitBtn.disabled = true;
      this.dom.confirmCancelSubmitBtn.textContent = 'Processing Cancellation...';
    }

    this.showToast('Submitting cancellation to booking server...');

    try {
      const result = await apiService.cancelBooking(this.bookingReference);
      this.closeAllModals();
      this.isCancelling = false;
      if (this.dom.confirmCancelSubmitBtn) {
        this.dom.confirmCancelSubmitBtn.disabled = false;
        this.dom.confirmCancelSubmitBtn.textContent = 'Confirm Cancellation';
      }

      this.showToast(result.message);
      await this.loadBookingDetails();
    } catch (err) {
      this.isCancelling = false;
      if (this.dom.confirmCancelSubmitBtn) {
        this.dom.confirmCancelSubmitBtn.disabled = false;
        this.dom.confirmCancelSubmitBtn.textContent = 'Confirm Cancellation';
      }
      this.showToast(err.message || 'Cancellation error.');
    }
  }

  openRefundStatusModal() {
    const b = this.bookingData;
    if (!b) return;

    this.closeAllModals();
    const body = document.getElementById('supportModalBody');
    if (body) {
      body.innerHTML = `
        <div style="background:#FFF9F0; border:1px solid #F2A93B; border-radius:10px; padding:16px; margin-bottom:16px;">
          <h4 style="color:#B57418; font-weight:800; margin-bottom:4px;">↩ 100% Refund Processing</h4>
          <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.5;">
            A full refund of <strong>₹14,515</strong> was initiated to your <strong>${b.paymentSummary.paymentMethod}</strong>.
          </p>
          <div style="font-size:0.82rem; font-weight:700; color:var(--color-text-primary); margin-top:8px;">
            Estimated Credit: 2–4 bank working days (ARN / RRN: 982019482)
          </div>
        </div>
        <button class="btn btn-primary" data-action="close-modal" style="width:100%;">Close</button>
      `;
    }
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.supportModal?.classList.add('open');
  }

  openContactPropertyModal() {
    const b = this.bookingData;
    if (!b) return;

    if (this.dom.contactModalBody) {
      this.dom.contactModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; line-height:1.5;">
          <div style="background:#F8FCFC; padding:14px; border-radius:10px; border:1px solid var(--color-border-subtle);">
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Property Host</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--color-text-primary);">${b.property.host?.name || 'Ketan & Dr. Meera Salvi'}</div>
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Direct Call / WhatsApp</label>
            <div style="font-size:1rem; font-weight:700; color:var(--color-primary);">${b.property.host?.phone || '+91 98201 45890'}</div>
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase;">Property Address</label>
            <div style="font-size:0.9rem; color:var(--color-text-primary);">${b.property.address}</div>
          </div>
        </div>
      `;
    }
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.contactModal?.classList.add('open');
  }

  openSupportModal() {
    if (this.dom.supportModal) {
      const body = document.getElementById('supportModalBody');
      if (body) {
        body.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <p style="font-size:0.92rem; color:var(--color-text-secondary);">
              Our Konkan travel specialists are here 24/7 to assist with your stay, dates, or special assistance.
            </p>
            <div style="background:#F4FAFA; padding:12px; border-radius:8px; border:1px solid rgba(8,126,139,0.2);">
              <strong>Email Support:</strong> support@konkantrip.com<br />
              <strong>Toll-Free Helpline:</strong> 1800-209-KONKAN
            </div>
            <button class="btn btn-primary" data-action="close-modal" style="width:100%;">Close</button>
          </div>
        `;
      }
    }
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.supportModal?.classList.add('open');
  }

  closeAllModals() {
    this.dom.modalBackdrop?.classList.remove('open');
    this.dom.cancellationModal?.classList.remove('open');
    this.dom.contactModal?.classList.remove('open');
    this.dom.supportModal?.classList.remove('open');
  }

  // =========================================================================
  // State Renderers (Loading, Not Found, Error)
  // =========================================================================

  renderLoadingSkeletons() {
    // Shows shimmering pulse on property thumb
    if (this.dom.propImg) this.dom.propImg.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=100&q=20';
  }

  renderNotFoundState() {
    if (this.dom.mainGridContainer) this.dom.mainGridContainer.style.display = 'none';
    if (this.dom.apiErrorCard) this.dom.apiErrorCard.style.display = 'none';
    if (this.dom.notFoundCard) this.dom.notFoundCard.style.display = 'block';
  }

  renderApiErrorState(msg) {
    if (this.dom.mainGridContainer) this.dom.mainGridContainer.style.display = 'none';
    if (this.dom.notFoundCard) this.dom.notFoundCard.style.display = 'none';
    if (this.dom.apiErrorCard) {
      this.dom.apiErrorCard.style.display = 'block';
      const desc = document.getElementById('apiErrorDescText');
      if (desc) desc.textContent = msg || 'We could not load your booking details. Please try again.';
    }
  }

  // =========================================================================
  // Dev State Switcher Modes (10 States)
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);

    if (mode === 'NOT_FOUND') {
      this.renderNotFoundState();
      this.showToast('Switched to Booking Not Found State');
    } else if (mode === 'ERROR') {
      this.renderApiErrorState('Simulated 500 Booking Service Outage');
      this.showToast('Switched to API Error State');
    } else {
      this.loadBookingDetails();
      this.showToast(`Switched to ${mode} State`);
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
      <svg class="icon-inline icon-sm" style="color:var(--color-primary);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
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
  window.konkanBookingDetails = new KonkanBookingDetailsController();
  window.konkanBookingDetails.init();
});
