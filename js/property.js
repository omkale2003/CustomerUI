/**
 * KonkanTrip — Screen 05: Customer Property Details Controller
 * Handles real-time property loading, 5-photo gallery & full-screen modal,
 * room cards inspection, live room selection, sticky itemized pricing breakdown,
 * house rules, full cancellation policy modal, review breakdown, nearby attractions,
 * inventory validation, and transition to Screen 06 (Guest Details).
 */

class KonkanPropertyController {
  constructor() {
    this.propertyId = 'stay-03';
    this.searchParams = {
      destination: 'Dapoli',
      checkIn: '2026-08-24',
      checkOut: '2026-08-26',
      adults: 2,
      children: 0,
      rooms: 1,
      nights: 2
    };

    this.propertyData = null;
    this.selectedRoomId = null;
    this.activeGalleryIndex = 0;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    await this.loadPropertyData();
    this.updateWishlistBadges();
  }

  cacheDom() {
    // Top Nav & Actions
    this.dom.backToResultsBtn = document.getElementById('backToResultsBtn');
    this.dom.savePropertyBtn = document.getElementById('savePropertyBtn');
    this.dom.sharePropertyBtn = document.getElementById('sharePropertyBtn');

    // Header Block
    this.dom.propTitle = document.getElementById('propertyTitle');
    this.dom.propBadge = document.getElementById('propertyBadge');
    this.dom.propRating = document.getElementById('propertyRating');
    this.dom.propReviewsCount = document.getElementById('propertyReviewsCount');
    this.dom.propLocation = document.getElementById('propertyLocation');

    // Gallery
    this.dom.galleryHero = document.getElementById('galleryHero');
    this.dom.viewAllPhotosBtn = document.getElementById('viewAllPhotosBtn');

    // Content Sections
    this.dom.highlightsContainer = document.getElementById('highlightsContainer');
    this.dom.aboutText = document.getElementById('aboutNarrativeText');
    this.dom.readMoreBtn = document.getElementById('readMoreBtn');
    this.dom.hostCard = document.getElementById('hostCard');
    this.dom.nearbyPlacesList = document.getElementById('nearbyPlacesList');
    this.dom.roomCardsStack = document.getElementById('roomCardsStack');
    this.dom.houseRulesGrid = document.getElementById('houseRulesGrid');
    this.dom.cancellationSnippet = document.getElementById('cancellationSnippet');
    this.dom.reviewsScoreBig = document.getElementById('reviewsScoreBig');
    this.dom.ratingBarsGrid = document.getElementById('ratingBarsGrid');
    this.dom.reviewsListStack = document.getElementById('reviewsListStack');
    this.dom.nearbyAttractionsList = document.getElementById('nearbyAttractionsList');

    // Sticky Booking Sidebar
    this.dom.stickyRoomTitle = document.getElementById('stickyRoomTitle');
    this.dom.stickyDates = document.getElementById('stickyDates');
    this.dom.stickyGuests = document.getElementById('stickyGuests');
    this.dom.priceBaseVal = document.getElementById('priceBaseVal');
    this.dom.priceDiscountVal = document.getElementById('priceDiscountVal');
    this.dom.priceTaxesVal = document.getElementById('priceTaxesVal');
    this.dom.priceTotalVal = document.getElementById('priceTotalVal');
    this.dom.continueBookingBtn = document.getElementById('continueBookingBtn');

    // Mobile Sticky Booking Bar
    this.dom.mobileStickyPrice = document.getElementById('mobileStickyPrice');
    this.dom.mobileContinueBtn = document.getElementById('mobileContinueBtn');

    // Modals
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.fullGalleryModal = document.getElementById('fullGalleryModal');
    this.dom.galleryLargeImg = document.getElementById('galleryLargeImg');
    this.dom.galleryCounterText = document.getElementById('galleryCounterText');
    this.dom.galleryThumbTrack = document.getElementById('galleryThumbTrack');
    this.dom.allAmenitiesModal = document.getElementById('allAmenitiesModal');
    this.dom.allAmenitiesList = document.getElementById('allAmenitiesList');
    this.dom.cancellationModal = document.getElementById('cancellationModal');
    this.dom.cancellationModalBody = document.getElementById('cancellationModalBody');

    // Global Drawers
    this.dom.wishlistDrawer = document.getElementById('wishlistDrawer');
    this.dom.wishlistDrawerBody = document.getElementById('wishlistDrawerBody');
    this.dom.tripsDrawer = document.getElementById('tripsDrawer');
    this.dom.tripsDrawerBody = document.getElementById('tripsDrawerBody');
    this.dom.authModal = document.getElementById('authModal');
    this.dom.mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    this.dom.toastContainer = document.getElementById('toastContainer');
    this.dom.wishlistBadges = document.querySelectorAll('.wishlist-count-badge');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || params.get('propertyId');
    const dest = params.get('dest') || params.get('destination');
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const adults = params.get('adults');
    const children = params.get('children');
    const rooms = params.get('rooms');
    const nights = params.get('nights');

    if (id) this.propertyId = id;
    if (dest) this.searchParams.destination = decodeURIComponent(dest);
    if (checkIn) this.searchParams.checkIn = checkIn;
    if (checkOut) this.searchParams.checkOut = checkOut;
    if (adults) this.searchParams.adults = parseInt(adults, 10);
    if (children) this.searchParams.children = parseInt(children, 10);
    if (rooms) this.searchParams.rooms = parseInt(rooms, 10);
    if (nights) this.searchParams.nights = parseInt(nights, 10);

    // Update Back Button Link with preserved search criteria
    if (this.dom.backToResultsBtn) {
      const destParam = encodeURIComponent(this.searchParams.destination);
      this.dom.backToResultsBtn.href = `results.html?dest=${destParam}&checkIn=${this.searchParams.checkIn}&checkOut=${this.searchParams.checkOut}&adults=${this.searchParams.adults}&children=${this.searchParams.children}&rooms=${this.searchParams.rooms}&nights=${this.searchParams.nights}`;
      this.dom.backToResultsBtn.querySelector('span').textContent = `Back to ${this.searchParams.destination} stays`;
    }
  }

  bindEvents() {
    // Save / Wishlist
    this.dom.savePropertyBtn?.addEventListener('click', () => {
      this.toggleWishlist();
    });

    // Share Button
    this.dom.sharePropertyBtn?.addEventListener('click', () => {
      this.handleShare();
    });

    // View All Photos trigger
    this.dom.viewAllPhotosBtn?.addEventListener('click', () => {
      this.openFullGallery(0);
    });

    // Read More / Less Toggle
    this.dom.readMoreBtn?.addEventListener('click', () => {
      const isCollapsed = this.dom.aboutText?.classList.contains('collapsed');
      if (isCollapsed) {
        this.dom.aboutText?.classList.remove('collapsed');
        this.dom.readMoreBtn.textContent = 'Read less ↑';
      } else {
        this.dom.aboutText?.classList.add('collapsed');
        this.dom.readMoreBtn.textContent = 'Read more ↓';
      }
    });

    // View All Amenities modal trigger
    document.getElementById('viewAllAmenitiesBtn')?.addEventListener('click', () => {
      this.openAllAmenitiesModal();
    });

    // View Full Cancellation modal trigger
    document.getElementById('viewFullCancellationBtn')?.addEventListener('click', () => {
      this.openCancellationModal();
    });

    // Continue to Booking CTAs
    this.dom.continueBookingBtn?.addEventListener('click', () => {
      this.proceedToBooking();
    });

    this.dom.mobileContinueBtn?.addEventListener('click', () => {
      this.proceedToBooking();
    });

    // Gallery Modal Prev / Next Buttons
    document.getElementById('galleryPrevBtn')?.addEventListener('click', () => {
      this.navigateGallery(-1);
    });

    document.getElementById('galleryNextBtn')?.addEventListener('click', () => {
      this.navigateGallery(1);
    });

    // Global Modal Close Buttons
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    this.dom.modalBackdrop?.addEventListener('click', () => {
      this.closeAllModals();
    });

    // Header Drawer Triggers
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

    // Dev State Switcher Buttons
    document.querySelectorAll('.dev-state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dev-state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.switchDevState(mode);
      });
    });

    // Keyboard navigation for Gallery
    document.addEventListener('keydown', (e) => {
      if (this.dom.fullGalleryModal?.classList.contains('open')) {
        if (e.key === 'ArrowRight') this.navigateGallery(1);
        if (e.key === 'ArrowLeft') this.navigateGallery(-1);
        if (e.key === 'Escape') this.closeAllModals();
      }
    });
  }

  // =========================================================================
  // Property Loading & UI Rendering
  // =========================================================================

  async loadPropertyData() {
    this.renderLoadingSkeletons();

    try {
      const prop = await apiService.fetchPropertyDetails(this.propertyId);
      if (!prop) {
        this.renderUnavailableState();
        return;
      }

      this.propertyData = prop;
      this.selectedRoomId = prop.roomTypes?.[0]?.roomId || null;

      this.renderPropertyHeader();
      this.renderHeroGallery();
      this.renderHighlights();
      this.renderAboutSection();
      this.renderLocationSection();
      this.renderRoomCards();
      this.renderHouseRulesAndCancellation();
      this.renderReviewsSection();
      this.renderNearbyAttractions();
      this.updateStickyBookingCard();

      // Check saved status
      const isSaved = apiService.isWishlisted(prop.id);
      if (this.dom.savePropertyBtn) {
        if (isSaved) this.dom.savePropertyBtn.classList.add('saved');
        else this.dom.savePropertyBtn.classList.remove('saved');
      }
    } catch (err) {
      console.error('Property load error', err);
      this.renderErrorState(err.message || 'Unable to connect to inventory.');
    }
  }

  renderPropertyHeader() {
    const p = this.propertyData;
    if (this.dom.propTitle) this.dom.propTitle.textContent = p.title;
    if (this.dom.propBadge) this.dom.propBadge.textContent = p.badge;
    if (this.dom.propRating) this.dom.propRating.textContent = `★ ${p.rating}`;
    if (this.dom.propReviewsCount) this.dom.propReviewsCount.textContent = `(${p.reviewsCount} reviews)`;
    if (this.dom.propLocation) this.dom.propLocation.textContent = `${p.microLocation || p.destinationName}, Maharashtra`;
  }

  renderHeroGallery() {
    const p = this.propertyData;
    const gallery = p.gallery || [p.image];

    if (this.dom.galleryHero) {
      this.dom.galleryHero.innerHTML = `
        <div class="gallery-grid-desktop">
          <div class="gallery-main-frame" onclick="window.konkanProp.openFullGallery(0)">
            <img class="gallery-main-img" src="${gallery[0]}" alt="${p.title}" />
          </div>
          <div class="gallery-thumb-grid">
            ${gallery.slice(1, 5).map((img, idx) => `
              <div class="gallery-thumb-frame" onclick="window.konkanProp.openFullGallery(${idx + 1})">
                <img class="gallery-thumb-img" src="${img}" alt="${p.title} photo ${idx + 2}" />
              </div>
            `).join('')}
          </div>
        </div>
        <button class="view-all-photos-pill" id="viewAllPhotosBtn" onclick="window.konkanProp.openFullGallery(0)">
          <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <span>View all photos (${gallery.length})</span>
        </button>
      `;
    }
  }

  renderHighlights() {
    const p = this.propertyData;
    if (!this.dom.highlightsContainer || !p.highlights) return;

    this.dom.highlightsContainer.innerHTML = p.highlights.map(h => `
      <div class="highlight-item-box">
        <div class="highlight-icon-wrap">
          <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span class="highlight-text">${h}</span>
      </div>
    `).join('');
  }

  renderAboutSection() {
    const p = this.propertyData;
    if (this.dom.aboutText) {
      this.dom.aboutText.textContent = p.fullDescription || p.shortDesc;
      this.dom.aboutText.classList.add('collapsed');
    }

    if (this.dom.hostCard && p.host) {
      this.dom.hostCard.innerHTML = `
        <div class="host-avatar-large">${p.host.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div>
          <h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700; color:var(--color-text-primary); margin-bottom:2px;">Hosted by ${p.host.name}</h4>
          <p style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:4px;">${p.host.type} · Response rate: ${p.host.responseRate}</p>
          <p style="font-size:0.88rem; color:var(--color-text-primary); line-height:1.5;">"${p.host.bio || 'Dedicated to sharing authentic Konkani hospitality and secret coastal hideaways with conscious travellers.'}"</p>
        </div>
      `;
    }
  }

  renderLocationSection() {
    const p = this.propertyData;
    if (this.dom.nearbyPlacesList && p.nearbyPlaces) {
      this.dom.nearbyPlacesList.innerHTML = p.nearbyPlaces.map(place => `
        <div class="nearby-place-pill">
          <span class="nearby-place-name">📍 ${place.name}</span>
          <span class="nearby-place-dist">${place.distance}</span>
        </div>
      `).join('');
    }
  }

  renderRoomCards() {
    const p = this.propertyData;
    if (!this.dom.roomCardsStack || !p.roomTypes) return;

    const nights = this.searchParams.nights || 2;

    this.dom.roomCardsStack.innerHTML = p.roomTypes.map(room => {
      const isSelected = room.roomId === this.selectedRoomId;
      const nightlyPrice = room.pricePerNight.toLocaleString('en-IN');
      const taxesNightly = room.taxesPerNight.toLocaleString('en-IN');
      const totalPrice = ((room.pricePerNight + room.taxesPerNight) * nights).toLocaleString('en-IN');

      return `
        <div class="room-card-box ${isSelected ? 'selected' : ''}" id="room-card-${room.roomId}">
          
          <!-- Room Media -->
          <div class="room-media-frame">
            <img class="room-img-cover" src="${room.image}" alt="${room.name}" />
            <span class="badge badge-sand" style="position:absolute; bottom:8px; left:8px; font-size:0.72rem;">Only ${room.availability} left</span>
          </div>

          <!-- Room Information -->
          <div class="room-info-frame">
            <div>
              <h3 class="room-title-text">${room.name}</h3>
              <div class="room-specs-row">
                <span>👤 ${room.capacity}</span>
                <span>🛏 ${room.bedType}</span>
              </div>
              <div class="room-amenity-tags">
                ${room.amenities.map(a => `<span class="room-tag-item">${a}</span>`).join('')}
              </div>
            </div>

            <div class="room-perks-row">
              <div>✓ ${room.mealPlan}</div>
              <div style="color:var(--color-text-secondary);">🛡 ${room.cancellationPolicy}</div>
            </div>
          </div>

          <!-- Room Pricing & Action -->
          <div class="room-pricing-frame">
            <div>
              <div class="room-rate-val">₹${nightlyPrice} <small style="font-size:0.8rem; font-weight:500; color:var(--color-text-secondary);">/ night</small></div>
              <div style="font-size:0.78rem; color:var(--color-text-secondary); margin-bottom:4px;">+ ₹${taxesNightly} taxes</div>
              <div style="font-size:0.84rem; font-weight:700; color:var(--color-primary);">₹${totalPrice} for ${nights} nights</div>
            </div>

            <button class="select-room-btn ${isSelected ? 'selected' : ''}" onclick="window.konkanProp.selectRoom('${room.roomId}')">
              ${isSelected ? '✓ Selected' : 'Select Room'}
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  selectRoom(roomId) {
    this.selectedRoomId = roomId;
    this.renderRoomCards();
    this.updateStickyBookingCard();
    const room = this.propertyData?.roomTypes?.find(r => r.roomId === roomId);
    this.showToast(`Selected room: ${room ? room.name : 'Room category'}`);
  }

  updateStickyBookingCard() {
    const p = this.propertyData;
    if (!p) return;

    const selectedRoom = p.roomTypes?.find(r => r.roomId === this.selectedRoomId) || p.roomTypes?.[0];
    if (!selectedRoom) return;

    const nights = this.searchParams.nights || 2;
    const rooms = this.searchParams.rooms || 1;

    const basePrice = selectedRoom.pricePerNight * nights * rooms;
    const taxes = selectedRoom.taxesPerNight * nights * rooms;
    const discount = Math.round(basePrice * 0.10); // 10% seasonal discount
    const total = basePrice - discount + taxes;

    if (this.dom.stickyRoomTitle) this.dom.stickyRoomTitle.textContent = selectedRoom.name;
    if (this.dom.stickyDates) this.dom.stickyDates.textContent = `${this.formatDateShort(this.searchParams.checkIn)} – ${this.formatDateShort(this.searchParams.checkOut)} (${nights} nights)`;
    if (this.dom.stickyGuests) this.dom.stickyGuests.textContent = `${this.searchParams.adults + this.searchParams.children} Guests · ${rooms} Room`;

    if (this.dom.priceBaseVal) this.dom.priceBaseVal.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
    if (this.dom.priceDiscountVal) this.dom.priceDiscountVal.textContent = `- ₹${discount.toLocaleString('en-IN')}`;
    if (this.dom.priceTaxesVal) this.dom.priceTaxesVal.textContent = `+ ₹${taxes.toLocaleString('en-IN')}`;
    if (this.dom.priceTotalVal) this.dom.priceTotalVal.textContent = `₹${total.toLocaleString('en-IN')}`;

    if (this.dom.mobileStickyPrice) {
      this.dom.mobileStickyPrice.textContent = `₹${total.toLocaleString('en-IN')} total (${nights} nights)`;
    }
  }

  renderHouseRulesAndCancellation() {
    const p = this.propertyData;
    if (this.dom.houseRulesGrid && p.houseRules) {
      this.dom.houseRulesGrid.innerHTML = `
        <div class="house-rule-item">
          <span class="house-rule-label">Check-in</span>
          <span class="house-rule-val">${p.houseRules.checkIn}</span>
        </div>
        <div class="house-rule-item">
          <span class="house-rule-label">Check-out</span>
          <span class="house-rule-val">${p.houseRules.checkOut}</span>
        </div>
        <div class="house-rule-item">
          <span class="house-rule-label">Pet Policy</span>
          <span class="house-rule-val">${p.houseRules.pets}</span>
        </div>
        <div class="house-rule-item">
          <span class="house-rule-label">Smoking Policy</span>
          <span class="house-rule-val">${p.houseRules.smoking}</span>
        </div>
      `;
    }

    if (this.dom.cancellationSnippet) {
      this.dom.cancellationSnippet.textContent = p.cancellationDetailed || 'Free cancellation up to 48 hours before check-in.';
    }
  }

  renderReviewsSection() {
    const p = this.propertyData;
    if (this.dom.reviewsScoreBig) this.dom.reviewsScoreBig.textContent = `${p.rating} ★`;

    if (this.dom.ratingBarsGrid && p.ratingsBreakdown) {
      const bars = [
        { label: 'Cleanliness', score: p.ratingsBreakdown.cleanliness || 4.9 },
        { label: 'Location & Beach Access', score: p.ratingsBreakdown.location || 5.0 },
        { label: 'Host & Service', score: p.ratingsBreakdown.service || 4.9 },
        { label: 'Value for Money', score: p.ratingsBreakdown.value || 4.85 },
        { label: 'Food & Authenticity', score: p.ratingsBreakdown.food || 5.0 }
      ];

      this.dom.ratingBarsGrid.innerHTML = bars.map(b => `
        <div class="rating-bar-row">
          <span style="font-weight:600; width:150px;">${b.label}</span>
          <div class="rating-progress-track">
            <div class="rating-progress-fill" style="width: ${(b.score / 5) * 100}%"></div>
          </div>
          <span style="font-weight:700; width:30px; text-align:right;">${b.score}</span>
        </div>
      `).join('');
    }

    if (this.dom.reviewsListStack && p.reviewsList) {
      this.dom.reviewsListStack.innerHTML = p.reviewsList.map(r => `
        <div class="review-card-item">
          <div class="review-user-header">
            <div>
              <span class="review-user-name">${r.customerName}</span>
              <span style="font-size:0.8rem; color:var(--color-text-secondary);"> · ${r.location}</span>
            </div>
            <span class="badge badge-green" style="font-size:0.72rem;">Verified Stay</span>
          </div>
          <div style="font-size:0.82rem; color:var(--color-text-secondary); margin-bottom:4px;">
            ${r.stayType} · ${r.date} · Rating: <strong>${r.rating} ★</strong>
          </div>
          <p class="review-comment-p">"${r.comment}"</p>
        </div>
      `).join('');
    }
  }

  renderNearbyAttractions() {
    const p = this.propertyData;
    if (this.dom.nearbyAttractionsList && p.nearbyPlaces) {
      this.dom.nearbyAttractionsList.innerHTML = p.nearbyPlaces.map(pl => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#FAFDFD; padding:12px 16px; border-radius:12px; border:1px solid var(--color-border-subtle);">
          <div>
            <h4 style="font-size:0.95rem; font-weight:700;">${pl.name}</h4>
            <span style="font-size:0.8rem; color:var(--color-text-secondary);">${pl.type}</span>
          </div>
          <span class="badge badge-sand" style="font-weight:700;">${pl.distance}</span>
        </div>
      `).join('');
    }
  }

  // =========================================================================
  // Gallery Modal & Navigation
  // =========================================================================

  openFullGallery(index = 0) {
    const gallery = this.propertyData?.gallery || [this.propertyData?.image];
    this.activeGalleryIndex = index;

    if (this.dom.galleryLargeImg) {
      this.dom.galleryLargeImg.src = gallery[this.activeGalleryIndex];
    }
    if (this.dom.galleryCounterText) {
      this.dom.galleryCounterText.textContent = `Photo ${this.activeGalleryIndex + 1} of ${gallery.length}`;
    }

    if (this.dom.galleryThumbTrack) {
      this.dom.galleryThumbTrack.innerHTML = gallery.map((img, idx) => `
        <img src="${img}" style="width:70px; height:50px; object-fit:cover; border-radius:6px; cursor:pointer; opacity:${idx === this.activeGalleryIndex ? '1' : '0.6'}; border:${idx === this.activeGalleryIndex ? '2px solid var(--color-primary)' : 'none'};" onclick="window.konkanProp.setGalleryIndex(${idx})" />
      `).join('');
    }

    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.fullGalleryModal?.classList.add('open');
  }

  setGalleryIndex(idx) {
    this.openFullGallery(idx);
  }

  navigateGallery(direction) {
    const gallery = this.propertyData?.gallery || [this.propertyData?.image];
    let nextIdx = this.activeGalleryIndex + direction;
    if (nextIdx < 0) nextIdx = gallery.length - 1;
    if (nextIdx >= gallery.length) nextIdx = 0;
    this.openFullGallery(nextIdx);
  }

  // =========================================================================
  // All Amenities & Cancellation Modals
  // =========================================================================

  openAllAmenitiesModal() {
    const p = this.propertyData;
    if (this.dom.allAmenitiesList && p.amenities) {
      this.dom.allAmenitiesList.innerHTML = p.amenities.map(a => `
        <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--color-border-subtle);">
          <svg class="icon-inline icon-sm" style="color:var(--color-primary);" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="font-weight:600;">${a}</span>
        </div>
      `).join('');
    }
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.allAmenitiesModal?.classList.add('open');
  }

  openCancellationModal() {
    const p = this.propertyData;
    if (this.dom.cancellationModalBody) {
      this.dom.cancellationModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px; line-height:1.6; color:var(--color-text-primary);">
          <div style="background:#F4FAFA; padding:14px; border-radius:10px; border-left:4px solid var(--color-primary);">
            <h4 style="font-weight:700; margin-bottom:4px;">100% Full Refund Window</h4>
            <p style="font-size:0.9rem; color:var(--color-text-secondary);">${p.cancellationDetailed || 'Cancel up to 48 hours before check-in for a 100% complete refund with zero cancellation fees.'}</p>
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

  // =========================================================================
  // Wishlist & Share Actions
  // =========================================================================

  toggleWishlist() {
    if (!this.propertyData) return;
    const isSaved = apiService.toggleWishlist(this.propertyData.id);
    if (this.dom.savePropertyBtn) {
      if (isSaved) {
        this.dom.savePropertyBtn.classList.add('saved');
        this.showToast('Saved property to your Wishlist!');
      } else {
        this.dom.savePropertyBtn.classList.remove('saved');
        this.showToast('Removed from Wishlist.');
      }
    }
    this.updateWishlistBadges();
  }

  updateWishlistBadges() {
    const list = apiService.getWishlist();
    this.dom.wishlistBadges?.forEach(b => {
      b.textContent = list.length;
    });
  }

  handleShare() {
    if (navigator.share) {
      navigator.share({
        title: this.propertyData?.title || 'KonkanTrip Coastal Stay',
        text: `Check out ${this.propertyData?.title} on KonkanTrip!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.showToast('Property link copied to clipboard!');
    }
  }

  // =========================================================================
  // Validation & Proceed to Screen 06 (Guest Details)
  // =========================================================================

  async proceedToBooking() {
    if (!this.propertyData) return;

    this.showToast('Verifying live inventory and room pricing...');

    const validation = await apiService.validateRoomBooking({
      propertyId: this.propertyData.id,
      roomId: this.selectedRoomId,
      checkIn: this.searchParams.checkIn,
      checkOut: this.searchParams.checkOut,
      guests: this.searchParams.adults + this.searchParams.children,
      rooms: this.searchParams.rooms
    });

    if (!validation.valid) {
      this.showToast(`Booking error: ${validation.message}`);
      return;
    }

    this.showToast(`Verified! Continuing to Guest Details for ${validation.roomName}...`);

    // Proceed to Screen 06 (Guest Details & Booking Confirmation)
    setTimeout(() => {
      window.location.href = `booking.html?propertyId=${encodeURIComponent(validation.propertyId)}&roomId=${encodeURIComponent(validation.roomId)}&checkIn=${encodeURIComponent(validation.checkIn)}&checkOut=${encodeURIComponent(validation.checkOut)}&adults=${this.searchParams.adults}&children=${this.searchParams.children}&rooms=${this.searchParams.rooms}&total=${validation.totalAmount}`;
    }, 480);
  }

  // =========================================================================
  // Dev State Switcher Modes
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);

    if (mode === 'LOADING') {
      this.renderLoadingSkeletons();
      this.showToast('Switched to Loading Skeletons State');
    } else if (mode === 'EMPTY' || mode === 'UNAVAILABLE') {
      this.renderUnavailableState();
      this.showToast('Switched to Property Unavailable State');
    } else if (mode === 'ERROR') {
      this.renderErrorState('Simulated Property Inventory Service Error', () => this.switchDevState('SUCCESS'));
      this.showToast('Switched to API Error State');
    } else {
      this.loadPropertyData();
      this.showToast('Switched to Success Loaded State');
    }
  }

  renderLoadingSkeletons() {
    if (this.dom.galleryHero) {
      this.dom.galleryHero.innerHTML = `<div class="skeleton-card" style="height: 480px; border-radius: var(--radius-xl);"></div>`;
    }
    if (this.dom.roomCardsStack) {
      this.dom.roomCardsStack.innerHTML = `
        <div class="skeleton-card" style="height: 180px; margin-bottom: 16px;"></div>
        <div class="skeleton-card" style="height: 180px;"></div>
      `;
    }
  }

  renderUnavailableState() {
    const mainContainer = document.querySelector('.property-stage-grid');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--color-white); border-radius: var(--radius-xl); border: 1px solid var(--color-border-subtle); padding: 56px 24px; text-align: center;">
          <div class="no-results-icon-bubble">
            <svg class="icon-inline" style="width:36px; height:36px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 8px;">Property unavailable</h2>
          <p style="color: var(--color-text-secondary); max-width: 480px; margin: 0 auto 20px;">
            This property may have been temporarily unlisted by the host or is no longer available for booking.
          </p>
          <a href="results.html?dest=${encodeURIComponent(this.searchParams.destination)}" class="btn btn-primary">
            <span>Back to Search Results</span>
          </a>
        </div>
      `;
    }
  }

  renderErrorState(message, retryCallback) {
    const mainContainer = document.querySelector('.property-stage-grid');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div style="grid-column: 1 / -1;" class="api-error-card">
          <div class="api-error-icon-bubble">
            <svg class="icon-inline" style="width:32px; height:32px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 class="api-error-title">Something went wrong</h3>
          <p class="api-error-desc">We couldn’t load this property right now. (${message})</p>
          <button class="btn btn-primary" id="retryPropBtn">
            <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>Try Again</span>
          </button>
        </div>
      `;

      document.getElementById('retryPropBtn')?.addEventListener('click', () => {
        if (typeof retryCallback === 'function') retryCallback();
        else this.loadPropertyData();
      });
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
    this.dom.fullGalleryModal?.classList.remove('open');
    this.dom.allAmenitiesModal?.classList.remove('open');
    this.dom.cancellationModal?.classList.remove('open');
    this.dom.wishlistDrawer?.classList.remove('open');
    this.dom.tripsDrawer?.classList.remove('open');
    this.dom.authModal?.classList.remove('open');
    this.dom.mobileMenuDrawer?.classList.remove('open');
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
  window.konkanProp = new KonkanPropertyController();
  window.konkanProp.init();
});
