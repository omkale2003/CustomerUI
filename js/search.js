/**
 * KonkanTrip - Screen 02: Destination & Stay Search Controller
 * Handles live debounced search suggestions, category badge distinctions,
 * history management, UI state simulation (Success/Loading/Empty/Error),
 * property modals, and smooth transition to Screen 03 (Date & Guest Selection).
 */

class KonkanSearchController {
  constructor() {
    this.debounceTimer = null;
    this.currentQuery = '';
    this.focusedIndex = -1;
    this.currentSuggestions = [];
    this.selectedDestination = null;

    // Screen 03 date & guest state
    this.screen03State = {
      destination: 'Dapoli',
      checkIn: '',
      checkOut: '',
      adults: 2,
      children: 0,
      rooms: 1
    };

    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.bindEvents();
    this.initDefaultDates();
    this.checkUrlParams();

    // Load initial Screen 02 data
    await this.loadInitialData();
  }

  cacheDom() {
    // Top & Mobile Headers
    this.dom.siteHeader = document.getElementById('siteHeader');
    this.dom.mobileSearchHeader = document.getElementById('mobileSearchHeader');

    // Search Input & Suggestions
    this.dom.searchBox = document.getElementById('primarySearchBox');
    this.dom.searchInput = document.getElementById('searchMainInput');
    this.dom.clearBtn = document.getElementById('searchClearBtn');
    this.dom.spinner = document.getElementById('searchSpinner');
    this.dom.suggestionsPanel = document.getElementById('searchSuggestionsPanel');
    this.dom.suggestionsList = document.getElementById('suggestionsListContainer');
    this.dom.suggestionsHeader = document.getElementById('suggestionsHeader');

    // Sections
    this.dom.recentSearchesSection = document.getElementById('recentSearchesSection');
    this.dom.recentChipsGrid = document.getElementById('recentChipsGrid');
    this.dom.clearRecentBtn = document.getElementById('clearRecentBtn');
    this.dom.popularSection = document.getElementById('popularSection');
    this.dom.popularGrid = document.getElementById('popularDestinationsGrid');
    this.dom.regionalSection = document.getElementById('regionalSection');
    this.dom.regionalGrid = document.getElementById('regionalCardsGrid');

    // State placeholders
    this.dom.stateFeedbackArea = document.getElementById('stateFeedbackArea');

    // Screen 03 Transition Modal
    this.dom.screen03Modal = document.getElementById('screen03Modal');
    this.dom.screen03DestName = document.getElementById('screen03DestName');
    this.dom.screen03CheckIn = document.getElementById('screen03CheckIn');
    this.dom.screen03CheckOut = document.getElementById('screen03CheckOut');
    this.dom.screen03Adults = document.getElementById('screen03Adults');
    this.dom.screen03Children = document.getElementById('screen03Children');
    this.dom.screen03Rooms = document.getElementById('screen03Rooms');
    this.dom.screen03SubmitBtn = document.getElementById('screen03SubmitBtn');

    // Drawers & Modals
    this.dom.modalBackdrop = document.getElementById('modalBackdrop');
    this.dom.propertyModal = document.getElementById('propertyModal');
    this.dom.propertyModalBody = document.getElementById('propertyModalBody');
    this.dom.wishlistDrawer = document.getElementById('wishlistDrawer');
    this.dom.wishlistDrawerBody = document.getElementById('wishlistDrawerBody');
    this.dom.tripsDrawer = document.getElementById('tripsDrawer');
    this.dom.tripsDrawerBody = document.getElementById('tripsDrawerBody');
    this.dom.authModal = document.getElementById('authModal');
    this.dom.mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    this.dom.toastContainer = document.getElementById('toastContainer');
    this.dom.wishlistBadges = document.querySelectorAll('.wishlist-count-badge');
  }

  bindEvents() {
    // Search input typing with debounce
    this.dom.searchInput?.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    // Clear search button
    this.dom.clearBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearSearchInput();
    });

    // Focus input on click
    this.dom.searchInput?.addEventListener('focus', () => {
      if (this.dom.searchInput.value.trim().length > 0) {
        this.openSuggestions();
      }
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#primarySearchBox') && !e.target.closest('#searchSuggestionsPanel')) {
        this.closeSuggestions();
      }
    });

    // Keyboard navigation in suggestions
    this.dom.searchInput?.addEventListener('keydown', (e) => {
      this.handleKeyNavigation(e);
    });

    // Clear all recent searches
    this.dom.clearRecentBtn?.addEventListener('click', () => {
      this.handleClearAllRecent();
    });

    // Screen 03 Counter Controls
    document.querySelectorAll('[data-screen03-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-screen03-action');
        const target = btn.getAttribute('data-screen03-target');
        this.handleScreen03Counter(target, action);
      });
    });

    // Screen 03 CTA click
    this.dom.screen03SubmitBtn?.addEventListener('click', () => {
      this.completeScreen03Booking();
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

  initDefaultDates() {
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 3);

    this.screen03State.checkIn = checkIn.toISOString().split('T')[0];
    this.screen03State.checkOut = checkOut.toISOString().split('T')[0];

    if (this.dom.screen03CheckIn) this.dom.screen03CheckIn.value = this.screen03State.checkIn;
    if (this.dom.screen03CheckOut) this.dom.screen03CheckOut.value = this.screen03State.checkOut;
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || params.get('dest');
    const autoFocus = params.get('focus');

    if (q && this.dom.searchInput) {
      this.dom.searchInput.value = q;
      this.handleSearchInput(q);
    } else if (autoFocus || window.innerWidth <= 640) {
      // Auto-focus on mobile or if focus requested
      setTimeout(() => this.dom.searchInput?.focus(), 250);
    }
  }

  // =========================================================================
  // Data Loading & Rendering
  // =========================================================================

  async loadInitialData() {
    this.renderRecentSearches();
    await this.loadPopularDestinations();
    await this.loadRegionalDiscovery();
    this.updateWishlistCount();
  }

  renderRecentSearches() {
    const history = apiService.getSearchHistory();
    if (!history || history.length === 0) {
      if (this.dom.recentSearchesSection) {
        this.dom.recentSearchesSection.style.display = 'none';
      }
      return;
    }

    if (this.dom.recentSearchesSection) {
      this.dom.recentSearchesSection.style.display = 'block';
    }

    if (!this.dom.recentChipsGrid) return;

    this.dom.recentChipsGrid.innerHTML = history.map(item => `
      <div class="recent-chip-item" data-destination="${item.destination}" role="button" tabindex="0">
        <span class="recent-chip-icon">
          <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </span>
        <span class="recent-chip-title">${item.destination}</span>
        <button class="recent-remove-btn" data-remove-id="${item.id}" aria-label="Remove ${item.destination} from history" title="Remove">
          <svg class="icon-inline" style="width:14px; height:14px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `).join('');

    // Attach click listener for chips
    this.dom.recentChipsGrid.querySelectorAll('.recent-chip-item').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.closest('.recent-remove-btn')) return;
        const dest = chip.getAttribute('data-destination');
        if (dest) {
          this.selectDestination(dest, 'Recent Search Selection');
        }
      });
    });

    // Attach remove listener
    this.dom.recentChipsGrid.querySelectorAll('.recent-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-remove-id');
        apiService.removeSearchHistoryItem(id);
        this.renderRecentSearches();
        this.showToast('Removed from recent searches');
      });
    });
  }

  async loadPopularDestinations() {
    if (!this.dom.popularGrid) return;

    try {
      if (apiService.getMode() === 'LOADING') {
        this.renderPopularSkeletons();
        return;
      }

      const destinations = await apiService.fetchPopularDestinations();

      if (destinations.length === 0) {
        this.dom.popularGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--color-text-secondary);">
            No popular destinations available right now.
          </div>
        `;
        return;
      }

      this.dom.popularGrid.innerHTML = destinations.map(dest => `
        <article class="popular-dest-card" data-destination="${dest.name}" role="button" tabindex="0" aria-label="Explore ${dest.name}">
          <img class="popular-dest-img" src="${dest.image}" alt="${dest.name}, Konkan" loading="lazy" />
          <div class="popular-dest-gradient"></div>
          <div class="popular-dest-top-badge">
            <span class="badge badge-sand">${dest.district || 'Konkan Coast'}</span>
          </div>
          <div class="popular-dest-bottom-content">
            <h3 class="popular-dest-title">${dest.name}</h3>
            <div class="popular-dest-stays-text">
              <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${dest.staysCount || '30+'} Verified Stays</span>
            </div>
            <p class="popular-dest-tagline">${dest.vibe || dest.tagline || 'Coastal getaway'}</p>
          </div>
        </article>
      `).join('');

      // Bind card click -> opens Screen 03
      this.dom.popularGrid.querySelectorAll('.popular-dest-card').forEach(card => {
        card.addEventListener('click', () => {
          const destName = card.getAttribute('data-destination');
          if (destName) {
            this.selectDestination(destName, 'Popular Destination');
          }
        });
      });
    } catch (err) {
      this.renderApiError(err.message, () => this.loadPopularDestinations());
    }
  }

  async loadRegionalDiscovery() {
    if (!this.dom.regionalGrid) return;

    try {
      const regions = await apiService.fetchRegions();
      if (!regions || regions.length === 0) return;

      this.dom.regionalGrid.innerHTML = regions.map(reg => `
        <div class="region-card-box">
          <div class="region-media-banner">
            <img class="region-media-img" src="${reg.image}" alt="${reg.name}" loading="lazy" />
            <div class="region-media-gradient"></div>
            <div class="region-media-title-wrap">
              <span class="badge badge-sand" style="font-size:0.7rem; margin-bottom: 4px; display:inline-block;">${reg.badge}</span>
              <h4 class="region-name-text">${reg.name}</h4>
              <span class="region-district-tag">${reg.district}</span>
            </div>
          </div>
          <div class="region-body-content">
            <p class="region-desc-p">${reg.description}</p>
            <div class="region-highlights-wrap">
              ${reg.highlights.map(h => `<span class="region-tag-chip">${h}</span>`).join('')}
            </div>
            <div class="region-card-footer">
              <span class="region-stays-count">${reg.staysCount}+ Stays & Wadas</span>
              <button class="region-explore-btn" data-region-dest="${reg.destinations[0]}">
                <span>Explore Region</span>
                <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');

      this.dom.regionalGrid.querySelectorAll('.region-explore-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const dest = btn.getAttribute('data-region-dest');
          this.selectDestination(dest, 'Regional Discovery');
        });
      });
    } catch (err) {
      console.warn('Regional load error', err);
    }
  }

  // =========================================================================
  // Search Input & Suggestions Handling
  // =========================================================================

  handleSearchInput(query) {
    const q = query.trim();
    this.currentQuery = q;

    // Toggle clear button
    if (q.length > 0) {
      this.dom.clearBtn?.classList.add('visible');
    } else {
      this.dom.clearBtn?.classList.remove('visible');
      this.closeSuggestions();
      this.clearStateFeedback();
      return;
    }

    // Show loading spinner
    this.dom.spinner?.classList.add('active');

    // Debounce search
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      await this.executeFetchSuggestions(q);
    }, 180);
  }

  async executeFetchSuggestions(query) {
    try {
      const results = await apiService.fetchSearchSuggestions(query);
      this.dom.spinner?.classList.remove('active');
      this.currentSuggestions = results;
      this.focusedIndex = -1;

      if (results.length === 0) {
        this.renderNoResults(query);
        this.closeSuggestions();
        return;
      }

      this.clearStateFeedback();
      this.renderSuggestionsList(results, query);
      this.openSuggestions();
    } catch (err) {
      this.dom.spinner?.classList.remove('active');
      this.closeSuggestions();
      this.renderApiError(err.message, () => this.executeFetchSuggestions(query));
    }
  }

  renderSuggestionsList(results, query) {
    if (!this.dom.suggestionsList) return;

    if (this.dom.suggestionsHeader) {
      this.dom.suggestionsHeader.textContent = `Matching Places & Stays (${results.length})`;
    }

    const html = results.map((item, index) => {
      const highlightedName = this.highlightMatch(item.name, query);
      const highlightedLocation = this.highlightMatch(item.location, query);

      let iconHtml = '';
      let badgeClass = '';
      let badgeLabel = item.type;

      if (item.type === 'DESTINATION') {
        badgeClass = 'badge-type-destination';
        iconHtml = `
          <div class="suggestion-icon-wrap type-destination">
            <svg class="icon-inline" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
        `;
      } else if (item.type === 'PROPERTY') {
        badgeClass = 'badge-type-property';
        iconHtml = `
          <div class="suggestion-icon-wrap type-property">
            <svg class="icon-inline" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          </div>
        `;
      } else {
        badgeClass = 'badge-type-location';
        iconHtml = `
          <div class="suggestion-icon-wrap type-location">
            <svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
          </div>
        `;
      }

      return `
        <div class="suggestion-item-row" data-index="${index}" role="option" aria-selected="false">
          <div class="suggestion-item-left">
            ${iconHtml}
            <div class="suggestion-content-block">
              <div class="suggestion-title-line">
                <span class="suggestion-title-text">${highlightedName}</span>
                <span class="suggestion-badge-type ${badgeClass}">${badgeLabel}</span>
              </div>
              <span class="suggestion-subtitle-text">${highlightedLocation}</span>
            </div>
          </div>
          <div class="suggestion-meta-right">
            ${item.badge ? `<span class="suggestion-stays-pill">${item.badge}</span>` : ''}
            <svg class="icon-inline icon-sm suggestion-arrow-icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      `;
    }).join('');

    this.dom.suggestionsList.innerHTML = html;

    // Attach click event for each suggestion item
    this.dom.suggestionsList.querySelectorAll('.suggestion-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const index = parseInt(row.getAttribute('data-index'), 10);
        this.selectSuggestionItem(this.currentSuggestions[index]);
      });
    });
  }

  highlightMatch(text, query) {
    if (!text || !query) return text || '';
    const safeQ = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(${safeQ})`, 'gi');
    return text.replace(regex, '<mark class="suggestion-highlight">$1</mark>');
  }

  selectSuggestionItem(item) {
    if (!item) return;

    if (item.type === 'DESTINATION') {
      // Add to search history & proceed to Screen 03
      apiService.addSearchHistory(item);
      this.renderRecentSearches();
      this.selectDestination(item.destination || item.name, 'Destination Selected');
    } else if (item.type === 'PROPERTY') {
      // Open Property details modal while preserving search state
      this.openPropertyModal(item.stayId || 'stay-01');
    } else if (item.type === 'LOCATION') {
      // Add to search history & proceed to Screen 03 with destination filter
      apiService.addSearchHistory(item);
      this.renderRecentSearches();
      this.selectDestination(item.destination, `Location: ${item.name}`);
    }

    this.closeSuggestions();
  }

  selectDestination(destName, contextLabel = '') {
    this.selectedDestination = destName;
    this.screen03State.destination = destName;

    // Save to active destination storage for Screen 03
    apiService.setSelectedDestination({ name: destName, district: 'Maharashtra Coast' });

    this.showToast(`Selected ${destName} · Opening Screen 03 Date & Guest Selection...`);

    // Smooth direct navigation to Screen 03 (dates.html)
    setTimeout(() => {
      window.location.href = `dates.html?dest=${encodeURIComponent(destName)}`;
    }, 380);
  }

  openSuggestions() {
    this.dom.suggestionsPanel?.classList.add('open');
    this.dom.searchBox?.classList.add('has-suggestions');
  }

  closeSuggestions() {
    this.dom.suggestionsPanel?.classList.remove('open');
    this.dom.searchBox?.classList.remove('has-suggestions');
    this.focusedIndex = -1;
  }

  clearSearchInput() {
    if (this.dom.searchInput) {
      this.dom.searchInput.value = '';
      this.dom.searchInput.focus();
    }
    this.dom.clearBtn?.classList.remove('visible');
    this.closeSuggestions();
    this.clearStateFeedback();
    this.currentQuery = '';
  }

  handleKeyNavigation(e) {
    if (!this.dom.suggestionsPanel?.classList.contains('open')) return;
    const items = this.dom.suggestionsList?.querySelectorAll('.suggestion-item-row');
    if (!items || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.focusedIndex = (this.focusedIndex + 1) % items.length;
      this.updateKeyboardFocus(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.focusedIndex = (this.focusedIndex - 1 + items.length) % items.length;
      this.updateKeyboardFocus(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.focusedIndex >= 0 && this.focusedIndex < this.currentSuggestions.length) {
        this.selectSuggestionItem(this.currentSuggestions[this.focusedIndex]);
      } else if (this.currentSuggestions.length > 0) {
        this.selectSuggestionItem(this.currentSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      this.closeSuggestions();
    }
  }

  updateKeyboardFocus(items) {
    items.forEach((item, idx) => {
      if (idx === this.focusedIndex) {
        item.classList.add('focused');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('focused');
      }
    });
  }

  handleClearAllRecent() {
    apiService.clearSearchHistory();
    this.renderRecentSearches();
    this.showToast('Search history cleared');
  }

  // =========================================================================
  // State Renderers (Loading Skeletons, Empty State, Error State)
  // =========================================================================

  renderPopularSkeletons() {
    if (!this.dom.popularGrid) return;
    this.dom.popularGrid.innerHTML = Array(6).fill(0).map(() => `
      <div class="skeleton-card"></div>
    `).join('');
  }

  renderSuggestionsSkeletons() {
    if (!this.dom.suggestionsList) return;
    this.dom.suggestionsList.innerHTML = Array(4).fill(0).map(() => `
      <div class="skeleton-row-box">
        <div class="skeleton-square"></div>
        <div class="skeleton-text-lines">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `).join('');
    this.openSuggestions();
  }

  renderNoResults(query) {
    if (!this.dom.stateFeedbackArea) return;
    this.dom.stateFeedbackArea.innerHTML = `
      <div class="no-results-card">
        <div class="no-results-icon-bubble">
          <svg class="icon-inline" style="width:36px; height:36px;" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <h3 class="no-results-title">No places found</h3>
        <p class="no-results-desc">
          We couldn’t find a destination, property or location matching "<strong>${query}</strong>".
        </p>
        <button class="btn btn-primary" onclick="window.konkanSearch.clearSearchInput()">
          <span>Explore Popular Destinations</span>
          <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    `;
  }

  renderApiError(message, retryCallback) {
    if (!this.dom.stateFeedbackArea) return;
    this.dom.stateFeedbackArea.innerHTML = `
      <div class="api-error-card">
        <div class="api-error-icon-bubble">
          <svg class="icon-inline" style="width:32px; height:32px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 class="api-error-title">Something went wrong.</h3>
        <p class="api-error-desc">We couldn’t load destinations right now. (${message})</p>
        <button class="btn btn-primary" id="retryApiBtn">
          <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span>Try Again</span>
        </button>
      </div>
    `;

    document.getElementById('retryApiBtn')?.addEventListener('click', () => {
      this.clearStateFeedback();
      if (typeof retryCallback === 'function') retryCallback();
    });
  }

  clearStateFeedback() {
    if (this.dom.stateFeedbackArea) {
      this.dom.stateFeedbackArea.innerHTML = '';
    }
  }

  switchDevState(mode) {
    apiService.setMode(mode);
    this.clearStateFeedback();

    if (mode === 'LOADING') {
      this.renderPopularSkeletons();
      this.renderSuggestionsSkeletons();
      this.showToast('Switched to Loading Skeleton State');
    } else if (mode === 'EMPTY') {
      this.renderNoResults(this.dom.searchInput?.value || 'Sample Query');
      this.showToast('Switched to Empty Results State');
    } else if (mode === 'ERROR') {
      this.renderApiError('Simulated Network Error', () => this.switchDevState('SUCCESS'));
      this.showToast('Switched to API Error State');
    } else {
      this.closeSuggestions();
      this.loadInitialData();
      this.showToast('Switched to Success State');
    }
  }

  // =========================================================================
  // Screen 03 Modal (Date & Guest Selection Transition)
  // =========================================================================

  openScreen03Modal() {
    this.closeAllModals();
    this.dom.modalBackdrop?.classList.add('open');
    this.dom.screen03Modal?.classList.add('open');
  }

  handleScreen03Counter(target, action) {
    if (target === 'adults') {
      if (action === 'inc') this.screen03State.adults = Math.min(10, this.screen03State.adults + 1);
      if (action === 'dec') this.screen03State.adults = Math.max(1, this.screen03State.adults - 1);
      if (this.dom.screen03Adults) this.dom.screen03Adults.textContent = this.screen03State.adults;
    } else if (target === 'children') {
      if (action === 'inc') this.screen03State.children = Math.min(6, this.screen03State.children + 1);
      if (action === 'dec') this.screen03State.children = Math.max(0, this.screen03State.children - 1);
      if (this.dom.screen03Children) this.dom.screen03Children.textContent = this.screen03State.children;
    } else if (target === 'rooms') {
      if (action === 'inc') this.screen03State.rooms = Math.min(5, this.screen03State.rooms + 1);
      if (action === 'dec') this.screen03State.rooms = Math.max(1, this.screen03State.rooms - 1);
      if (this.dom.screen03Rooms) this.dom.screen03Rooms.textContent = this.screen03State.rooms;
    }
  }

  completeScreen03Booking() {
    const dest = this.selectedDestination || 'Dapoli';
    const checkIn = this.dom.screen03CheckIn?.value || this.screen03State.checkIn;
    const checkOut = this.dom.screen03CheckOut?.value || this.screen03State.checkOut;
    const totalGuests = this.screen03State.adults + this.screen03State.children;
    const rooms = this.screen03State.rooms;

    this.closeAllModals();
    this.showToast(`Navigating to ${dest} Stays (${checkIn} to ${checkOut})`);

    // In full multi-screen flow, navigate back to index.html with query filters or Screen 04
    setTimeout(() => {
      window.location.href = `index.html?dest=${encodeURIComponent(dest)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${totalGuests}&rooms=${rooms}#featuredStaysSection`;
    }, 450);
  }

  // =========================================================================
  // Property Quick View Modal
  // =========================================================================

  async openPropertyModal(stayId) {
    try {
      const stay = await apiService.fetchStayById(stayId);
      if (!stay || !this.dom.propertyModalBody) return;

      const isSaved = apiService.isWishlisted(stay.id);

      this.dom.propertyModalBody.innerHTML = `
        <div class="property-modal-grid">
          <div class="property-modal-gallery">
            <img class="property-modal-main-img" src="${stay.image}" alt="${stay.title}" />
          </div>
          <div class="property-modal-info">
            <div class="badge badge-green" style="align-self: flex-start; margin-bottom: 8px;">${stay.badge}</div>
            <h2 class="property-modal-title">${stay.title}</h2>
            <div class="property-modal-location" style="margin-bottom: 12px; color: var(--color-text-secondary);">
              <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${stay.destinationName} · ${stay.distanceInfo}</span>
            </div>
            <p style="font-size: 0.92rem; line-height: 1.6; color: var(--color-text-secondary); margin-bottom: 16px;">
              ${stay.shortDesc}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
              ${stay.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join('')}
            </div>
            <div style="padding-top: 16px; border-top: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="font-size: 0.8rem; color: var(--color-text-secondary);">Price per night</span>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary);">₹${stay.pricePerNight.toLocaleString('en-IN')}</div>
              </div>
              <button class="btn btn-primary" onclick="window.konkanSearch.selectDestination('${stay.destinationName.split(',')[0]}', 'Book Property')">
                <span>Reserve Stay</span>
                <svg class="icon-inline icon-sm" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      this.closeAllModals();
      this.dom.modalBackdrop?.classList.add('open');
      this.dom.propertyModal?.classList.add('open');
    } catch (e) {
      this.showToast('Could not load property details');
    }
  }

  // =========================================================================
  // Drawers & Modals Support
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
    this.dom.screen03Modal?.classList.remove('open');
    this.dom.propertyModal?.classList.remove('open');
    this.dom.wishlistDrawer?.classList.remove('open');
    this.dom.tripsDrawer?.classList.remove('open');
    this.dom.authModal?.classList.remove('open');
    this.dom.mobileMenuDrawer?.classList.remove('open');
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
  window.konkanSearch = new KonkanSearchController();
  window.konkanSearch.init();
});
