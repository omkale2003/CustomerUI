/**
 * KonkanTrip - UI Component Generators
 * Generates semantic, accessible DOM representations for cards, skeletons, empty and error states.
 */

const UI = {
  // Lucide SVG Icon helper
  icon(name, className = 'icon-inline') {
    const icons = {
      'search': `<svg class="${className}" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
      'map-pin': `<svg class="${className}" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
      'calendar': `<svg class="${className}" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      'users': `<svg class="${className}" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      'heart': `<svg class="${className}" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
      'star': `<svg class="${className}" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
      'shield-check': `<svg class="${className}" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`,
      'compass': `<svg class="${className}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
      'credit-card': `<svg class="${className}" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
      'headphones': `<svg class="${className}" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>`,
      'umbrella': `<svg class="${className}" viewBox="0 0 24 24"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"></path></svg>`,
      'trees': `<svg class="${className}" viewBox="0 0 24 24"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0z"></path><path d="M7 16v6"></path><path d="M13 19v3"></path><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-4 4.3a1 1 0 0 0 .8 1.7H10l-3 3.3a1 1 0 0 0 .7 1.7H8l-3 3.3a1 1 0 0 0 .7 1.7H12z"></path></svg>`,
      'waves': `<svg class="${className}" viewBox="0 0 24 24"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>`,
      'castle': `<svg class="${className}" viewBox="0 0 24 24"><path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"></path><path d="M18 11V4H6v7"></path><path d="M15 22v-4a3 3 0 0 0-6 0v4"></path><path d="M22 11V9"></path><path d="M2 11V9"></path><path d="M6 4V2"></path><path d="M18 4V2"></path><path d="M10 4V2"></path><path d="M14 4V2"></path></svg>`,
      'utensils': `<svg class="${className}" viewBox="0 0 24 24"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><path d="M15 11v11"></path><path d="M6 2v20"></path><path d="M6 2a5 5 0 0 1 5 5v3H6"></path></svg>`,
      'clock': `<svg class="${className}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      'check-circle': `<svg class="${className}" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      'x': `<svg class="${className}" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      'alert-circle': `<svg class="${className}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
      'refresh-cw': `<svg class="${className}" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
      'chevron-right': `<svg class="${className}" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
      'arrow-right': `<svg class="${className}" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
      'menu': `<svg class="${className}" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
      'user': `<svg class="${className}" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      'sparkles': `<svg class="${className}" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`
    };
    return icons[name] || '';
  },

  /**
   * Destination Card Component
   */
  renderDestinationCard(destination) {
    return `
      <article class="destination-card" data-destination-id="${destination.id}" data-destination-name="${destination.name}" role="button" tabindex="0">
        <img class="destination-card-img" src="${destination.image}" alt="${destination.name}, ${destination.district} coastal destination" loading="lazy" />
        <div class="destination-card-overlay">
          <div class="destination-tag-top">
            <span class="badge badge-sand">${destination.district}</span>
          </div>
          <div class="destination-bottom-info">
            <h3 class="destination-name">${destination.name}</h3>
            <div class="destination-stays-count">
              ${UI.icon('map-pin', 'icon-sm')} ${destination.staysCount} Available Stays & Homestays
            </div>
            <div class="destination-vibe-tag">${destination.vibe}</div>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Property / Stay Card Component
   */
  renderPropertyCard(stay, isWishlisted = false) {
    const amenitiesHtml = stay.amenities
      .slice(0, 3)
      .map(amenity => `<span class="amenity-chip">${amenity}</span>`)
      .join('');

    return `
      <article class="property-card" data-stay-id="${stay.id}">
        <div class="property-media-wrap">
          <img class="property-img" src="${stay.image}" alt="${stay.title}" loading="lazy" />
          <div class="property-badge-floating">
            <span class="badge ${stay.badge.includes('Verified') ? 'badge-green' : 'badge-teal'}">
              ${stay.badge.includes('Verified') ? UI.icon('shield-check', 'icon-sm') : UI.icon('sparkles', 'icon-sm')}
              ${stay.badge}
            </span>
          </div>
          <button 
            class="property-wishlist-btn ${isWishlisted ? 'active' : ''}" 
            data-action="toggle-wishlist" 
            data-stay-id="${stay.id}"
            aria-label="${isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}"
            title="${isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}"
          >
            ${UI.icon('heart')}
          </button>
        </div>
        
        <div class="property-body">
          <div class="property-header-meta">
            <div class="property-location-tag">
              ${UI.icon('map-pin', 'icon-sm')}
              <span>${stay.destinationName}</span>
            </div>
            <div class="property-rating-box">
              ${UI.icon('star', 'icon-sm property-rating-star')}
              <span>${stay.rating.toFixed(2)}</span>
              <span class="property-reviews-count">(${stay.reviewsCount})</span>
            </div>
          </div>

          <h3 class="property-title">${stay.title}</h3>
          <p class="property-location-tag" style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: -2px;">
            ${stay.distanceInfo}
          </p>

          <div class="property-amenities-pills">
            ${amenitiesHtml}
          </div>

          <div class="property-footer-row">
            <div class="property-price-box">
              <span class="price-period-label">Starting from</span>
              <div class="price-amount-wrap">
                <span class="price-currency">₹</span>
                <span class="price-value">${stay.pricePerNight.toLocaleString('en-IN')}</span>
                <span class="price-night-suffix">/ night</span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" data-action="view-property" data-stay-id="${stay.id}">
              View Property
            </button>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Category Tile Component
   */
  renderCategoryCard(cat) {
    return `
      <div class="category-card" data-category-id="${cat.id}" role="button" tabindex="0">
        <img class="category-card-img" src="${cat.image}" alt="${cat.title}" loading="lazy" />
        <div class="category-card-overlay">
          <div class="category-icon-bubble">
            ${UI.icon(cat.icon)}
          </div>
          <h4 class="category-title">${cat.title}</h4>
          <span class="category-count-sub">${cat.count}</span>
        </div>
      </div>
    `;
  },

  /**
   * Experience Card Component
   */
  renderExperienceCard(exp) {
    const highlightsHtml = exp.highlights
      .map(h => `<li style="font-size:0.8rem; display:flex; align-items:center; gap:6px; color:var(--color-text-secondary);">${UI.icon('check-circle', 'icon-sm')} ${h}</li>`)
      .join('');

    return `
      <article class="experience-card" data-exp-id="${exp.id}">
        <div class="experience-media">
          <img class="experience-img" src="${exp.image}" alt="${exp.title}" loading="lazy" />
          <div style="position:absolute; top:12px; left:12px;">
            <span class="badge badge-sand">${exp.category}</span>
          </div>
        </div>
        <div class="experience-body">
          <div class="experience-meta-row">
            <span>${UI.icon('map-pin', 'icon-sm')} ${exp.location}</span>
            <span>${UI.icon('clock', 'icon-sm')} ${exp.duration}</span>
          </div>
          <h3 class="experience-title">${exp.title}</h3>
          
          <ul style="display:flex; flex-direction:column; gap:4px; margin: 6px 0;">
            ${highlightsHtml}
          </ul>

          <div class="experience-footer">
            <div class="property-price-box">
              <span class="price-period-label">From</span>
              <div class="price-amount-wrap">
                <span class="price-currency">₹</span>
                <span class="price-value" style="font-size:1.25rem;">${exp.price.toLocaleString('en-IN')}</span>
                <span class="price-night-suffix">/ person</span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" data-action="explore-exp" data-exp-id="${exp.id}">
              Explore
            </button>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Skeleton Loaders for Sections
   */
  renderStaysSkeletons(count = 3) {
    return Array.from({ length: count }).map(() => `
      <div class="property-card" style="pointer-events: none;">
        <div class="skeleton" style="height: 240px; width: 100%;"></div>
        <div class="property-body" style="gap: 12px;">
          <div style="display:flex; justify-content:space-between;">
            <div class="skeleton" style="height: 14px; width: 35%;"></div>
            <div class="skeleton" style="height: 14px; width: 20%;"></div>
          </div>
          <div class="skeleton" style="height: 22px; width: 80%;"></div>
          <div class="skeleton" style="height: 14px; width: 50%;"></div>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <div class="skeleton" style="height: 20px; width: 25%;"></div>
            <div class="skeleton" style="height: 20px; width: 30%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:16px; padding-top:12px; border-top:1px solid #eee;">
            <div class="skeleton" style="height: 28px; width: 40%;"></div>
            <div class="skeleton" style="height: 36px; width: 35%;"></div>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderDestinationsSkeletons(count = 4) {
    return Array.from({ length: count }).map(() => `
      <div class="skeleton" style="height: 360px; border-radius: var(--radius-lg);"></div>
    `).join('');
  },

  /**
   * Empty State View
   */
  renderEmptyState(message = 'No stays found matching your current filter criteria.', onResetActionName = 'resetFilters') {
    return `
      <div class="state-box">
        <div class="state-icon-box empty">
          ${UI.icon('search', 'icon-lg')}
        </div>
        <h3 class="state-title">No Stays Found</h3>
        <p class="state-desc">${message}</p>
        <button class="btn btn-secondary btn-sm" style="margin-top: 8px;" onclick="window.konkanApp.${onResetActionName}()">
          Reset Search Filters
        </button>
      </div>
    `;
  },

  /**
   * Error State View ("Unable to load this section." with "Try Again")
   */
  renderErrorState(retryFnName = 'reloadSection') {
    return `
      <div class="state-box">
        <div class="state-icon-box error">
          ${UI.icon('alert-circle', 'icon-lg')}
        </div>
        <h3 class="state-title">Unable to load this section.</h3>
        <p class="state-desc">We encountered an issue fetching live Konkan coastal data. Please try again.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 8px;" onclick="window.konkanApp.${retryFnName}()">
          ${UI.icon('refresh-cw', 'icon-sm')} Try Again
        </button>
      </div>
    `;
  }
};
