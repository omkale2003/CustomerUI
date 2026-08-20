/**
 * KonkanTrip - API Service & Data Layer
 * Handles async data fetching, filtering, state simulation (SUCCESS, LOADING, EMPTY, ERROR),
 * and local persistent storage for Wishlist and Booked Trips.
 */

class KonkanApiService {
  constructor() {
    this.currentMode = 'SUCCESS'; // 'SUCCESS' | 'LOADING' | 'EMPTY' | 'ERROR'
    this.wishlistStorageKey = 'konkan_trip_wishlist_v1';
    this.tripsStorageKey = 'konkan_trip_booked_trips_v1';
    this.networkLatencyMs = 350;
  }

  // Dev state mode switcher for interactive demonstrations
  setMode(mode) {
    this.currentMode = mode;
  }

  getMode() {
    return this.currentMode;
  }

  // Generic delay simulation
  async simulateNetwork() {
    if (this.currentMode === 'LOADING') {
      // In perpetual loading mode, return a promise that never resolves during this state
      return new Promise(() => {});
    }
    return new Promise((resolve) => setTimeout(resolve, this.networkLatencyMs));
  }

  /**
   * Fetch Featured Coastal Destinations
   */
  async fetchDestinations() {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Unable to load popular destinations. Please check your connection.');
    }

    if (this.currentMode === 'EMPTY') {
      return [];
    }

    return [...DESTINATIONS_DATA];
  }

  /**
   * Fetch Stays with optional category or search filters
   */
  async fetchStays(filter = {}) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Unable to load stays. Please try again.');
    }

    if (this.currentMode === 'EMPTY') {
      return [];
    }

    let results = [...STAYS_DATA];

    // Filter by Category
    if (filter.category && filter.category !== 'all') {
      results = results.filter(item => item.category === filter.category);
    }

    // Filter by Destination / Query
    if (filter.destinationQuery) {
      const q = filter.destinationQuery.toLowerCase().trim();
      results = results.filter(item => 
        item.destinationName.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.distanceInfo.toLowerCase().includes(q)
      );
    }

    // Filter by Guest capacity
    if (filter.guests && filter.guests > 1) {
      // In backend would check room capacity, for now return available inventory
      results = results.filter(item => item.pricePerNight > 0);
    }

    return results;
  }

  /**
   * Fetch Single Stay Details by ID
   */
  async fetchStayById(stayId) {
    await this.simulateNetwork();
    const stay = STAYS_DATA.find(s => s.id === stayId);
    if (!stay) {
      throw new Error('Property not found');
    }
    return { ...stay };
  }

  /**
   * Fetch Local Konkan Experiences
   */
  async fetchExperiences() {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Unable to load coastal experiences.');
    }

    if (this.currentMode === 'EMPTY') {
      return [];
    }

    return [...EXPERIENCES_DATA];
  }

  /**
   * Fetch Categories
   */
  async fetchCategories() {
    await this.simulateNetwork();
    return [...CATEGORIES_DATA];
  }

  /**
   * Wishlist Management (LocalStorage backed)
   */
  getWishlist() {
    try {
      const stored = localStorage.getItem(this.wishlistStorageKey);
      return stored ? JSON.parse(stored) : ['stay-01', 'stay-03'];
    } catch (e) {
      return ['stay-01', 'stay-03'];
    }
  }

  isWishlisted(stayId) {
    const list = this.getWishlist();
    return list.includes(stayId);
  }

  toggleWishlist(stayId) {
    let list = this.getWishlist();
    const index = list.indexOf(stayId);
    let added = false;
    if (index > -1) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(stayId);
      added = true;
    }
    try {
      localStorage.setItem(this.wishlistStorageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage failed', e);
    }
    return { added, list, count: list.length };
  }

  /**
   * My Trips & Booking Management (LocalStorage backed)
   */
  getMyTrips() {
    try {
      const stored = localStorage.getItem(this.tripsStorageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Default sample past/upcoming trip
    const defaultTrips = [
      {
        id: 'TRIP-KT-8291',
        stayId: 'stay-01',
        stayTitle: 'The Blue Lagoon Beachfront Villa',
        destinationName: 'Tarkarli, Sindhudurg',
        checkIn: '2026-09-12',
        checkOut: '2026-09-15',
        guests: '2 Adults, 1 Room',
        totalPrice: 19200,
        status: 'Confirmed',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
      }
    ];
    return defaultTrips;
  }

  addBooking(bookingData) {
    const trips = this.getMyTrips();
    const newTrip = {
      id: `TRIP-KT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    trips.unshift(newTrip);
    try {
      localStorage.setItem(this.tripsStorageKey, JSON.stringify(trips));
    } catch (e) {}
    return newTrip;
  }

  // =========================================================================
  // Screen 02 — Search & Discovery API Methods
  // =========================================================================

  /**
   * GET /customer/search/suggestions?q={query}
   * Fetches dynamic typeahead suggestions matching query for destinations, properties, and locations.
   */
  async fetchSearchSuggestions(query = '') {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('We couldn’t fetch search suggestions. Please check your connection or try again.');
    }

    if (this.currentMode === 'EMPTY') {
      return [];
    }

    const cleanQ = (query || '').toLowerCase().trim();
    if (!cleanQ) {
      return [];
    }

    // Filter suggestions matching query across name, location, destination, or tags
    const matched = SEARCH_SUGGESTIONS_DATA.filter(item => {
      const matchName = item.name.toLowerCase().includes(cleanQ);
      const matchLoc = item.location.toLowerCase().includes(cleanQ);
      const matchDest = item.destination.toLowerCase().includes(cleanQ);
      const matchType = item.type.toLowerCase().includes(cleanQ);
      const matchTags = item.tags && item.tags.some(tag => tag.toLowerCase().includes(cleanQ));
      return matchName || matchLoc || matchDest || matchType || matchTags;
    });

    return matched;
  }

  /**
   * GET /customer/destinations/popular
   * Fetches curated popular Konkan destinations for Screen 02 discovery.
   */
  async fetchPopularDestinations() {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('We couldn’t load destinations right now.');
    }

    if (this.currentMode === 'EMPTY') {
      return [];
    }

    return [...DESTINATIONS_DATA];
  }

  /**
   * GET /customer/regions
   * Fetches North, Central, and South Konkan regional discovery cards.
   */
  async fetchRegions() {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('We couldn’t load regional discovery.');
    }

    if (this.currentMode === 'EMPTY') {
      return [];
    }

    return [...REGIONS_DATA];
  }

  /**
   * GET /customer/search-history
   * Retrieves recent search history from persistent storage.
   */
  getSearchHistory() {
    try {
      const stored = localStorage.getItem('konkan_trip_search_history_v1');
      if (stored) {
        return JSON.parse(stored);
      }
      return [...INITIAL_SEARCH_HISTORY];
    } catch (e) {
      return [...INITIAL_SEARCH_HISTORY];
    }
  }

  /**
   * Saves a destination/query to search history.
   */
  addSearchHistory(searchItem) {
    let history = this.getSearchHistory();
    // Prevent duplicate entries
    history = history.filter(item => 
      item.destination?.toLowerCase() !== searchItem.destination?.toLowerCase() &&
      item.id !== searchItem.id
    );

    const newItem = {
      id: `hist-${Date.now()}`,
      destination: searchItem.destination || searchItem.name,
      location: searchItem.location || `${searchItem.destination || searchItem.name}, Konkan`,
      type: searchItem.type || 'DESTINATION',
      timestamp: 'Just now'
    };

    history.unshift(newItem);
    // Keep maximum 6 recent items
    history = history.slice(0, 6);

    try {
      localStorage.setItem('konkan_trip_search_history_v1', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save search history', e);
    }

    return history;
  }

  /**
   * DELETE /customer/search-history?id={id}
   * Removes a single search history record.
   */
  removeSearchHistoryItem(id) {
    let history = this.getSearchHistory();
    history = history.filter(item => item.id !== id);
    try {
      localStorage.setItem('konkan_trip_search_history_v1', JSON.stringify(history));
    } catch (e) {}
    return history;
  }

  /**
   * DELETE /customer/search-history
   * Clears all search history.
   */
  clearSearchHistory() {
    try {
      localStorage.setItem('konkan_trip_search_history_v1', JSON.stringify([]));
    } catch (e) {}
    return [];
  }

  // =========================================================================
  // Screen 03 — Date & Guest Selection API Methods
  // =========================================================================

  /**
   * GET /customer/destinations/details?q={destination}
   * Retrieves destination metadata, rule constraints, and display name.
   */
  async fetchDestinationDetails(query = 'Dapoli') {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Could not load destination details.');
    }

    const key = (query || 'dapoli').toLowerCase().split(',')[0].split('&')[0].trim();
    const rules = DESTINATION_AVAILABILITY_RULES[key] || DESTINATION_AVAILABILITY_RULES['dapoli'];
    return { ...rules };
  }

  /**
   * GET /customer/stays/availability?destinationId={id}&month={YYYY-MM}&adults={n}&children={n}&rooms={n}
   * Returns backend availability, minimum stay rules, and seasonal pricing hints.
   */
  async fetchAvailability(destination = 'Dapoli', month = '', adults = 2, children = 0, rooms = 1) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Unable to connect to property inventory system. Please try again.');
    }

    if (this.currentMode === 'EMPTY' || this.currentMode === 'NO_AVAILABILITY') {
      return {
        available: false,
        availableDates: [],
        minimumStay: 2,
        maximumStay: 14,
        availableRooms: 0,
        seasonalNotice: 'No properties available for these specific dates. Try alternative weekend dates below.',
        alternativeDates: [
          { label: 'Next Weekend (Fri–Sun)', dates: 'Next Fri – Sun' },
          { label: 'Following Weekend', dates: 'In 2 weeks' },
          { label: 'Midweek Special (-20%)', dates: 'Tue – Thu' }
        ]
      };
    }

    const key = (destination || 'dapoli').toLowerCase().split(',')[0].split('&')[0].trim();
    const rules = DESTINATION_AVAILABILITY_RULES[key] || DESTINATION_AVAILABILITY_RULES['dapoli'];

    return {
      available: true,
      destinationName: rules.name,
      district: rules.district,
      minimumStay: rules.minimumStay,
      maximumStay: rules.maximumStay,
      availableRooms: rules.availableRoomsEstimate,
      seasonalNotice: rules.seasonalNotice,
      pricingRange: rules.pricingRange,
      maxGuestsPerRoom: rules.maxGuestsPerRoom,
      inventoryStatus: 'LIVE_CONFIRMED'
    };
  }

  /**
   * Local storage sync for active selected destination across Screen 02 -> Screen 03
   */
  getSelectedDestination() {
    try {
      const stored = localStorage.getItem('konkan_trip_selected_dest_v1');
      return stored ? JSON.parse(stored) : { name: 'Dapoli', district: 'Ratnagiri District' };
    } catch (e) {
      return { name: 'Dapoli', district: 'Ratnagiri District' };
    }
  }

  setSelectedDestination(dest) {
    try {
      localStorage.setItem('konkan_trip_selected_dest_v1', JSON.stringify(dest));
    } catch (e) {}
  }

  // =========================================================================
  // Screen 04 — Search Results & Stay Discovery API Methods
  // =========================================================================

  /**
   * GET /customer/stays/search
   * Real backend search query endpoint supporting destination, dates, guests,
   * price range, property types, rating, amenities, micro-locations, sorting, and pagination.
   */
  async searchStays(criteria = {}) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('We couldn’t load stays right now. Please check your connection.');
    }

    if (this.currentMode === 'EMPTY') {
      return {
        properties: [],
        totalCount: 0,
        page: criteria.page || 1,
        totalPages: 0,
        facets: this.buildEmptyFacets(),
        destinationInfo: { name: criteria.destination || 'Konkan' },
        stayDurationNights: criteria.nights || 2
      };
    }

    let results = [...STAYS_DATA];

    // 1. Destination Matching (e.g. "Dapoli", "Tarkarli", "Malvan", "Ganpatipule", "Alibaug", "Ratnagiri")
    const destKey = (criteria.destination || '').toLowerCase().trim();
    if (destKey && destKey !== 'all' && destKey !== 'konkan') {
      results = results.filter(stay => 
        stay.destinationName.toLowerCase().includes(destKey) ||
        stay.destinationId.toLowerCase().includes(destKey) ||
        stay.microLocation?.toLowerCase().includes(destKey)
      );
    }

    // 2. Price Range Filter
    if (criteria.priceMin !== undefined && criteria.priceMin !== null) {
      results = results.filter(stay => stay.pricePerNight >= criteria.priceMin);
    }
    if (criteria.priceMax !== undefined && criteria.priceMax !== null && criteria.priceMax > 0) {
      results = results.filter(stay => stay.pricePerNight <= criteria.priceMax);
    }

    // 3. Property Types Filter (villas, wada, cliffside, eco, farm)
    if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
      results = results.filter(stay => criteria.propertyTypes.includes(stay.category));
    }

    // 4. Guest Rating Filter (4.8, 4.5, 4.0)
    if (criteria.minRating && criteria.minRating > 0) {
      results = results.filter(stay => stay.rating >= criteria.minRating);
    }

    // 5. Amenities Filter
    if (criteria.amenities && criteria.amenities.length > 0) {
      results = results.filter(stay => 
        criteria.amenities.every(amenity => 
          stay.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // 5b. Pet Friendly Filter
    if (criteria.pets) {
      results = results.filter(stay => 
        (stay.houseRules?.pets && !stay.houseRules.pets.toLowerCase().includes('not allowed') && !stay.houseRules.pets.toLowerCase().includes('no pets')) ||
        (stay.amenities && stay.amenities.some(a => a.toLowerCase().includes('pet')))
      );
    }

    // 6. Micro-location / Beach Filter
    if (criteria.microLocations && criteria.microLocations.length > 0) {
      results = results.filter(stay => 
        criteria.microLocations.includes(stay.microLocation)
      );
    }

    // 7. Traveller Type Filter
    if (criteria.travellerTypes && criteria.travellerTypes.length > 0) {
      results = results.filter(stay => 
        stay.travellerTypes && criteria.travellerTypes.some(t => stay.travellerTypes.includes(t))
      );
    }

    // 8. Sorting
    const sort = criteria.sort || 'recommended';
    if (sort === 'price_low') {
      results.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sort === 'price_high') {
      results.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'reviews') {
      results.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (sort === 'distance') {
      results.sort((a, b) => (parseFloat(a.distanceFromDestination) || 0) - (parseFloat(b.distanceFromDestination) || 0));
    } else {
      // Recommended default: highest rating + verified badge first
      results.sort((a, b) => (b.badge.includes('Verified') ? 1 : 0) - (a.badge.includes('Verified') ? 1 : 0) || b.rating - a.rating);
    }

    // Calculate stay duration nights and total pricing
    const nights = Math.max(1, parseInt(criteria.nights, 10) || 2);
    results = results.map(stay => ({
      ...stay,
      stayNights: nights,
      totalTaxes: stay.taxesPerNight * nights,
      totalPrice: (stay.pricePerNight + stay.taxesPerNight) * nights
    }));

    const totalCount = results.length;
    const page = parseInt(criteria.page, 10) || 1;
    const limit = parseInt(criteria.limit, 10) || 6;
    const paginated = results.slice(0, page * limit);
    const totalPages = Math.ceil(totalCount / limit);

    // Build dynamic filter facets for the current search context
    const facets = this.buildFacets(STAYS_DATA, destKey);

    return {
      properties: paginated,
      totalCount,
      page,
      limit,
      totalPages,
      hasMore: paginated.length < totalCount,
      facets,
      destinationInfo: {
        name: criteria.destination || 'Dapoli',
        district: 'Ratnagiri District',
        count: totalCount
      },
      stayDurationNights: nights
    };
  }

  /**
   * Builds dynamic filter facets from backend inventory
   */
  buildFacets(allStays, destKey) {
    const relevant = destKey ? allStays.filter(s => s.destinationName.toLowerCase().includes(destKey)) : allStays;
    const dataSet = relevant.length > 0 ? relevant : allStays;

    const propertyTypesMap = {};
    const microLocationsMap = {};
    const amenitiesMap = {};

    dataSet.forEach(stay => {
      // Categories
      propertyTypesMap[stay.category] = (propertyTypesMap[stay.category] || 0) + 1;
      // Locations
      if (stay.microLocation) {
        microLocationsMap[stay.microLocation] = (microLocationsMap[stay.microLocation] || 0) + 1;
      }
      // Amenities
      stay.amenities.forEach(a => {
        amenitiesMap[a] = (amenitiesMap[a] || 0) + 1;
      });
    });

    return {
      propertyTypes: Object.keys(propertyTypesMap).map(k => ({
        id: k,
        label: this.formatCategoryLabel(k),
        count: propertyTypesMap[k]
      })),
      microLocations: Object.keys(microLocationsMap).map(loc => ({
        name: loc,
        count: microLocationsMap[loc]
      })),
      amenities: [
        { id: 'Direct Beach Access', label: 'Direct Beach Access', count: amenitiesMap['Direct Beach Access'] || 5 },
        { id: 'Fresh Malvani Thali Meals', label: 'Malvani Meals Included', count: amenitiesMap['Fresh Malvani Thali Meals'] || 4 },
        { id: 'Private Heated Pool', label: 'Private Swimming Pool', count: amenitiesMap['Private Heated Pool'] || 2 },
        { id: 'AC', label: 'Air Conditioning', count: amenitiesMap['AC'] || 9 },
        { id: 'High-Speed Wi-Fi', label: 'High-Speed Wi-Fi', count: 8 },
        { id: 'Pet Friendly', label: 'Pet Friendly', count: 3 }
      ],
      priceRanges: [
        { id: 'under_3000', label: 'Under ₹3,500 / night', min: 0, max: 3500 },
        { id: '3500_6500', label: '₹3,500 – ₹6,500 / night', min: 3500, max: 6500 },
        { id: '6500_10000', label: '₹6,500 – ₹10,000 / night', min: 6500, max: 10000 },
        { id: 'above_10000', label: 'Above ₹10,000 / night', min: 10000, max: 50000 }
      ],
      ratings: [
        { min: 4.8, label: '4.8+ Exceptional' },
        { min: 4.5, label: '4.5+ Excellent' },
        { min: 4.0, label: '4.0+ Very Good' }
      ]
    };
  }

  buildEmptyFacets() {
    return {
      propertyTypes: [],
      microLocations: [],
      amenities: [],
      priceRanges: [],
      ratings: []
    };
  }

  formatCategoryLabel(cat) {
    const labels = {
      'villas': 'Beachfront Villas',
      'wada': 'Heritage Wadas',
      'cliffside': 'Cliffside Ocean Resorts',
      'eco': 'Eco Cottages & Chalets'
    };
    return labels[cat] || cat;
  }

  // =========================================================================
  // Screen 05 — Property Details & Room Selection API Methods
  // =========================================================================

  /**
   * GET /customer/properties/{propertyId}
   * Retrieves full property metadata, room types, live inventory, house rules, and verified reviews.
   */
  async fetchPropertyDetails(propertyId = 'stay-03') {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('We couldn’t load this property right now. Please check your internet connection.');
    }

    if (this.currentMode === 'EMPTY' || this.currentMode === 'UNAVAILABLE') {
      return null;
    }

    const cleanId = (propertyId || '').trim();
    const property = STAYS_DATA.find(s => s.id === cleanId || s.propertyId === cleanId || s.slug === cleanId) || STAYS_DATA[1];

    if (!property) return null;

    return {
      ...property,
      status: 'AVAILABLE',
      currency: 'INR',
      currencySymbol: '₹'
    };
  }

  /**
   * POST /customer/bookings/validate-room
   * Validates room capacity, availability inventory, dates, and calculated pricing
   * before proceeding to Screen 06 (Guest Details).
   */
  async validateRoomBooking({ propertyId, roomId, checkIn, checkOut, guests, rooms = 1 }) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      return { valid: false, message: 'Server validation error. Please try again.' };
    }

    const property = await this.fetchPropertyDetails(propertyId);
    if (!property) {
      return { valid: false, message: 'Property is no longer available for booking.' };
    }

    const selectedRoom = property.roomTypes?.find(r => r.roomId === roomId) || property.roomTypes?.[0];
    if (!selectedRoom) {
      return { valid: false, message: 'Selected room category is not found.' };
    }

    if (selectedRoom.availability < rooms) {
      return {
        valid: false,
        message: `Only ${selectedRoom.availability} room(s) available for selected dates.`
      };
    }

    const d1 = new Date(checkIn || '2026-08-24');
    const d2 = new Date(checkOut || '2026-08-26');
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 3600 * 24)));

    const basePrice = selectedRoom.pricePerNight * nights * rooms;
    const taxes = selectedRoom.taxesPerNight * nights * rooms;
    const discount = Math.round(basePrice * 0.10); // 10% seasonal discount
    const totalAmount = basePrice - discount + taxes;

    return {
      valid: true,
      propertyId: property.id,
      propertyTitle: property.title,
      destinationName: property.destinationName,
      roomId: selectedRoom.roomId,
      roomName: selectedRoom.name,
      roomImage: selectedRoom.image,
      nights,
      rooms,
      guests,
      checkIn,
      checkOut,
      basePrice,
      discount,
      taxes,
      totalAmount,
      currency: '₹',
      cancellationPolicy: selectedRoom.cancellationPolicy
    };
  }

  // =========================================================================
  // Screen 06 — Guest Details & Booking Form API Methods
  // =========================================================================

  /**
   * GET /customer/profile
   * Retrieves logged-in customer profile information for automatic form prefill.
   */
  async fetchCustomerProfile() {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      return null;
    }

    try {
      const stored = localStorage.getItem('konkan_trip_user_profile_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return { ...CUSTOMER_PROFILE_MOCK };
  }

  /**
   * POST /customer/bookings/validate
   * Performs deep checkout validation on guest details, inventory lock,
   * price stability, terms acceptance, and returns a verified booking session token.
   */
  async validateBookingForm(payload = {}) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Connection lost to booking verification system. Please try again.');
    }

    if (this.currentMode === 'PRICE_CHANGED_ALERT') {
      return {
        valid: false,
        priceChanged: true,
        previousTotal: payload.totalAmount || 14515,
        updatedTotal: (payload.totalAmount || 14515) + 300,
        currency: '₹',
        message: 'Seasonal villa tariffs updated due to weekend pricing adjustment.'
      };
    }

    // Validate Required Guest Fields
    if (!payload.firstName || payload.firstName.trim().length < 2) {
      return { valid: false, message: 'Please enter your first name.' };
    }
    if (!payload.lastName || payload.lastName.trim().length < 1) {
      return { valid: false, message: 'Please enter your last name.' };
    }
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    if (!payload.phone || payload.phone.replace(/\D/g, '').length < 10) {
      return { valid: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!payload.termsAccepted) {
      return { valid: false, message: 'Please accept the booking terms to continue.' };
    }

    const bookingId = `KT-BK-${Date.now().toString().slice(-6)}`;
    const sessionExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-min inventory hold

    return {
      valid: true,
      bookingId,
      sessionExpiry,
      propertyId: payload.propertyId,
      roomId: payload.roomId,
      mainGuest: {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim()
      },
      otherGuests: payload.otherGuests || [],
      specialRequests: payload.specialRequests || '',
      arrivalTime: payload.arrivalTime || 'Flexible',
      gstInvoice: payload.gstInvoice || null,
      pricing: {
        basePrice: payload.basePrice,
        discount: payload.discount,
        taxes: payload.taxes,
        totalAmount: payload.totalAmount,
        currency: '₹'
      }
    };
  }

  // =========================================================================
  // Screen 07 — Review Booking & Session Verification API Methods
  // =========================================================================

  /**
   * GET /customer/bookings/session/{sessionId}
   * Retrieves active booking session metadata, property, room, pricing, and hold expiry.
   */
  async fetchBookingSession(sessionId = 'KT-BK-980123') {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Unable to connect to reservation session server.');
    }

    if (this.currentMode === 'EXPIRED') {
      return {
        status: 'EXPIRED',
        message: 'Your 15-minute booking hold session has expired.'
      };
    }

    if (this.currentMode === 'ROOM_UNAVAILABLE') {
      return {
        status: 'ROOM_UNAVAILABLE',
        message: 'This room is no longer available for your selected dates.'
      };
    }

    if (this.currentMode === 'PRICE_CHANGED') {
      return {
        status: 'PRICE_CHANGED',
        previousTotal: 14515,
        updatedTotal: 14815,
        currency: '₹',
        message: 'Weekend rate adjustment applied.'
      };
    }

    // Try reading active draft from localStorage
    let draft = null;
    try {
      const stored = localStorage.getItem('konkan_trip_active_booking_draft_v1');
      if (stored) draft = JSON.parse(stored);
    } catch (e) {}

    const defaultProperty = STAYS_DATA[1]; // Dapoli Cliffside
    const defaultRoom = defaultProperty.roomTypes[0];

    return {
      status: 'ACTIVE',
      sessionId: sessionId || draft?.bookingId || 'KT-BK-980123',
      expiresAt: draft?.sessionExpiry || new Date(Date.now() + 14 * 60 * 1000).toISOString(),
      property: {
        id: defaultProperty.id,
        title: defaultProperty.title,
        destinationName: defaultProperty.destinationName,
        microLocation: defaultProperty.microLocation,
        image: defaultProperty.image,
        rating: defaultProperty.rating,
        reviewsCount: defaultProperty.reviewsCount,
        badge: defaultProperty.badge,
        category: defaultProperty.category
      },
      room: {
        roomId: defaultRoom.roomId,
        name: defaultRoom.name,
        image: defaultRoom.image,
        bedType: defaultRoom.bedType,
        capacity: defaultRoom.capacity,
        mealPlan: defaultRoom.mealPlan,
        amenities: defaultRoom.amenities,
        pricePerNight: defaultRoom.pricePerNight,
        taxesPerNight: defaultRoom.taxesPerNight,
        cancellationPolicy: defaultRoom.cancellationPolicy
      },
      dates: {
        checkIn: '2026-08-24',
        checkInTime: '1:00 PM',
        checkOut: '2026-08-26',
        checkOutTime: '11:00 AM',
        nights: 2
      },
      guests: {
        adults: 2,
        children: 0,
        rooms: 1
      },
      mainGuest: draft?.mainGuest || {
        firstName: 'Aniket',
        lastName: 'Kulkarni',
        email: 'aniket.kulkarni@example.com',
        phone: '9820194820'
      },
      otherGuests: draft?.otherGuests || [],
      specialRequests: draft?.specialRequests || '• Ground floor room requested\n• Late check-in (after 8:00 PM)',
      arrivalTime: draft?.arrivalTime || '2:00 PM – 4:00 PM',
      gstInvoice: draft?.gstInvoice || null,
      pricing: draft?.pricing || {
        basePrice: 14400,
        discount: 1440,
        taxes: 1555,
        totalAmount: 14515,
        currency: '₹'
      },
      cancellationPolicy: {
        freeUntil: '22 Aug 2026',
        summary: 'Free cancellation until 22 Aug 2026 (24 hours prior to check-in). 100% refund guaranteed.'
      }
    };
  }

  /**
   * POST /customer/bookings/lock-and-proceed
   * Locks the inventory and prepares the order for Screen 08 (Payment).
   */
  async lockBookingForPayment(sessionId) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Payment gateway initialization failed.');
    }

    return {
      success: true,
      orderId: `KT-ORD-${Date.now().toString().slice(-6)}`,
      sessionId,
      amount: 14515,
      currency: 'INR'
    };
  }

  // =========================================================================
  // Screen 08 — Payment & Secure Checkout API Methods
  // =========================================================================

  /**
   * POST /customer/payments/create-order
   * Authoritatively determines the payable amount and initializes the gateway order with idempotency token.
   */
  async createPaymentOrder({ sessionId, paymentMethod, idempotencyKey }) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Payment gateway is temporarily unavailable. Please try another payment mode.');
    }

    const orderId = `KT-ORD-${Date.now().toString().slice(-6)}`;
    const amount = 14515; // Authoritative backend total

    return {
      orderId,
      sessionId,
      paymentMethod,
      amount,
      currency: 'INR',
      currencySymbol: '₹',
      status: 'CREATED',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
  }

  /**
   * POST /customer/payments/verify-and-confirm
   * Verifies payment provider webhook, locks room inventory permanently,
   * calculates owner commission, and creates confirmed booking reference.
   */
  async verifyAndConfirmPayment({ orderId, sessionId, paymentMethod, paymentDetails }) {
    await this.simulateNetwork();

    if (this.currentMode === 'PAYMENT_FAILED') {
      return {
        paymentStatus: 'FAILED',
        bookingStatus: 'FAILED',
        message: 'Your payment could not be completed by your bank. No booking has been confirmed.'
      };
    }

    if (this.currentMode === 'PAYMENT_PENDING') {
      return {
        paymentStatus: 'PENDING',
        bookingStatus: 'CONFIRMING',
        message: 'We are waiting for confirmation from your payment provider. Please do not initiate another transaction.'
      };
    }

    if (this.currentMode === 'PAYMENT_SUCCESS_CONFIRMING') {
      return {
        paymentStatus: 'SUCCESS',
        bookingStatus: 'PROCESSING',
        bookingReference: `KT-BK-${Date.now().toString().slice(-6)}`,
        message: 'Payment received. We are finalizing your reservation with the coastal host.'
      };
    }

    // Normal Successful Flow
    const bookingReference = `KT-BK-${Date.now().toString().slice(-6)}`;
    const transactionId = `TXN-${Date.now().toString()}`;

    // Calculate owner payout & platform commission
    const totalAmount = 14515;
    const platformCommission = Math.round(totalAmount * 0.12); // 12% KonkanTrip platform fee
    const ownerPayout = totalAmount - platformCommission;

    const confirmedBooking = {
      bookingReference,
      transactionId,
      orderId,
      sessionId,
      propertyId: 'stay-03',
      propertyTitle: 'Cliffside Ocean Song Eco Resort',
      roomName: 'Panoramic Ocean Suite',
      destination: 'Dapoli, Ratnagiri',
      checkIn: '2026-08-24',
      checkOut: '2026-08-26',
      nights: 2,
      guests: '2 Adults · 1 Room',
      mainGuest: {
        name: 'Aniket Kulkarni',
        email: 'aniket.kulkarni@example.com',
        phone: '9820194820'
      },
      payment: {
        method: paymentMethod || 'UPI',
        amount: totalAmount,
        currency: '₹',
        status: 'SUCCESS',
        paidAt: new Date().toISOString()
      },
      ownerIntegration: {
        hostName: 'Ketan & Dr. Meera Salvi',
        ownerPayout,
        platformCommission,
        inventoryStatus: 'LOCKED_CONFIRMED'
      },
      status: 'CONFIRMED'
    };

    // Store in confirmed bookings list
    try {
      localStorage.setItem('konkan_trip_latest_confirmed_booking_v1', JSON.stringify(confirmedBooking));
    } catch (e) {}

    return {
      paymentStatus: 'SUCCESS',
      bookingStatus: 'CONFIRMED',
      bookingReference,
      transactionId,
      booking: confirmedBooking
    };
  }

  /**
   * GET /customer/payments/{paymentId}/status
   */
  async getPaymentStatus(paymentId) {
    await this.simulateNetwork();
    return {
      paymentId,
      status: 'SUCCESS',
      bookingStatus: 'CONFIRMED'
    };
  }

  // =========================================================================
  // Screen 09 — Booking Confirmation API Methods
  // =========================================================================

  /**
   * GET /customer/bookings/{bookingReference}
   * Retrieves authoritative confirmed booking details, room reservation status,
   * stay dates, guest contact, itemized payment, and owner integration metadata.
   */
  async fetchConfirmedBooking(bookingReference) {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Unable to retrieve confirmed reservation from booking server.');
    }

    if (this.currentMode === 'CONFIRMING') {
      return {
        status: 'CONFIRMING',
        bookingReference: bookingReference || 'KT-BK-890214',
        message: 'We are securely finalizing your reservation with the property host.'
      };
    }

    if (this.currentMode === 'PAYMENT_RECEIVED_PENDING') {
      return {
        status: 'PROCESSING',
        paymentStatus: 'SUCCESS',
        bookingStatus: 'PROCESSING',
        bookingReference: bookingReference || 'KT-BK-890214',
        message: 'Payment received. We are still confirming your room reservation. Please do not make another payment.'
      };
    }

    // Try reading authoritative confirmed booking from localStorage
    let storedBooking = null;
    try {
      const stored = localStorage.getItem('konkan_trip_latest_confirmed_booking_v1');
      if (stored) storedBooking = JSON.parse(stored);
    } catch (e) {}

    const defaultProperty = STAYS_DATA[1]; // Dapoli Cliffside
    const defaultRoom = defaultProperty.roomTypes[0];

    const ref = bookingReference || storedBooking?.bookingReference || 'KT-BK-890214';
    const txnId = storedBooking?.transactionId || 'TXN-982019482';

    return {
      status: 'CONFIRMED',
      isAlreadyConfirmed: !!storedBooking,
      bookingReference: ref,
      transactionId: txnId,
      confirmedAt: storedBooking?.payment?.paidAt || new Date().toISOString(),
      property: {
        id: defaultProperty.id,
        title: storedBooking?.propertyTitle || defaultProperty.title,
        destinationName: storedBooking?.destination || defaultProperty.destinationName,
        microLocation: defaultProperty.microLocation || 'Karde Cliff Road, Dapoli',
        image: defaultProperty.image,
        rating: defaultProperty.rating || 4.95,
        reviewsCount: defaultProperty.reviewsCount || 162,
        badge: defaultProperty.badge || 'Panoramic Sea View',
        category: defaultProperty.category || 'villas',
        host: defaultProperty.host || {
          name: 'Ketan & Dr. Meera Salvi',
          phone: '+91 98201 45890',
          responseRate: '100%'
        },
        address: defaultProperty.address || 'Karde Cliff Road, Dapoli, Ratnagiri District, Maharashtra 415713'
      },
      room: {
        roomId: defaultRoom.roomId,
        name: storedBooking?.roomName || defaultRoom.name,
        image: defaultRoom.image,
        bedType: defaultRoom.bedType || '1 King Bed',
        capacity: defaultRoom.capacity || 2,
        mealPlan: defaultRoom.mealPlan || 'Artisan Konkan Breakfast Included',
        amenities: defaultRoom.amenities || ['180° Ocean Deck', 'AC', 'Free High-Speed WiFi', 'Rain Shower', 'Espresso Machine'],
        cancellationPolicy: defaultRoom.cancellationPolicy || 'Free cancellation until 22 Aug 2026'
      },
      stayDates: {
        checkIn: storedBooking?.checkIn || '2026-08-24',
        checkInTime: '1:00 PM',
        checkOut: storedBooking?.checkOut || '2026-08-26',
        checkOutTime: '11:00 AM',
        nights: storedBooking?.nights || 2,
        guests: storedBooking?.guests || '2 Adults · 1 Room'
      },
      guestDetails: {
        name: storedBooking?.mainGuest?.name || 'Aniket Kulkarni',
        email: storedBooking?.mainGuest?.email || 'aniket.kulkarni@example.com',
        phone: storedBooking?.mainGuest?.phone || '9820194820'
      },
      specialRequests: storedBooking?.specialRequests || '• Ground floor room requested\n• Late check-in (after 8:00 PM)',
      paymentSummary: {
        roomPrice: 14400,
        discount: 1440,
        taxes: 1555,
        totalPaid: storedBooking?.payment?.amount || 14515,
        currency: '₹',
        paymentMethod: storedBooking?.payment?.method || 'UPI (Google Pay)',
        paymentStatus: 'PAID',
        paidAt: storedBooking?.payment?.paidAt || '19 Aug 2026, 3:30 PM'
      },
      cancellationPolicy: {
        freeUntil: '22 Aug 2026 (24 hours prior to check-in)',
        summary: 'Free cancellation until 22 Aug 2026 with 100% full refund guarantee.'
      }
    };
  }

  /**
   * GET /customer/stays/recommendations
   * Retrieves authentic recommended stays around the Konkan coast.
   */
  async fetchRecommendedStays(excludeId = 'stay-03') {
    await this.simulateNetwork();
    return STAYS_DATA.filter(s => s.id !== excludeId).slice(0, 3);
  }

  // =========================================================================
  // Screen 10 — My Booking / Booking Details API Methods
  // =========================================================================

  /**
   * GET /customer/bookings/{bookingReference}/details
   * Retrieves full customer-facing booking metadata for Screen 10.
   */
  async fetchBookingDetails(bookingReference = 'KT-BK-890214') {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('We could not load your booking details. Please check your network connection.');
    }

    if (this.currentMode === 'NOT_FOUND') {
      return {
        status: 'NOT_FOUND',
        message: 'We couldn’t find this booking. Please check your booking reference or try again.'
      };
    }

    // Base authoritative record from Screen 09
    const baseBooking = await this.fetchConfirmedBooking(bookingReference);

    // Apply simulated state overrides if set via Dev Toolbar
    if (this.currentMode === 'PAYMENT_PENDING') {
      return {
        ...baseBooking,
        status: 'PAYMENT_PENDING',
        paymentSummary: {
          ...baseBooking.paymentSummary,
          paymentStatus: 'PENDING'
        }
      };
    }

    if (this.currentMode === 'CONFIRMATION_PENDING') {
      return {
        ...baseBooking,
        status: 'CONFIRMATION_PENDING',
        message: 'We are securely finalizing your reservation with the property host.'
      };
    }

    if (this.currentMode === 'CANCELLED') {
      return {
        ...baseBooking,
        status: 'CANCELLED',
        cancelledAt: '19 Aug 2026, 4:15 PM',
        cancellationReason: 'Customer requested cancellation within 100% refund window',
        refundSummary: {
          status: 'REFUND_PROCESSING',
          amountPaid: 14515,
          cancellationFee: 0,
          refundAmount: 14515,
          refundMethod: baseBooking.paymentSummary.paymentMethod,
          estimatedDays: '2–4 bank working days'
        }
      };
    }

    if (this.currentMode === 'REFUNDED') {
      return {
        ...baseBooking,
        status: 'REFUNDED',
        cancelledAt: '19 Aug 2026, 4:15 PM',
        refundSummary: {
          status: 'REFUNDED',
          amountPaid: 14515,
          cancellationFee: 0,
          refundAmount: 14515,
          refundMethod: baseBooking.paymentSummary.paymentMethod,
          refundDate: '21 Aug 2026'
        }
      };
    }

    if (this.currentMode === 'COMPLETED') {
      return {
        ...baseBooking,
        status: 'COMPLETED',
        stayDates: {
          ...baseBooking.stayDates,
          checkIn: '2026-07-10',
          checkOut: '2026-07-12'
        }
      };
    }

    return {
      ...baseBooking,
      status: this.currentMode === 'UPCOMING' ? 'UPCOMING' : (baseBooking.status || 'CONFIRMED'),
      canCancel: true,
      canModify: false, // Modification capability controlled authoritatively by host policy
      bookedOn: '19 Aug 2026, 3:30 PM'
    };
  }

  /**
   * POST /customer/bookings/{bookingReference}/cancel
   * Authoritatively cancels the booking, releases inventory, and initiates refund.
   */
  async cancelBooking(bookingReference, reason = 'Customer requested cancellation') {
    await this.simulateNetwork();

    if (this.currentMode === 'ERROR') {
      throw new Error('Cancellation service is temporarily busy. Please try again.');
    }

    const booking = await this.fetchConfirmedBooking(bookingReference);
    const amountPaid = booking?.paymentSummary?.totalPaid || 14515;
    const cancellationFee = 0; // Free cancellation within window
    const refundAmount = amountPaid - cancellationFee;

    const cancelledData = {
      ...booking,
      status: 'CANCELLED',
      cancelledAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      cancellationReason: reason,
      refundSummary: {
        status: 'REFUND_PROCESSING',
        amountPaid,
        cancellationFee,
        refundAmount,
        refundMethod: booking?.paymentSummary?.paymentMethod || 'UPI (Google Pay)',
        estimatedDays: '2–4 bank working days'
      }
    };

    try {
      localStorage.setItem('konkan_trip_latest_confirmed_booking_v1', JSON.stringify(cancelledData));
    } catch (e) {}

    return {
      success: true,
      bookingReference,
      status: 'CANCELLED',
      refundSummary: cancelledData.refundSummary,
      message: 'Your booking has been successfully cancelled. A full refund of ₹14,515 has been initiated.'
    };
  }
}

// Export singleton instance
const apiService = new KonkanApiService();









