/**
 * KonkanTrip — Screen 04: Customer Search Results / Stay Discovery Controller
 * Handles backend search queries, sticky search summary, dynamic facet filtering,
 * horizontal property cards, transparent pricing, sorting, wishlist management,
 * property details modal, image gallery, search modifier drawer, and dev state switcher.
 */

class KonkanResultsController {
  constructor() {
    this.searchCriteria = {
      destination: 'Dapoli',
      checkIn: '',
      checkOut: '',
      adults: 2,
      children: 0,
      rooms: 1,
      nights: 2,
      sort: 'recommended',
      page: 1,
      limit: 6,
      priceMin: null,
      priceMax: null,
      propertyTypes: [],
      minRating: null,
      amenities: [],
      microLocations: [],
      pets: false
    };

    this.currentResults = [];
    this.totalPropertiesCount = 0;
    this.facets = {};
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.parseQueryParams();
    this.bindEvents();
    this.updateSearchSummaryBar();
    await this.fetchAndRenderResults();
    this.updateWishlistBadges();
  }

  cacheDom() {
    // Header & Summary Bar
    this.dom.siteHeader = document.getElementById('siteHeader');
    this.dom.summaryDest = document.getElementById('summaryDestVal');
    this.dom.summaryDates = document.getElementById('summaryDatesVal');
    this.dom.summaryGuests = document.getElementById('summaryGuestsVal');
    this.dom.modifySearchBtn = document.getElementById('modifySearchBtn');

    // Results Header
    this.dom.resultsTitle = document.getElementById('resultsMainTitle');
    this.dom.resultsCountSubtitle = document.getElementById('resultsCountSubtitle');
    this.dom.sortSelect = document.getElementById('sortSelectInput');

    // Filter Sidebar & Chips
    this.dom.filterSidebar = document.getElementById('filterSidebar');
    this.dom.activeChipsRow = document.getElementById('activeChipsRow');
    this.dom.clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    this.dom.facetPropertyTypes = document.getElementById('facetPropertyTypes');
    this.dom.facetPriceRanges = document.getElementById('facetPriceRanges');
    this.dom.facetRatings = document.getElementById('facetRatings');
    this.dom.facetAmenities = document.getElementById('facetAmenities');
    this.dom.facetLocations = document.getElementById('facetLocations');

    // Results Stream & Pagination
    this.dom.propertyResultsList = document.getElementById('propertyResultsList');
    this.dom.stateFeedbackArea = document.getElementById('stateFeedbackArea');
    this.dom.loadMoreContainer = document.getElementById('loadMoreContainer');
    this.dom.showingCountText = document.getElementById('showingCountText');
    this.dom.loadMoreBtn = document.getElementById('loadMoreBtn');

    // Modals & Drawers
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.propertyDetailsModal = document.getElementById('propertyDetailsModal');
    this.dom.propertyModalBody = document.getElementById('propertyModalBody');
    this.dom.galleryModal = document.getElementById('galleryModal');
    this.dom.galleryModalImage = document.getElementById('galleryModalImage');
    this.dom.galleryModalTitle = document.getElementById('galleryModalTitle');
    this.dom.searchModifierDrawer = document.getElementById('searchModifierDrawer');
    this.dom.wishlistDrawer = document.getElementById('wishlistDrawer');
    this.dom.wishlistDrawerBody = document.getElementById('wishlistDrawerBody');
    this.dom.tripsDrawer = document.getElementById('tripsDrawer');
    this.dom.tripsDrawerBody = document.getElementById('tripsDrawerBody');
    this.dom.authModal = document.getElementById('authModal');
    this.dom.mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    this.dom.mobileFilterSheet = document.getElementById('mobileFilterSheet');
    this.dom.toastContainer = document.getElementById('toastContainer');
    this.dom.wishlistBadges = document.querySelectorAll('.wishlist-count-badge');
  }

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('dest') || params.get('destination');
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const adults = params.get('adults');
    const children = params.get('children');
    const rooms = params.get('rooms');
    const nights = params.get('nights');
    const sort = params.get('sort');

    if (dest) this.searchCriteria.destination = decodeURIComponent(dest);
    if (checkIn) this.searchCriteria.checkIn = checkIn;
    if (checkOut) this.searchCriteria.checkOut = checkOut;
    if (adults) this.searchCriteria.adults = parseInt(adults, 10);
    if (children) this.searchCriteria.children = parseInt(children, 10);
    if (rooms) this.searchCriteria.rooms = parseInt(rooms, 10);
    if (nights) this.searchCriteria.nights = parseInt(nights, 10);
    if (sort) this.searchCriteria.sort = sort;
    if (params.get('pets') === 'true') this.searchCriteria.pets = true;

    // Fallback default dates if not provided
    if (!this.searchCriteria.checkIn) {
      const today = new Date();
      const inDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
      const outDate = new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate() + 2);
      this.searchCriteria.checkIn = this.formatDateISO(inDate);
      this.searchCriteria.checkOut = this.formatDateISO(outDate);
      this.searchCriteria.nights = 2;
    }
  }

  updateSearchSummaryBar() {
    if (this.dom.summaryDest) {
      this.dom.summaryDest.textContent = this.searchCriteria.destination || 'Dapoli';
    }

    if (this.dom.summaryDates) {
      const inStr = this.formatDateFriendly(this.searchCriteria.checkIn);
      const outStr = this.formatDateFriendly(this.searchCriteria.checkOut);
      this.dom.summaryDates.textContent = `${inStr} – ${outStr} (${this.searchCriteria.nights} nights)`;
    }

    if (this.dom.summaryGuests) {
      const totalGuests = this.searchCriteria.adults + this.searchCriteria.children;
      const roomText = `${this.searchCriteria.rooms} Room${this.searchCriteria.rooms > 1 ? 's' : ''}`;
      const petText = this.searchCriteria.pets ? ' · 🐾 Pets' : '';
      this.dom.summaryGuests.textContent = `${totalGuests} Guests · ${roomText}${petText}`;
    }

    if (this.dom.sortSelect) {
      this.dom.sortSelect.value = this.searchCriteria.sort || 'recommended';
    }
  }

  bindEvents() {
    // Modify Search Criteria Trigger
    this.dom.modifySearchBtn?.addEventListener('click', () => {
      this.openSearchModifierDrawer();
    });

    document.getElementById('mobileModifyBtn')?.addEventListener('click', () => {
      this.openSearchModifierDrawer();
    });

    // Sort Change Handler
    this.dom.sortSelect?.addEventListener('change', (e) => {
      this.searchCriteria.sort = e.target.value;
      this.searchCriteria.page = 1;
      this.fetchAndRenderResults();
    });

    // Clear All Filters
    this.dom.clearAllFiltersBtn?.addEventListener('click', () => {
      this.clearAllFilters();
    });

    // Load More Pagination
    this.dom.loadMoreBtn?.addEventListener('click', () => {
      this.searchCriteria.page++;
      this.fetchAndRenderResults(true);
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

    // Mobile Filters & Sort Triggers
    document.getElementById('mobileFilterTriggerBtn')?.addEventListener('click', () => {
      this.openMobileFilterSheet();
    });

    document.getElementById('mobileApplyFiltersBtn')?.addEventListener('click', () => {
      this.closeAllModals();
      this.fetchAndRenderResults();
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
  // Backend Search & Rendering
  // =========================================================================

  async fetchAndRenderResults(isLoadMore = false) {
    if (!isLoadMore) {
      this.renderLoadingSkeletons();
      this.clearStateFeedback();
    }

    try {
      const response = await apiService.searchStays(this.searchCriteria);
      this.currentResults = isLoadMore ? [...this.currentResults, ...response.properties] : response.properties;
      this.totalPropertiesCount = response.totalCount;
      this.facets = response.facets;

      this.renderResultsHeader(response);
      this.renderActiveFilterChips();
      this.renderFacetsSidebar(response.facets);

      if (this.currentResults.length === 0) {
        this.renderNoResultsState();
      } else {
        this.renderPropertyCards(this.currentResults);
        this.renderLoadMoreControls(response);
      }
    } catch (err) {
      console.error('Search failed', err);
      this.renderErrorState(err.message || 'Unable to connect to inventory.');
    }
  }

  renderResultsHeader(res) {
    if (this.dom.resultsTitle) {
      this.dom.resultsTitle.textContent = `${this.searchCriteria.destination || 'Konkan'} stays`;
    }

    if (this.dom.resultsCountSubtitle) {
      this.dom.resultsCountSubtitle.textContent = `${this.totalPropertiesCount} properties available · Verified coastal stays`;
    }
  }

  renderPropertyCards(properties) {
    if (!this.dom.propertyResultsList) return;

    this.dom.propertyResultsList.innerHTML = properties.map(stay => {
      const isSaved = apiService.isWishlisted(stay.id);
      const nights = this.searchCriteria.nights || 2;
      const nightlyPrice = stay.pricePerNight.toLocaleString('en-IN');
      const taxesNightly = stay.taxesPerNight.toLocaleString('en-IN');
      const totalPriceFormatted = stay.totalPrice.toLocaleString('en-IN');

      return `
        <article class="property-horizontal-card" data-stay-id="${stay.id}">
          
          <!-- 1. Left Image Column -->
          <div class="card-media-col">
            <img class="card-property-img" src="${stay.image}" alt="${stay.title}" loading="lazy" />
            <span class="badge badge-green card-badge-floating">${stay.badge}</span>
            <button class="card-wishlist-btn ${isSaved ? 'active' : ''}" data-wishlist-id="${stay.id}" title="${isSaved ? 'Remove from Saved' : 'Save Property'}">
              <svg class="icon-inline" style="width:18px; height:18px;" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <button class="card-gallery-trigger" data-gallery-id="${stay.id}">
              <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>Photos (${(stay.gallery && stay.gallery.length) || 3})</span>
            </button>
          </div>

          <!-- 2. Center Property Information Column -->
          <div class="card-info-col">
            <div>
              <div class="card-header-top">
                <h3 class="card-title-text" data-action="view-property" data-stay-id="${stay.id}">${stay.title}</h3>
                <div class="card-rating-badge">
                  <span>★</span>
                  <span>${stay.rating}</span>
                  <span style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:500;">(${stay.reviewsCount})</span>
                </div>
              </div>
              <div class="card-location-row">
                <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${stay.microLocation || stay.destinationName} · ${stay.distanceInfo}</span>
              </div>
            </div>

            <!-- Key Amenities -->
            <div class="card-amenities-row">
              ${stay.amenities.slice(0, 4).map(a => `<span class="amenity-chip-item">${a}</span>`).join('')}
            </div>

            <!-- Important Booking Benefit -->
            <div class="card-booking-benefit">
              <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${stay.bookingBenefit}</span>
            </div>
          </div>

          <!-- 3. Right Transparent Price & CTA Column -->
          <div class="card-price-col">
            <div>
              <span class="price-sub-label">Starting from</span>
              <div class="price-rate-headline">₹${nightlyPrice} <span>/ night</span></div>
              <div class="price-taxes-text">+ ₹${taxesNightly} taxes & fees</div>
              <div class="price-total-badge">₹${totalPriceFormatted} total for ${nights} nights</div>
            </div>

            <button class="view-property-btn" data-action="view-property" data-stay-id="${stay.id}">
              <span>View Property</span>
              <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

        </article>
      `;
    }).join('');

    this.bindPropertyCardEvents();
  }

  bindPropertyCardEvents() {
    // View Property CTA & Title clicks — Navigate directly to Screen 05 (property.html)
    document.querySelectorAll('[data-action="view-property"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const stayId = el.getAttribute('data-stay-id');
        const dest = encodeURIComponent(this.searchCriteria.destination || 'Dapoli');
        const checkIn = this.searchCriteria.checkIn;
        const checkOut = this.searchCriteria.checkOut;
        const adults = this.searchCriteria.adults;
        const children = this.searchCriteria.children;
        const rooms = this.searchCriteria.rooms;
        const nights = this.searchCriteria.nights;

        this.showToast('Opening property details...');
        setTimeout(() => {
          window.location.href = `property.html?id=${stayId}&dest=${dest}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}&nights=${nights}`;
        }, 300);
      });
    });

    // Wishlist Heart Click
    document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stayId = btn.getAttribute('data-wishlist-id');
        this.handleWishlistToggle(stayId, btn);
      });
    });

    // Image Gallery Trigger
    document.querySelectorAll('.card-gallery-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stayId = btn.getAttribute('data-gallery-id');
        this.openGalleryModal(stayId);
      });
    });
  }

  // =========================================================================
  // Dynamic Facets & Sidebar Filters
  // =========================================================================

  renderFacetsSidebar(facets) {
    if (!facets) return;

    // 1. Property Types
    if (this.dom.facetPropertyTypes && facets.propertyTypes) {
      this.dom.facetPropertyTypes.innerHTML = facets.propertyTypes.map(t => `
        <label class="facet-checkbox-label">
          <input type="checkbox" value="${t.id}" data-facet-type="propertyTypes" ${this.searchCriteria.propertyTypes.includes(t.id) ? 'checked' : ''} />
          <span>${t.label}</span>
          <span class="facet-count-tag">(${t.count})</span>
        </label>
      `).join('');
    }

    // 2. Price Ranges
    if (this.dom.facetPriceRanges && facets.priceRanges) {
      this.dom.facetPriceRanges.innerHTML = facets.priceRanges.map(pr => `
        <label class="facet-checkbox-label">
          <input type="radio" name="priceRange" value="${pr.id}" data-facet-type="priceRange" data-min="${pr.min}" data-max="${pr.max}" ${(this.searchCriteria.priceMin === pr.min && this.searchCriteria.priceMax === pr.max) ? 'checked' : ''} />
          <span>${pr.label}</span>
        </label>
      `).join('');
    }

    // 3. Guest Ratings
    if (this.dom.facetRatings && facets.ratings) {
      this.dom.facetRatings.innerHTML = facets.ratings.map(r => `
        <label class="facet-checkbox-label">
          <input type="radio" name="ratingFilter" value="${r.min}" data-facet-type="minRating" ${this.searchCriteria.minRating === r.min ? 'checked' : ''} />
          <span>${r.label}</span>
        </label>
      `).join('');
    }

    // 4. Amenities
    if (this.dom.facetAmenities && facets.amenities) {
      this.dom.facetAmenities.innerHTML = facets.amenities.map(a => `
        <label class="facet-checkbox-label">
          <input type="checkbox" value="${a.id}" data-facet-type="amenities" ${this.searchCriteria.amenities.includes(a.id) ? 'checked' : ''} />
          <span>${a.label}</span>
          <span class="facet-count-tag">(${a.count})</span>
        </label>
      `).join('');
    }

    // 5. Locations / Beaches
    if (this.dom.facetLocations && facets.microLocations) {
      this.dom.facetLocations.innerHTML = facets.microLocations.map(loc => `
        <label class="facet-checkbox-label">
          <input type="checkbox" value="${loc.name}" data-facet-type="microLocations" ${this.searchCriteria.microLocations.includes(loc.name) ? 'checked' : ''} />
          <span>${loc.name}</span>
          <span class="facet-count-tag">(${loc.count})</span>
        </label>
      `).join('');
    }

    this.bindFacetFilterEvents();
  }

  bindFacetFilterEvents() {
    // Property Type Checkboxes
    this.dom.filterSidebar?.querySelectorAll('input[data-facet-type="propertyTypes"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const val = cb.value;
        if (cb.checked) {
          if (!this.searchCriteria.propertyTypes.includes(val)) this.searchCriteria.propertyTypes.push(val);
        } else {
          this.searchCriteria.propertyTypes = this.searchCriteria.propertyTypes.filter(v => v !== val);
        }
        this.searchCriteria.page = 1;
        this.fetchAndRenderResults();
      });
    });

    // Price Radio Options
    this.dom.filterSidebar?.querySelectorAll('input[data-facet-type="priceRange"]').forEach(rb => {
      rb.addEventListener('change', () => {
        if (rb.checked) {
          this.searchCriteria.priceMin = parseInt(rb.getAttribute('data-min'), 10);
          this.searchCriteria.priceMax = parseInt(rb.getAttribute('data-max'), 10);
          this.searchCriteria.page = 1;
          this.fetchAndRenderResults();
        }
      });
    });

    // Rating Radio Options
    this.dom.filterSidebar?.querySelectorAll('input[data-facet-type="minRating"]').forEach(rb => {
      rb.addEventListener('change', () => {
        if (rb.checked) {
          this.searchCriteria.minRating = parseFloat(rb.value);
          this.searchCriteria.page = 1;
          this.fetchAndRenderResults();
        }
      });
    });

    // Amenities Checkboxes
    this.dom.filterSidebar?.querySelectorAll('input[data-facet-type="amenities"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const val = cb.value;
        if (cb.checked) {
          if (!this.searchCriteria.amenities.includes(val)) this.searchCriteria.amenities.push(val);
        } else {
          this.searchCriteria.amenities = this.searchCriteria.amenities.filter(v => v !== val);
        }
        this.searchCriteria.page = 1;
        this.fetchAndRenderResults();
      });
    });

    // MicroLocations Checkboxes
    this.dom.filterSidebar?.querySelectorAll('input[data-facet-type="microLocations"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const val = cb.value;
        if (cb.checked) {
          if (!this.searchCriteria.microLocations.includes(val)) this.searchCriteria.microLocations.push(val);
        } else {
          this.searchCriteria.microLocations = this.searchCriteria.microLocations.filter(v => v !== val);
        }
        this.searchCriteria.page = 1;
        this.fetchAndRenderResults();
      });
    });
  }

  renderActiveFilterChips() {
    if (!this.dom.activeChipsRow) return;

    const chips = [];

    // Property types
    this.searchCriteria.propertyTypes.forEach(pt => {
      chips.push({
        label: apiService.formatCategoryLabel(pt),
        onRemove: () => {
          this.searchCriteria.propertyTypes = this.searchCriteria.propertyTypes.filter(v => v !== pt);
          this.fetchAndRenderResults();
        }
      });
    });

    // Price
    if (this.searchCriteria.priceMin !== null && this.searchCriteria.priceMax !== null) {
      chips.push({
        label: `₹${this.searchCriteria.priceMin.toLocaleString('en-IN')} – ₹${this.searchCriteria.priceMax.toLocaleString('en-IN')}`,
        onRemove: () => {
          this.searchCriteria.priceMin = null;
          this.searchCriteria.priceMax = null;
          this.fetchAndRenderResults();
        }
      });
    }

    // Rating
    if (this.searchCriteria.minRating) {
      chips.push({
        label: `${this.searchCriteria.minRating}+ Rating`,
        onRemove: () => {
          this.searchCriteria.minRating = null;
          this.fetchAndRenderResults();
        }
      });
    }

    // Amenities
    this.searchCriteria.amenities.forEach(am => {
      chips.push({
        label: am,
        onRemove: () => {
          this.searchCriteria.amenities = this.searchCriteria.amenities.filter(a => a !== am);
          this.fetchAndRenderResults();
        }
      });
    });

    // MicroLocations
    this.searchCriteria.microLocations.forEach(loc => {
      chips.push({
        label: loc,
        onRemove: () => {
          this.searchCriteria.microLocations = this.searchCriteria.microLocations.filter(l => l !== loc);
          this.fetchAndRenderResults();
        }
      });
    });

    // Pet Friendly
    if (this.searchCriteria.pets) {
      chips.push({
        label: '🐾 Pet Friendly',
        onRemove: () => {
          this.searchCriteria.pets = false;
          this.updateSearchSummaryBar();
          this.fetchAndRenderResults();
        }
      });
    }

    if (chips.length === 0) {
      this.dom.activeChipsRow.innerHTML = '';
      return;
    }

    this.dom.activeChipsRow.innerHTML = chips.map((c, idx) => `
      <button class="active-filter-chip" data-chip-index="${idx}">
        <span>${c.label}</span>
        <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `).join('');

    this.dom.activeChipsRow.querySelectorAll('.active-filter-chip').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        chips[idx].onRemove();
      });
    });
  }

  clearAllFilters() {
    this.searchCriteria.priceMin = null;
    this.searchCriteria.priceMax = null;
    this.searchCriteria.propertyTypes = [];
    this.searchCriteria.minRating = null;
    this.searchCriteria.amenities = [];
    this.searchCriteria.microLocations = [];
    this.searchCriteria.pets = false;
    this.searchCriteria.page = 1;
    this.updateSearchSummaryBar();
    this.fetchAndRenderResults();
    this.showToast('Cleared all active filters.');
  }

  renderLoadMoreControls(res) {
    if (!this.dom.loadMoreContainer) return;

    if (res.hasMore) {
      this.dom.loadMoreContainer.style.display = 'flex';
      if (this.dom.showingCountText) {
        this.dom.showingCountText.textContent = `Showing ${this.currentResults.length} of ${res.totalCount} properties`;
      }
    } else {
      this.dom.loadMoreContainer.style.display = 'none';
    }
  }

  // =========================================================================
  // Wishlist Handling
  // =========================================================================

  handleWishlistToggle(stayId, btnElement) {
    const isSaved = apiService.toggleWishlist(stayId);
    if (btnElement) {
      if (isSaved) {
        btnElement.classList.add('active');
        this.showToast('Saved stay to your Wishlist!');
      } else {
        btnElement.classList.remove('active');
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

  // =========================================================================
  // Property Details & Gallery Modals
  // =========================================================================

  async openPropertyDetailsModal(stayId) {
    try {
      const stay = await apiService.fetchStayById(stayId);
      if (!stay || !this.dom.propertyModalBody) return;

      const isSaved = apiService.isWishlisted(stay.id);
      const nights = this.searchCriteria.nights || 2;
      const nightlyPrice = stay.pricePerNight.toLocaleString('en-IN');
      const taxesNightly = stay.taxesPerNight.toLocaleString('en-IN');
      const totalPrice = ((stay.pricePerNight + stay.taxesPerNight) * nights).toLocaleString('en-IN');

      this.dom.propertyModalBody.innerHTML = `
        <div class="property-modal-grid">
          <div class="property-modal-gallery">
            <img class="property-modal-main-img" src="${stay.image}" alt="${stay.title}" />
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px;">
              ${(stay.gallery || []).map(img => `
                <img src="${img}" style="width: 100%; height: 75px; object-fit: cover; border-radius: 8px; cursor: pointer;" onclick="window.konkanResults.showGalleryImage('${img}', '${stay.title}')" />
              `).join('')}
            </div>
          </div>
          <div class="property-modal-info">
            <div class="badge badge-green" style="align-self: flex-start; margin-bottom: 8px;">${stay.badge}</div>
            <h2 class="property-modal-title">${stay.title}</h2>
            <div class="property-modal-location" style="margin-bottom: 12px; color: var(--color-text-secondary);">
              <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${stay.microLocation || stay.destinationName} · ${stay.distanceInfo}</span>
            </div>
            <p style="font-size: 0.92rem; line-height: 1.6; color: var(--color-text-secondary); margin-bottom: 16px;">
              ${stay.shortDesc}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
              ${stay.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join('')}
            </div>
            <div class="property-modal-host-card">
              <div class="host-avatar-circle">
                <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div class="host-details">
                <h4>Hosted by ${stay.host.name}</h4>
                <p>${stay.host.type} · ${stay.host.responseRate}</p>
              </div>
            </div>
            <div class="property-modal-price-box">
              <div class="modal-price-label">
                <span class="modal-price-rate">₹${nightlyPrice} <small>/ night</small></span>
                <span style="font-size: 0.8rem; color: var(--color-text-secondary);">+ ₹${taxesNightly} taxes · ₹${totalPrice} total for ${nights} nights</span>
              </div>
              <button class="btn btn-primary" onclick="window.konkanResults.confirmBooking('${stay.title}', '${totalPrice}')">
                <span>Reserve Stay</span>
                <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      this.closeAllModals();
      this.dom.modalBackdrop?.classList.add('open');
      this.dom.propertyDetailsModal?.classList.add('open');
    } catch (e) {
      console.warn('Could not load property details', e);
    }
  }

  openGalleryModal(stayId) {
    const stay = STAYS_DATA.find(s => s.id === stayId);
    if (!stay) return;

    if (this.dom.galleryModalImage && this.dom.galleryModalTitle) {
      this.dom.galleryModalImage.src = stay.image;
      this.dom.galleryModalTitle.textContent = `${stay.title} — Photography Gallery`;
    }

    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.galleryModal?.classList.add('open');
  }

  showGalleryImage(imgSrc, title) {
    if (this.dom.galleryModalImage && this.dom.galleryModalTitle) {
      this.dom.galleryModalImage.src = imgSrc;
      this.dom.galleryModalTitle.textContent = `${title} — Gallery`;
      this.dom.modalBackdrop?.classList.add('open');
      this.dom.galleryModal?.classList.add('open');
    }
  }

  confirmBooking(stayTitle, totalPrice) {
    this.closeAllModals();
    this.showToast(`Booking initiated for ${stayTitle}! Total: ₹${totalPrice}`);
  }

  // =========================================================================
  // Search Modifier Drawer
  // =========================================================================

  openSearchModifierDrawer() {
    this.closeAllModals();
    const destInput = document.getElementById('modDrawerDest');
    const checkInInput = document.getElementById('modDrawerCheckIn');
    const checkOutInput = document.getElementById('modDrawerCheckOut');
    const adultsInput = document.getElementById('modDrawerAdults');
    const roomsInput = document.getElementById('modDrawerRooms');

    if (destInput) destInput.value = this.searchCriteria.destination;
    if (checkInInput) checkInInput.value = this.searchCriteria.checkIn;
    if (checkOutInput) checkOutInput.value = this.searchCriteria.checkOut;
    if (adultsInput) adultsInput.value = this.searchCriteria.adults;
    if (roomsInput) roomsInput.value = this.searchCriteria.rooms;

    this.dom.modalBackdrop?.classList.add('open');
    this.dom.searchModifierDrawer?.classList.add('open');
  }

  applyModifiedSearch() {
    const destInput = document.getElementById('modDrawerDest');
    const checkInInput = document.getElementById('modDrawerCheckIn');
    const checkOutInput = document.getElementById('modDrawerCheckOut');
    const adultsInput = document.getElementById('modDrawerAdults');
    const roomsInput = document.getElementById('modDrawerRooms');

    if (destInput) this.searchCriteria.destination = destInput.value;
    if (checkInInput) this.searchCriteria.checkIn = checkInInput.value;
    if (checkOutInput) this.searchCriteria.checkOut = checkOutInput.value;
    if (adultsInput) this.searchCriteria.adults = parseInt(adultsInput.value, 10);
    if (roomsInput) this.searchCriteria.rooms = parseInt(roomsInput.value, 10);

    // Recompute stay nights
    if (this.searchCriteria.checkIn && this.searchCriteria.checkOut) {
      const d1 = new Date(this.searchCriteria.checkIn);
      const d2 = new Date(this.searchCriteria.checkOut);
      const diff = Math.max(1, Math.round((d2 - d1) / (1000 * 3600 * 24)));
      this.searchCriteria.nights = diff;
    }

    this.closeAllModals();
    this.updateSearchSummaryBar();
    this.searchCriteria.page = 1;
    this.fetchAndRenderResults();
    this.showToast(`Updated search for ${this.searchCriteria.destination} (${this.searchCriteria.nights} nights)`);
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

  openMobileFilterSheet() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.mobileFilterSheet?.classList.add('open');
  }

  closeAllModals() {
    this.dom.modalBackdrop?.classList.remove('open');
    this.dom.propertyDetailsModal?.classList.remove('open');
    this.dom.galleryModal?.classList.remove('open');
    this.dom.searchModifierDrawer?.classList.remove('open');
    this.dom.wishlistDrawer?.classList.remove('open');
    this.dom.tripsDrawer?.classList.remove('open');
    this.dom.authModal?.classList.remove('open');
    this.dom.mobileMenuDrawer?.classList.remove('open');
    this.dom.mobileFilterSheet?.classList.remove('open');
  }

  // =========================================================================
  // Dev State Switcher (SUCCESS, LOADING, EMPTY, ERROR)
  // =========================================================================

  switchDevState(mode) {
    apiService.setMode(mode);
    this.clearStateFeedback();

    if (mode === 'LOADING') {
      this.renderLoadingSkeletons();
      this.showToast('Switched to Loading Skeleton State');
    } else if (mode === 'EMPTY') {
      this.renderNoResultsState();
      this.showToast('Switched to No Results Empty State');
    } else if (mode === 'ERROR') {
      this.renderErrorState('Simulated 500 Inventory Server Error', () => this.switchDevState('SUCCESS'));
      this.showToast('Switched to API Error State');
    } else {
      this.fetchAndRenderResults();
      this.showToast('Switched to Success Loaded State');
    }
  }

  renderLoadingSkeletons() {
    if (!this.dom.propertyResultsList) return;
    this.dom.propertyResultsList.innerHTML = `
      <div class="skeleton-horizontal-card">
        <div class="skeleton-media-box"></div>
        <div class="skeleton-content-box">
          <div class="skeleton-text" style="width:60%; height:24px;"></div>
          <div class="skeleton-text" style="width:40%;"></div>
          <div class="skeleton-text" style="width:80%;"></div>
        </div>
        <div class="skeleton-content-box" style="background:#FAFDFD;">
          <div class="skeleton-text" style="width:50%; margin-left:auto;"></div>
          <div class="skeleton-text" style="width:70%; height:32px; margin-left:auto;"></div>
        </div>
      </div>
      <div class="skeleton-horizontal-card">
        <div class="skeleton-media-box"></div>
        <div class="skeleton-content-box">
          <div class="skeleton-text" style="width:55%; height:24px;"></div>
          <div class="skeleton-text" style="width:35%;"></div>
          <div class="skeleton-text" style="width:75%;"></div>
        </div>
        <div class="skeleton-content-box" style="background:#FAFDFD;">
          <div class="skeleton-text" style="width:50%; margin-left:auto;"></div>
          <div class="skeleton-text" style="width:70%; height:32px; margin-left:auto;"></div>
        </div>
      </div>
      <div class="skeleton-horizontal-card">
        <div class="skeleton-media-box"></div>
        <div class="skeleton-content-box">
          <div class="skeleton-text" style="width:65%; height:24px;"></div>
          <div class="skeleton-text" style="width:45%;"></div>
          <div class="skeleton-text" style="width:85%;"></div>
        </div>
        <div class="skeleton-content-box" style="background:#FAFDFD;">
          <div class="skeleton-text" style="width:50%; margin-left:auto;"></div>
          <div class="skeleton-text" style="width:70%; height:32px; margin-left:auto;"></div>
        </div>
      </div>
    `;
  }

  renderNoResultsState() {
    if (this.dom.propertyResultsList) {
      this.dom.propertyResultsList.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: var(--color-white); border-radius: var(--radius-lg); border: 1px solid var(--color-border-subtle);">
          <div class="no-results-icon-bubble">
            <svg class="icon-inline" style="width:34px; height:34px;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 class="no-results-title">No stays found</h3>
          <p class="no-results-desc">
            We couldn’t find available stays in <strong>${this.searchCriteria.destination}</strong> matching your selected filters.
          </p>
          <div style="display: flex; justify-content: center; gap: 10px; margin-top: var(--space-md); flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="window.konkanResults.clearAllFilters()">
              <span>Clear All Filters</span>
            </button>
            <button class="btn btn-outline" onclick="window.konkanResults.openSearchModifierDrawer()">
              <span>Change Dates</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  renderErrorState(message, retryCallback) {
    if (this.dom.propertyResultsList) {
      this.dom.propertyResultsList.innerHTML = `
        <div class="api-error-card" style="grid-column: 1 / -1;">
          <div class="api-error-icon-bubble">
            <svg class="icon-inline" style="width:32px; height:32px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 class="api-error-title">Something went wrong</h3>
          <p class="api-error-desc">We couldn’t load stays right now. (${message})</p>
          <button class="btn btn-primary" id="retrySearchBtn">
            <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>Try Again</span>
          </button>
        </div>
      `;

      document.getElementById('retrySearchBtn')?.addEventListener('click', () => {
        this.fetchAndRenderResults();
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
  // Utilities
  // =========================================================================

  formatDateFriendly(isoStr) {
    if (!isoStr) return '--';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  formatDateISO(d) {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
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
  window.konkanResults = new KonkanResultsController();
  window.konkanResults.init();
});
