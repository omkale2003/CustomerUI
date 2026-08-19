/**
 * KonkanTrip — Screen 08: Customer Secure Payment & Checkout Controller
 * Handles payment method tab selection (UPI, Tokenized Cards, Net Banking, Pay at Property),
 * card formatters, duplicate payment click protection, backend authoritative order creation,
 * provider verification webhook simulation, and transition to Screen 09 (Confirmation).
 */

class KonkanPaymentController {
  constructor() {
    this.orderId = 'KT-ORD-234543';
    this.sessionId = 'KT-BK-980123';
    this.payableAmount = 14515; // Authoritative backend total
    this.selectedMethod = 'upi'; // 'upi' | 'card' | 'netbanking' | 'wallets' | 'pay_property'
    this.isSubmitting = false;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    this.updatePayButtonLabels();
  }

  cacheDom() {
    // Payment Method Cards
    this.dom.methodCards = document.querySelectorAll('.payment-method-card');
    this.dom.upiIdInput = document.getElementById('customUpiId');
    this.dom.cardNumberInput = document.getElementById('cardNumberInput');
    this.dom.cardExpiryInput = document.getElementById('cardExpiryInput');
    this.dom.cardCvvInput = document.getElementById('cardCvvInput');
    this.dom.cardHolderInput = document.getElementById('cardHolderInput');
    this.dom.cardBrandBadge = document.getElementById('cardBrandBadge');

    // CTAs & Sidebars
    this.dom.payCtaBtn = document.getElementById('payCtaBtn');
    this.dom.payCtaAmountText = document.getElementById('payCtaAmountText');
    this.dom.mobilePayBtn = document.getElementById('mobilePayBtn');
    this.dom.mobilePayAmountText = document.getElementById('mobilePayAmountText');
    this.dom.summaryTotalVal = document.getElementById('paymentSummaryTotal');

    // Modals & Overlays
    this.dom.processingOverlay = document.getElementById('paymentProcessingOverlay');
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.paymentFailedModal = document.getElementById('paymentFailedModal');
    this.dom.paymentPendingModal = document.getElementById('paymentPendingModal');
    this.dom.bookingConfirmingModal = document.getElementById('bookingConfirmingModal');
    this.dom.cancellationModal = document.getElementById('cancellationModal');
    this.dom.cancellationModalBody = document.getElementById('cancellationModalBody');
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const ord = params.get('orderId');
    const sess = params.get('sessionId');
    const amt = params.get('amount');

    if (ord) this.orderId = ord;
    if (sess) this.sessionId = sess;
    if (amt) this.payableAmount = parseInt(amt, 10) || 14515;
  }

  bindEvents() {
    // Method Card Selection
    this.dom.methodCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent click if clicking inside an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;
        const method = card.getAttribute('data-method');
        this.selectPaymentMethod(method);
      });
    });

    // UPI Quick App Buttons
    document.querySelectorAll('.upi-app-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.upi-app-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const handle = btn.getAttribute('data-upi-handle');
        if (this.dom.upiIdInput) this.dom.upiIdInput.value = `aniket${handle}`;
        this.showToast(`Selected ${btn.textContent.trim()} handle`);
      });
    });

    // Card Input Auto-Formatters
    this.dom.cardNumberInput?.addEventListener('input', (e) => {
      this.formatCardNumber(e.target);
    });

    this.dom.cardExpiryInput?.addEventListener('input', (e) => {
      this.formatExpiryDate(e.target);
    });

    // Net Banking Bank Choice Cards
    document.querySelectorAll('.bank-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.bank-choice-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.showToast(`Selected ${card.textContent.trim()}`);
      });
    });

    // Primary Pay CTAs (Duplicate Click Protected)
    this.dom.payCtaBtn?.addEventListener('click', () => {
      this.executePayment();
    });

    this.dom.mobilePayBtn?.addEventListener('click', () => {
      this.executePayment();
    });

    // Modal Actions
    document.getElementById('retryPaymentBtn')?.addEventListener('click', () => {
      this.closeAllModals();
      this.executePayment();
    });

    document.getElementById('chooseOtherMethodBtn')?.addEventListener('click', () => {
      this.closeAllModals();
      this.selectPaymentMethod('card');
    });

    document.getElementById('viewCancellationModalBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openCancellationModal();
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

  selectPaymentMethod(method) {
    this.selectedMethod = method;
    this.dom.methodCards.forEach(card => {
      if (card.getAttribute('data-method') === method) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    if (method === 'pay_property') {
      this.dom.payCtaAmountText.textContent = 'Confirm Booking (Pay at Property)';
      if (this.dom.mobilePayAmountText) this.dom.mobilePayAmountText.textContent = 'Confirm Booking';
    } else {
      this.updatePayButtonLabels();
    }
  }

  updatePayButtonLabels() {
    const formatted = `₹${this.payableAmount.toLocaleString('en-IN')}`;
    if (this.dom.payCtaAmountText) this.dom.payCtaAmountText.textContent = `Pay ${formatted}`;
    if (this.dom.mobilePayAmountText) this.dom.mobilePayAmountText.textContent = `Pay ${formatted}`;
    if (this.dom.summaryTotalVal) this.dom.summaryTotalVal.textContent = formatted;
  }

  // =========================================================================
  // Input Formatters
  // =========================================================================

  formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    let brand = 'Card';

    if (val.startsWith('4')) brand = 'Visa';
    else if (val.startsWith('5')) brand = 'Mastercard';
    else if (val.startsWith('6') || val.startsWith('3')) brand = 'RuPay';

    if (this.dom.cardBrandBadge) this.dom.cardBrandBadge.textContent = brand;

    const parts = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    input.value = parts.join(' ');
  }

  formatExpiryDate(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      input.value = `${val.substring(0, 2)}/${val.substring(2)}`;
    } else {
      input.value = val;
    }
  }

  // =========================================================================
  // Payment Execution & Duplicate Protection
  // =========================================================================

  async executePayment() {
    if (this.isSubmitting) return;

    // Validate Input Fields for Selected Method
    if (this.selectedMethod === 'upi') {
      const upi = this.dom.upiIdInput?.value.trim();
      if (!upi || !upi.includes('@')) {
        this.showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
        this.dom.upiIdInput?.focus();
        return;
      }
    } else if (this.selectedMethod === 'card') {
      const num = this.dom.cardNumberInput?.value.replace(/\s/g, '');
      if (!num || num.length < 15) {
        this.showToast('Please enter a valid 16-digit card number');
        this.dom.cardNumberInput?.focus();
        return;
      }
    }

    // 1. Disable Button Immediately (Duplicate Click Protection)
    this.isSubmitting = true;
    if (this.dom.payCtaBtn) this.dom.payCtaBtn.disabled = true;
    if (this.dom.mobilePayBtn) this.dom.mobilePayBtn.disabled = true;

    // 2. Open Full-Screen Animated Processing Overlay
    this.dom.processingOverlay?.classList.add('open');

    try {
      // 3. Create Authoritative Payment Order
      const idempotencyKey = `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const order = await apiService.createPaymentOrder({
        sessionId: this.sessionId,
        paymentMethod: this.selectedMethod,
        idempotencyKey
      });

      // 4. Verify Payment & Update Inventory
      const verification = await apiService.verifyAndConfirmPayment({
        orderId: order.orderId,
        sessionId: this.sessionId,
        paymentMethod: this.selectedMethod,
        paymentDetails: { idempotencyKey }
      });

      // 5. Hide Processing Overlay
      this.dom.processingOverlay?.classList.remove('open');

      if (verification.paymentStatus === 'FAILED') {
        this.isSubmitting = false;
        if (this.dom.payCtaBtn) this.dom.payCtaBtn.disabled = false;
        if (this.dom.mobilePayBtn) this.dom.mobilePayBtn.disabled = false;
        this.openPaymentFailedModal();
        return;
      }

      if (verification.paymentStatus === 'PENDING') {
        this.openPaymentPendingModal();
        return;
      }

      if (verification.bookingStatus === 'PROCESSING') {
        this.openBookingConfirmingModal(verification.bookingReference);
        return;
      }

      // Success Confirmed! Navigate to Screen 09
      this.showToast('Payment successful! Confirming your coastal stay...');
      setTimeout(() => {
        window.location.href = `confirmation.html?bookingRef=${encodeURIComponent(verification.bookingReference)}&orderId=${encodeURIComponent(order.orderId)}`;
      }, 500);

    } catch (err) {
      this.dom.processingOverlay?.classList.remove('open');
      this.isSubmitting = false;
      if (this.dom.payCtaBtn) this.dom.payCtaBtn.disabled = false;
      if (this.dom.mobilePayBtn) this.dom.mobilePayBtn.disabled = false;
      this.showToast(err.message || 'Payment communication error.');
    }
  }

  // =========================================================================
  // Exception Modals
  // =========================================================================

  openPaymentFailedModal() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.paymentFailedModal?.classList.add('open');
  }

  openPaymentPendingModal() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.paymentPendingModal?.classList.add('open');
  }

  openBookingConfirmingModal(ref) {
    this.closeAllModals();
    const refSpan = document.getElementById('confirmingBookingRef');
    if (refSpan) refSpan.textContent = ref || 'KT-BK-980123';
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.bookingConfirmingModal?.classList.add('open');
  }

  openCancellationModal() {
    if (this.dom.cancellationModalBody) {
      this.dom.cancellationModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px; line-height:1.6; color:var(--color-text-primary);">
          <div style="background:#F4FAFA; padding:14px; border-radius:10px; border-left:4px solid var(--color-primary);">
            <h4 style="font-weight:700; margin-bottom:4px;">100% Full Refund Window</h4>
            <p style="font-size:0.9rem; color:var(--color-text-secondary);">Cancel up to 24 hours before check-in (22 Aug 2026) for a 100% complete refund credited back to your original payment mode within 2–4 bank working days.</p>
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
    this.dom.paymentFailedModal?.classList.remove('open');
    this.dom.paymentPendingModal?.classList.remove('open');
    this.dom.bookingConfirmingModal?.classList.remove('open');
    this.dom.cancellationModal?.classList.remove('open');
  }

  // =========================================================================
  // Dev State Switcher Modes
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);

    if (mode === 'PAYMENT_FAILED') {
      this.openPaymentFailedModal();
      this.showToast('Switched to Payment Failed State');
    } else if (mode === 'PAYMENT_PENDING') {
      this.openPaymentPendingModal();
      this.showToast('Switched to Payment Pending State');
    } else if (mode === 'PAYMENT_SUCCESS_CONFIRMING') {
      this.openBookingConfirmingModal('KT-BK-980123');
      this.showToast('Switched to Payment Received / Confirming State');
    } else if (mode === 'ERROR') {
      this.showToast('Simulated Payment Gateway Offline Error');
    } else {
      this.closeAllModals();
      this.showToast('Switched to Normal Payment Flow');
    }
  }

  // =========================================================================
  // Utilities
  // =========================================================================

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
  window.konkanPayment = new KonkanPaymentController();
  window.konkanPayment.init();
});
