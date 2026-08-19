/**
 * KonkanTrip - Application Controller
 * Handles user interactions, search flows, popovers, modals, drawers, and state sync.
 */

class KonkanApp {
  constructor() {
    this.currentFilters = {
      category: 'all',
      destinationQuery: '',
      checkIn: '',
      checkOut: '',
      adults: 2,
      children: 0,
      rooms: 1
    };

    this.activeStayModal = null;
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.bindEvents();
    this.initDefaultDates();
    this.updateGuestDisplay();
    this.updateWishlistCount();

    // Load initial data through API layer
    await this.loadAllSections();
  }

  cacheDom() {
    this.dom.header = document.getElementById('siteHeader');
    this.dom.destinationsGrid = document.getElementById('destinationsGrid');
    this.dom.staysGrid = document.getElementById('staysGrid');
    this.dom.categoriesGrid = document.getElementById('categoriesGrid');
    this.dom.experiencesGrid = document.getElementById('experiencesGrid');
    this.dom.filterTabs = document.querySelectorAll('.filter-tab-pill');
    
    // Search elements
    this.dom.destinationInput = document.getElementById('destinationInput');
    this.dom.destPopover = document.getElementById('destPopover');
    this.dom.checkInInput = document.getElementById('checkInInput');
    this.dom.checkOutInput = document.getElementById('checkOutInput');
    this.dom.guestsToggle = document.getElementById('guestsToggle');
    this.dom.guestsPopover = document.getElementById('guestsPopover');
    this.dom.guestsSummaryText = document.getElementById('guestsSummaryText');
    this.dom.searchStaysBtn = document.getElementById('searchStaysBtn');
    
    // Counters
    this.dom.adultsVal = document.getElementById('adultsCount');
    this.dom.childrenVal = document.getElementById('childrenCount');
    this.dom.roomsVal = document.getElementById('roomsCount');

    // Modals & Drawers
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.propertyModal = document.getElementById('propertyModal');
    this.dom.wishlistDrawer = document.getElementById('wishlistDrawer');
    this.dom.tripsDrawer = document.getElementById('tripsDrawer');
    this.dom.authModal = document.getElementById('authModal');
    this.dom.mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    this.dom.toastContainer = document.getElementById('toastContainer');

    // Badges
    this.dom.wishlistBadges = document.querySelectorAll('.wishlist-count-badge');
  }

  bindEvents() {
    // Sticky header on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        this.dom.header?.classList.add('scrolled');
      } else {
        this.dom.header?.classList.remove('scrolled');
      }
    });

    // Destination search input & popover
    this.dom.destinationInput?.addEventListener('focus', () => this.openDestPopover());
    this.dom.destinationInput?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openDestPopover();
    });

    this.dom.destinationInput?.addEventListener('input', (e) => {
      this.currentFilters.destinationQuery = e.target.value;
    });

    // Autocomplete item click
    document.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const destName = item.getAttribute('data-name');
        if (destName && this.dom.destinationInput) {
          this.dom.destinationInput.value = destName;
          this.currentFilters.destinationQuery = destName;
        }
        this.closeAllPopovers();
      });
    });

    // Guests & Rooms Popover
    this.dom.guestsToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleGuestsPopover();
    });

    // Guest counter buttons
    document.querySelectorAll('[data-counter-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-counter-action');
        const target = btn.getAttribute('data-counter-target');
        this.handleCounterChange(target, action);
      });
    });

    // Close popovers on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-field-item') && !e.target.closest('.popover-card')) {
        this.closeAllPopovers();
      }
    });

    // Date change listeners
    this.dom.checkInInput?.addEventListener('change', (e) => {
      this.currentFilters.checkIn = e.target.value;
      if (this.dom.checkOutInput && (!this.dom.checkOutInput.value || this.dom.checkOutInput.value <= e.target.value)) {
        const nextDate = new Date(e.target.value);
        nextDate.setDate(nextDate.getDate() + 2);
        this.dom.checkOutInput.value = nextDate.toISOString().split('T')[0];
        this.currentFilters.checkOut = this.dom.checkOutInput.value;
      }
    });

    this.dom.checkOutInput?.addEventListener('change', (e) => {
      this.currentFilters.checkOut = e.target.value;
    });

    // Search CTA click
    this.dom.searchStaysBtn?.addEventListener('click', () => {
      this.executeSearch();
    });

    // Quick tag pills below search
    document.querySelectorAll('.quick-tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-filter-category');
        const query = pill.getAttribute('data-query');
        if (cat) {
          this.setCategoryFilter(cat);
        } else if (query) {
          if (this.dom.destinationInput) this.dom.destinationInput.value = query;
          this.currentFilters.destinationQuery = query;
          this.executeSearch();
        }
      });
    });

    // Category filter tabs
    this.dom.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-category');
        this.setCategoryFilter(cat);
      });
    });

    // Global Delegated Click for Cards, Wishlist, Modals
    document.addEventListener('click', (e) => {
      // Wishlist toggle
      const wishlistBtn = e.target.closest('[data-action="toggle-wishlist"]');
      if (wishlistBtn) {
        e.stopPropagation();
        const stayId = wishlistBtn.getAttribute('data-stay-id');
        this.handleWishlistToggle(stayId);
        return;
      }

      // View Property modal trigger
      const viewPropBtn = e.target.closest('[data-action="view-property"]');
      if (viewPropBtn) {
        const stayId = viewPropBtn.getAttribute('data-stay-id');
        this.openPropertyModal(stayId);
        return;
      }

      // Destination card click
      const destCard = e.target.closest('.destination-card');
      if (destCard && !e.target.closest('button')) {
        const destName = destCard.getAttribute('data-destination-name');
        if (destName) {
          if (this.dom.destinationInput) this.dom.destinationInput.value = destName;
          this.currentFilters.destinationQuery = destName;
          this.executeSearch();
        }
        return;
      }

      // Category card click
      const catCard = e.target.closest('.category-card');
      if (catCard) {
        const catId = catCard.getAttribute('data-category-id');
        this.showToast(`Exploring ${catCard.querySelector('.category-title')?.textContent || 'Category'}`);
        return;
      }

      // Explore experience button
      const expBtn = e.target.closest('[data-action="explore-exp"]');
      if (expBtn) {
        const expId = expBtn.getAttribute('data-exp-id');
        const exp = EXPERIENCES_DATA.find(x => x.id === expId);
        if (exp) {
          this.showToast(`Selected: ${exp.title} (₹${exp.price.toLocaleString('en-IN')})`);
        }
        return;
      }

      // Wishlist drawer trigger
      if (e.target.closest('[data-action="open-wishlist"]')) {
        this.openWishlistDrawer();
        return;
      }

      // My trips drawer trigger
      if (e.target.closest('[data-action="open-trips"]')) {
        this.openTripsDrawer();
        return;
      }

      // Profile / Auth modal trigger
      if (e.target.closest('[data-action="open-auth"]')) {
        this.openAuthModal();
        return;
      }

      // Mobile menu toggle
      if (e.target.closest('[data-action="toggle-mobile-menu"]')) {
        this.toggleMobileMenu();
        return;
      }

      // Close modal / drawer buttons
      if (e.target.closest('[data-action="close-modal"]') || e.target.id === 'modalBackdrop') {
        this.closeAllModals();
        return;
      }
    });

    // Dev State Switcher Buttons
    document.querySelectorAll('.dev-state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        document.querySelectorAll('.dev-state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setDevMode(mode);
      });
    });
  }

  initDefaultDates() {
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 3); // 3 days ahead
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 2); // 2-night stay

    const inStr = checkIn.toISOString().split('T')[0];
    const outStr = checkOut.toISOString().split('T')[0];

    if (this.dom.checkInInput) this.dom.checkInInput.value = inStr;
    if (this.dom.checkOutInput) this.dom.checkOutInput.value = outStr;

    this.currentFilters.checkIn = inStr;
    this.currentFilters.checkOut = outStr;
  }

  openDestPopover() {
    this.closeAllPopovers();
    this.dom.destPopover?.classList.add('open');
  }

  toggleGuestsPopover() {
    const isOpen = this.dom.guestsPopover?.classList.contains('open');
    this.closeAllPopovers();
    if (!isOpen) {
      this.dom.guestsPopover?.classList.add('open');
    }
  }

  closeAllPopovers() {
    this.dom.destPopover?.classList.remove('open');
    this.dom.guestsPopover?.classList.remove('open');
  }

  handleCounterChange(target, action) {
    if (target === 'adults') {
      if (action === 'inc' && this.currentFilters.adults < 12) this.currentFilters.adults++;
      if (action === 'dec' && this.currentFilters.adults > 1) this.currentFilters.adults--;
      if (this.dom.adultsVal) this.dom.adultsVal.textContent = this.currentFilters.adults;
    } else if (target === 'children') {
      if (action === 'inc' && this.currentFilters.children < 8) this.currentFilters.children++;
      if (action === 'dec' && this.currentFilters.children > 0) this.currentFilters.children--;
      if (this.dom.childrenVal) this.dom.childrenVal.textContent = this.currentFilters.children;
    } else if (target === 'rooms') {
      if (action === 'inc' && this.currentFilters.rooms < 6) this.currentFilters.rooms++;
      if (action === 'dec' && this.currentFilters.rooms > 1) this.currentFilters.rooms--;
      if (this.dom.roomsVal) this.dom.roomsVal.textContent = this.currentFilters.rooms;
    }
    this.updateGuestDisplay();
  }

  updateGuestDisplay() {
    const totalGuests = this.currentFilters.adults + this.currentFilters.children;
    const text = `${totalGuests} Guest${totalGuests > 1 ? 's' : ''}, ${this.currentFilters.rooms} Room${this.currentFilters.rooms > 1 ? 's' : ''}`;
    if (this.dom.guestsSummaryText) {
      this.dom.guestsSummaryText.textContent = text;
    }
  }

  updateWishlistCount() {
    const count = apiService.getWishlist().length;
    this.dom.wishlistBadges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  handleWishlistToggle(stayId) {
    const { added, count } = apiService.toggleWishlist(stayId);
    this.updateWishlistCount();

    // Update all matching heart buttons in DOM
    document.querySelectorAll(`[data-action="toggle-wishlist"][data-stay-id="${stayId}"]`).forEach(btn => {
      btn.classList.toggle('active', added);
      btn.setAttribute('aria-label', added ? 'Remove from wishlist' : 'Save to wishlist');
      btn.setAttribute('title', added ? 'Saved to Wishlist' : 'Add to Wishlist');
    });

    const stay = STAYS_DATA.find(s => s.id === stayId);
    const stayTitle = stay ? stay.title : 'Property';

    if (added) {
      this.showToast(`Saved "${stayTitle}" to Wishlist`);
    } else {
      this.showToast(`Removed from Wishlist`);
    }

    // Refresh wishlist drawer if it's currently open
    if (this.dom.wishlistDrawer?.classList.contains('open')) {
      this.renderWishlistDrawerContent();
    }
  }

  setCategoryFilter(cat) {
    this.currentFilters.category = cat;
    this.dom.filterTabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-category') === cat);
    });
    this.loadFeaturedStays();
  }

  resetFilters() {
    this.currentFilters = {
      category: 'all',
      destinationQuery: '',
      checkIn: '',
      checkOut: '',
      adults: 2,
      children: 0,
      rooms: 1
    };
    if (this.dom.destinationInput) this.dom.destinationInput.value = '';
    this.initDefaultDates();
    this.updateGuestDisplay();
    this.dom.filterTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-category') === 'all'));
    this.loadFeaturedStays();
    this.showToast('Filters reset to all stays');
  }

  async executeSearch() {
    this.closeAllPopovers();
    const targetSection = document.getElementById('featuredStaysSection');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    await this.loadFeaturedStays();
    this.showToast(`Showing stays for "${this.currentFilters.destinationQuery || 'All Konkan'}"`);
  }

  // Load all sections asynchronously
  async loadAllSections() {
    await Promise.all([
      this.loadDestinations(),
      this.loadFeaturedStays(),
      this.loadCategories(),
      this.loadExperiences()
    ]);
  }

  async loadDestinations() {
    if (!this.dom.destinationsGrid) return;
    this.dom.destinationsGrid.innerHTML = UI.renderDestinationsSkeletons(4);

    try {
      const destinations = await apiService.fetchDestinations();
      if (destinations.length === 0) {
        this.dom.destinationsGrid.innerHTML = UI.renderEmptyState('No destinations currently available.');
        return;
      }
      this.dom.destinationsGrid.innerHTML = destinations.map(d => UI.renderDestinationCard(d)).join('');
    } catch (err) {
      this.dom.destinationsGrid.innerHTML = UI.renderErrorState('loadDestinations');
    }
  }

  async loadFeaturedStays() {
    if (!this.dom.staysGrid) return;
    this.dom.staysGrid.innerHTML = UI.renderStaysSkeletons(3);

    try {
      const stays = await apiService.fetchStays({
        category: this.currentFilters.category,
        destinationQuery: this.currentFilters.destinationQuery,
        guests: this.currentFilters.adults + this.currentFilters.children
      });

      if (stays.length === 0) {
        this.dom.staysGrid.innerHTML = UI.renderEmptyState(
          `No properties found matching "${this.currentFilters.destinationQuery || this.currentFilters.category}".`,
          'resetFilters'
        );
        return;
      }

      const wishlist = apiService.getWishlist();
      this.dom.staysGrid.innerHTML = stays
        .map(stay => UI.renderPropertyCard(stay, wishlist.includes(stay.id)))
        .join('');
    } catch (err) {
      this.dom.staysGrid.innerHTML = UI.renderErrorState('loadFeaturedStays');
    }
  }

  async loadCategories() {
    if (!this.dom.categoriesGrid) return;
    try {
      const categories = await apiService.fetchCategories();
      this.dom.categoriesGrid.innerHTML = categories.map(c => UI.renderCategoryCard(c)).join('');
    } catch (err) {
      this.dom.categoriesGrid.innerHTML = UI.renderErrorState('loadCategories');
    }
  }

  async loadExperiences() {
    if (!this.dom.experiencesGrid) return;
    try {
      const experiences = await apiService.fetchExperiences();
      if (experiences.length === 0) {
        this.dom.experiencesGrid.innerHTML = UI.renderEmptyState('No experiences available right now.');
        return;
      }
      this.dom.experiencesGrid.innerHTML = experiences.map(e => UI.renderExperienceCard(e)).join('');
    } catch (err) {
      this.dom.experiencesGrid.innerHTML = UI.renderErrorState('loadExperiences');
    }
  }

  // Reload action from error retry button
  reloadSection() {
    this.loadAllSections();
    this.showToast('Retrying coastal data connection...');
  }

  // Dev state mode switch handler
  setDevMode(mode) {
    apiService.setMode(mode);
    this.loadAllSections();
    this.showToast(`Simulating State: ${mode}`);
  }

  // Modals & Drawers
  async openPropertyModal(stayId) {
    const stay = STAYS_DATA.find(s => s.id === stayId);
    if (!stay) return;

    this.activeStayModal = stay;
    const isWishlisted = apiService.isWishlisted(stay.id);

    const modalBody = document.getElementById('propertyModalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap: var(--space-lg);">
          <div style="position:relative; height:320px; border-radius:var(--radius-lg); overflow:hidden;">
            <img src="${stay.image}" alt="${stay.title}" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; top:16px; left:16px;">
              <span class="badge badge-green">${stay.badge}</span>
            </div>
            <button 
              class="property-wishlist-btn ${isWishlisted ? 'active' : ''}" 
              data-action="toggle-wishlist" 
              data-stay-id="${stay.id}"
              style="top:16px; right:16px;"
            >
              ${UI.icon('heart')}
            </button>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.85rem; color:var(--color-primary); font-weight:600;">${stay.destinationName}</span>
              <div class="property-rating-box">
                ${UI.icon('star', 'icon-sm property-rating-star')}
                <span>${stay.rating.toFixed(2)} (${stay.reviewsCount} verified reviews)</span>
              </div>
            </div>
            <h2 style="font-size:1.6rem; margin-bottom:8px;">${stay.title}</h2>
            <p style="color:var(--color-text-secondary);">${stay.shortDesc}</p>
          </div>

          <div style="background-color:var(--color-bg-sand-light); border:1px solid #EADBCC; border-radius:var(--radius-md); padding:var(--space-md);">
            <div style="font-weight:700; font-size:0.9rem; margin-bottom:4px; color:#5C4A28;">Hosted by ${stay.host.name}</div>
            <div style="font-size:0.825rem; color:var(--color-text-secondary);">${stay.host.type} • Response Rate: ${stay.host.responseRate}</div>
          </div>

          <div>
            <h4 style="font-size:1rem; margin-bottom:8px;">Featured Coastal Amenities</h4>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${stay.amenities.map(a => `<span class="badge badge-teal">${UI.icon('check-circle', 'icon-sm')} ${a}</span>`).join('')}
            </div>
          </div>

          <div>
            <h4 style="font-size:1rem; margin-bottom:8px;">Select Room Option</h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${stay.roomTypes.map((room, idx) => `
                <label style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border:1px solid var(--color-border-subtle); border-radius:var(--radius-md); cursor:pointer; background:${idx === 0 ? 'var(--color-bg-subtle)' : 'var(--color-white)'};">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <input type="radio" name="selectedRoom" value="${room.price}" ${idx === 0 ? 'checked' : ''} />
                    <div>
                      <div style="font-weight:600; font-size:0.95rem;">${room.name}</div>
                      <div style="font-size:0.8rem; color:var(--color-text-secondary);">${room.capacity}</div>
                    </div>
                  </div>
                  <div style="font-weight:800; color:var(--color-primary);">₹${room.price.toLocaleString('en-IN')}<span style="font-size:0.75rem; font-weight:400; color:var(--color-text-secondary);"> / night</span></div>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:var(--space-md); border-top:1px solid var(--color-border-subtle);">
            <div>
              <span style="font-size:0.8rem; color:var(--color-text-secondary);">Total for 2 Nights</span>
              <div style="font-size:1.5rem; font-weight:800; color:var(--color-text-primary); font-family:var(--font-heading);">
                ₹${(stay.pricePerNight * 2).toLocaleString('en-IN')}
              </div>
            </div>
            <button class="btn btn-primary btn-lg" id="confirmBookingBtn" onclick="window.konkanApp.confirmBooking('${stay.id}')">
              Reserve Stay Now
            </button>
          </div>
        </div>
      `;
    }

    this.openModal(this.dom.propertyModal);
  }

  confirmBooking(stayId) {
    const stay = STAYS_DATA.find(s => s.id === stayId);
    if (!stay) return;

    const newTrip = apiService.addBooking({
      stayId: stay.id,
      stayTitle: stay.title,
      destinationName: stay.destinationName,
      checkIn: this.currentFilters.checkIn || '2026-09-15',
      checkOut: this.currentFilters.checkOut || '2026-09-17',
      guests: `${this.currentFilters.adults} Adults, ${this.currentFilters.rooms} Room`,
      totalPrice: stay.pricePerNight * 2,
      image: stay.image
    });

    this.closeAllModals();
    this.showToast(`🎉 Reservation confirmed! Booking ID: ${newTrip.id}`);
    this.openTripsDrawer();
  }

  openWishlistDrawer() {
    this.renderWishlistDrawerContent();
    this.openDrawer(this.dom.wishlistDrawer);
  }

  renderWishlistDrawerContent() {
    const list = apiService.getWishlist();
    const container = document.getElementById('wishlistDrawerBody');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 10px;">
          <div class="state-icon-box empty" style="margin:0 auto var(--space-md);">
            ${UI.icon('heart', 'icon-lg')}
          </div>
          <h4 style="margin-bottom:6px;">Your Wishlist is Empty</h4>
          <p style="font-size:0.9rem; color:var(--color-text-secondary); margin-bottom:16px;">
            Tap the heart icon on any stay card to save it for your upcoming Konkan holiday.
          </p>
          <button class="btn btn-primary btn-sm" onclick="window.konkanApp.closeAllModals()">
            Explore Stays
          </button>
        </div>
      `;
      return;
    }

    const stays = STAYS_DATA.filter(s => list.includes(s.id));
    container.innerHTML = stays.map(stay => `
      <div style="display:flex; gap:12px; padding:12px; border:1px solid var(--color-border-subtle); border-radius:var(--radius-md); background:var(--color-white); align-items:center;">
        <img src="${stay.image}" alt="${stay.title}" style="width:80px; height:80px; border-radius:var(--radius-sm); object-fit:cover;" />
        <div style="flex-grow:1;">
          <div style="font-size:0.75rem; color:var(--color-primary); font-weight:600;">${stay.destinationName}</div>
          <div style="font-weight:700; font-size:0.95rem; line-height:1.2; margin-bottom:4px;">${stay.title}</div>
          <div style="font-weight:800; font-size:0.95rem;">₹${stay.pricePerNight.toLocaleString('en-IN')}<span style="font-size:0.75rem; font-weight:400; color:var(--color-text-secondary);"> / night</span></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button class="btn btn-primary btn-sm" style="padding:6px 12px; font-size:0.8rem;" onclick="window.konkanApp.openPropertyModal('${stay.id}')">View</button>
          <button class="btn btn-ghost btn-sm" style="padding:4px 8px; font-size:0.75rem; color:var(--color-error);" onclick="window.konkanApp.handleWishlistToggle('${stay.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  }

  openTripsDrawer() {
    const container = document.getElementById('tripsDrawerBody');
    if (!container) return;

    const trips = apiService.getMyTrips();
    if (trips.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 10px;">
          <div class="state-icon-box empty" style="margin:0 auto var(--space-md);">
            ${UI.icon('calendar', 'icon-lg')}
          </div>
          <h4 style="margin-bottom:6px;">No Bookings Found</h4>
          <p style="font-size:0.9rem; color:var(--color-text-secondary); margin-bottom:16px;">
            You have no active or upcoming Konkan reservations.
          </p>
          <button class="btn btn-primary btn-sm" onclick="window.konkanApp.closeAllModals()">
            Search Stays
          </button>
        </div>
      `;
    } else {
      container.innerHTML = trips.map(trip => `
        <div style="border:1px solid var(--color-border-subtle); border-radius:var(--radius-lg); padding:var(--space-md); background:var(--color-white); display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge badge-green">${UI.icon('check-circle', 'icon-sm')} ${trip.status}</span>
            <span style="font-size:0.8rem; font-weight:700; color:var(--color-text-secondary);">${trip.id}</span>
          </div>
          <div style="display:flex; gap:12px; align-items:center;">
            <img src="${trip.image}" alt="${trip.stayTitle}" style="width:70px; height:70px; border-radius:var(--radius-sm); object-fit:cover;" />
            <div>
              <div style="font-weight:700; font-size:1rem; color:var(--color-text-primary);">${trip.stayTitle}</div>
              <div style="font-size:0.8rem; color:var(--color-text-secondary);">${trip.destinationName}</div>
            </div>
          </div>
          <div style="background-color:var(--color-bg-subtle); padding:8px 12px; border-radius:var(--radius-sm); font-size:0.825rem; display:flex; justify-content:space-between;">
            <div><strong>Dates:</strong> ${trip.checkIn} to ${trip.checkOut}</div>
            <div><strong>Total:</strong> ₹${trip.totalPrice.toLocaleString('en-IN')}</div>
          </div>
        </div>
      `).join('');
    }

    this.openDrawer(this.dom.tripsDrawer);
  }

  openAuthModal() {
    this.openModal(this.dom.authModal);
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    this.closeAllModals();
    this.showToast('Welcome back, Sagar! Logged in as Konkan Traveler.');
  }

  toggleMobileMenu() {
    const isOpen = this.dom.mobileMenuDrawer?.classList.contains('open');
    if (isOpen) {
      this.closeAllModals();
    } else {
      this.dom.modalBackdrop?.classList.add('open');
      this.dom.mobileMenuDrawer?.classList.add('open');
    }
  }

  openModal(modalElem) {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    modalElem?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  openDrawer(drawerElem) {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    drawerElem?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeAllModals() {
    this.dom.modalBackdrop?.classList.remove('open');
    this.dom.propertyModal?.classList.remove('open');
    this.dom.wishlistDrawer?.classList.remove('open');
    this.dom.tripsDrawer?.classList.remove('open');
    this.dom.authModal?.classList.remove('open');
    this.dom.mobileMenuDrawer?.classList.remove('open');
    document.body.style.overflow = '';
  }

  showToast(message) {
    if (!this.dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `${UI.icon('sparkles', 'icon-sm')} <span>${message}</span>`;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.konkanApp = new KonkanApp();
  window.konkanApp.init();
});
