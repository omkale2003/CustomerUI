/**
 * KonkanTrip - Data Store & Backend-Ready Schema
 * Contains structured coastal destinations, properties, experiences, categories, and offers.
 */

const DESTINATIONS_DATA = [
  {
    id: 'dest-dapoli',
    name: 'Dapoli',
    tagline: 'Mini Mahabaleshwar by the Sea',
    district: 'Ratnagiri District',
    vibe: 'Dolphin safaris & betel nut groves',
    staysCount: 38,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    popularSpots: ['Murud Beach', 'Karde Beach', 'Suvarnadurg Fort', 'Unhavare Hot Springs'],
    bestTimeToVisit: 'October to May'
  },
  {
    id: 'dest-tarkarli',
    name: 'Tarkarli & Devbagh',
    tagline: 'Crystal Clear Waters & Coral Reefs',
    district: 'Sindhudurg District',
    vibe: 'Scuba diving & estuary sangam',
    staysCount: 45,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    popularSpots: ['Tarkarli Beach', 'Devbagh Sangam', 'Karli River Backwaters', 'Tsunami Island'],
    bestTimeToVisit: 'October to May'
  },
  {
    id: 'dest-ganpatipule',
    name: 'Ganpatipule',
    tagline: 'Serene Coastal Temples & White Sand',
    district: 'Ratnagiri District',
    vibe: 'Coastal cliff drives & spiritual peace',
    staysCount: 29,
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
    popularSpots: ['Swayambhu Ganpati Temple', 'Aare Ware Beach Road', 'Prachin Konkan Museum', 'Malgund'],
    bestTimeToVisit: 'Year-round'
  },
  {
    id: 'dest-malvan',
    name: 'Malvan',
    tagline: 'Historic Sea Forts & Authentic Seafood',
    district: 'Sindhudurg District',
    vibe: 'Culinary heart of Konkan & marine history',
    staysCount: 42,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
    popularSpots: ['Sindhudurg Fort', 'Chivla Beach', 'Rock Garden', 'Rameshwar Temple'],
    bestTimeToVisit: 'September to May'
  },
  {
    id: 'dest-alibaug',
    name: 'Alibaug & Kihim',
    tagline: 'Boutique Coastal Getaways & Palaces',
    district: 'Raigad District',
    vibe: 'Private luxury villas & quick Mumbai access',
    staysCount: 64,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    popularSpots: ['Kolaba Fort', 'Kashid Beach', 'Nagaon Watersports', 'Kihim Coconut Groves'],
    bestTimeToVisit: 'September to June'
  },
  {
    id: 'dest-ratnagiri',
    name: 'Ratnagiri & Guhagar',
    tagline: 'Alphonso Orchards & Untouched Coastlines',
    district: 'Ratnagiri District',
    vibe: 'Mango trails, lighthouse views & quiet wadas',
    staysCount: 31,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    popularSpots: ['Ratnadurg Fort', 'Thiba Palace', 'Guhagar Beach', 'Jaigad Lighthouse'],
    bestTimeToVisit: 'October to May'
  }
];

const STAYS_DATA = [
  {
    id: 'stay-01',
    propertyId: 'KT-STAY-01',
    title: 'The Blue Lagoon Beachfront Villa',
    slug: 'the-blue-lagoon-beachfront-villa',
    destinationId: 'dest-tarkarli',
    destinationName: 'Tarkarli, Sindhudurg',
    microLocation: 'Tarkarli Beach Front',
    fullAddress: 'Plot 4, Devbagh-Tarkarli Coastal Highway, Tarkarli Beach, Malvan 416606, Maharashtra',
    category: 'villas',
    categoryLabel: 'Beachfront Villa',
    badge: 'Konkan Verified',
    rating: 4.92,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 6400,
    taxesPerNight: 768,
    originalPrice: 7800,
    bookingBenefit: 'Free Cancellation · Instant Confirmation · Pay at Property',
    breakfastIncluded: true,
    roomAvailability: 2,
    distanceInfo: '20 steps to Tarkarli White Sand Beach',
    distanceFromDestination: '0.2 km from Tarkarli Center',
    coordinates: { lat: 15.9922, lng: 73.4912 },
    travellerTypes: ['couples', 'families'],
    amenities: ['Direct Beach Access', 'Fresh Malvani Thali Meals', 'Private Sunset Deck', 'AC', 'High-Speed Wi-Fi', 'Free Parking', 'Power Backup', 'Daily Housekeeping'],
    highlights: [
      'Step directly from your private terrace onto soft white sand',
      'Freshly caught Kingfish & Prawn curry prepared by in-house Malvani cooks',
      'Complimentary morning dolphin safari booking assistance',
      'Quiet beachfront without tourist crowds'
    ],
    shortDesc: 'Wake up to the gentle waves of the Arabian Sea. Set right on Tarkarli’s tranquil coast with private access to pristine sands and warm Konkani hospitality.',
    fullDescription: 'Perched directly on the edge of Tarkarli’s untouched coastline, The Blue Lagoon Beachfront Villa blends warm coastal heritage with modern luxury. Constructed using local chira (red laterite stone) and rich teakwood, the villa offers unbroken 180-degree ocean views, private shaded hammock groves, and direct gate access to the beach. Enjoy unhurried mornings sipping freshly brewed kokum coolers while watching fishing boats drift past, followed by authentic home-cooked Surmai and Solkadhi meals cooked over traditional wood-fired hearths.',
    host: {
      name: 'Santosh & Supriya Parab',
      type: 'Native Sindhudurg Family Hosts',
      responseRate: '100% within an hour',
      bio: 'Lifelong Tarkarli residents passionate about marine conservation and authentic coastal hospitality.'
    },
    houseRules: {
      checkIn: '12:00 PM',
      checkOut: '10:00 AM',
      pets: 'Pets welcome in ground floor garden cottages',
      smoking: 'Outdoor areas only',
      quietHours: '10:00 PM – 7:00 AM'
    },
    cancellationDetailed: 'Full refund if cancelled up to 48 hours prior to check-in. 50% refund for cancellations within 24–48 hours.',
    ratingsBreakdown: {
      cleanliness: 4.9,
      location: 5.0,
      service: 4.9,
      value: 4.8,
      food: 5.0
    },
    reviewsList: [
      {
        id: 'rev-01',
        customerName: 'Aniket Kulkarni',
        location: 'Pune, Maharashtra',
        rating: 5,
        date: 'August 2026',
        stayType: 'Couple Stay',
        comment: 'Unbeatable location! You can hear the ocean from the bed. The home-cooked Surmai thali was the best meal of our entire Konkan trip.',
        verified: true
      },
      {
        id: 'rev-02',
        customerName: 'Neha & Siddharth Rao',
        location: 'Mumbai',
        rating: 5,
        date: 'July 2026',
        stayType: 'Family with 2 Kids',
        comment: 'Extremely clean, warm hosts, and the kids loved playing on the beach right in front of our room. Highly recommended!',
        verified: true
      }
    ],
    nearbyPlaces: [
      { name: 'Tarkarli Beach Water Sports', distance: '300 m', type: 'Watersports & Scuba' },
      { name: 'Devbagh Sangam Estuary', distance: '2.5 km', type: 'River & Ocean Meeting' },
      { name: 'Sindhudurg Sea Fort', distance: '5.8 km', type: 'Historical Fort' }
    ],
    roomTypes: [
      {
        roomId: 'room-01-a',
        name: 'Sea-Facing Deluxe Suite',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
        capacity: '2 Adults, 1 Child',
        bedType: '1 King Bed',
        amenities: ['Direct Sea View Balcony', 'Split AC', 'Rain Shower', 'Free Wi-Fi', 'Tea/Coffee Maker'],
        mealPlan: 'Complimentary Malvani Breakfast Included',
        cancellationPolicy: 'Free cancellation until 48 hours prior',
        pricePerNight: 6400,
        taxesPerNight: 768,
        availability: 2
      },
      {
        roomId: 'room-01-b',
        name: 'Family Coconut Grove Cottage',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        capacity: '4 Adults',
        bedType: '2 Queen Beds',
        amenities: ['Garden Patio', 'Dual AC', 'Ensuite Bathroom', 'Mini Fridge', 'Living Area'],
        mealPlan: 'Complimentary Malvani Breakfast Included',
        cancellationPolicy: 'Free cancellation until 48 hours prior',
        pricePerNight: 9200,
        taxesPerNight: 1104,
        availability: 1
      }
    ]
  },
  {
    id: 'stay-03',
    propertyId: 'KT-STAY-03',
    title: 'Cliffside Ocean Song Eco Resort',
    slug: 'cliffside-ocean-song-eco-resort',
    destinationId: 'dest-dapoli',
    destinationName: 'Dapoli, Ratnagiri',
    microLocation: 'Karde Cliff Road',
    fullAddress: 'Karde-Murud Cliff Ridge, Near Lighthouse Point, Dapoli 415712, Maharashtra',
    category: 'cliffside',
    categoryLabel: 'Cliffside Resort',
    badge: 'Panoramic Sea View',
    rating: 4.95,
    reviewsCount: 162,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 7200,
    taxesPerNight: 864,
    originalPrice: 8500,
    bookingBenefit: 'Infinity Pool Access · Dolphin Watching Deck · Free Breakfast',
    breakfastIncluded: true,
    roomAvailability: 2,
    distanceInfo: 'Perched on cliffs overlooking Murud-Karde coastline',
    distanceFromDestination: '1.2 km from Karde Beach',
    coordinates: { lat: 17.7423, lng: 73.1611 },
    travellerTypes: ['couples', 'families'],
    amenities: ['Infinity Cliff Pool', 'Dolphin Spotting Balcony', 'Yoga Pavilion', 'AC', 'Restaurant with Fresh Catch', 'EV Charger', 'High-Speed Wi-Fi', 'Free Parking'],
    highlights: [
      'Unobstructed 180° clifftop views across Murud and Karde beaches',
      'Infinity pool overlooking the Arabian Sea sunset horizon',
      'Regular morning dolphin pods visible right from the breakfast deck',
      'Solar-powered sustainable architecture built with natural laterite'
    ],
    shortDesc: 'High above the crashing waves with unhindered 180-degree ocean panoramas. Perfect for dolphin watching directly from your private terrace.',
    fullDescription: 'Suspended 120 feet above the crashing waves of the Arabian Sea, Cliffside Ocean Song Eco Resort offers one of Maharashtra’s most breathtaking panoramic vistas. Built responsibly on a secluded ridge between Murud and Karde, each suite features floor-to-ceiling glass doors opening onto private wooden sundecks. Guests can unwind in the cliffside infinity pool, practice morning yoga to the sound of breaking surf, and indulge in locally sourced farm-to-table cuisine prepared with freshly pressed coconut milk, home-ground masalas, and daily harbor catches.',
    host: {
      name: 'Ketan & Dr. Meera Salvi',
      type: 'Eco-Tourism Naturalist Hosts',
      responseRate: '100% within 30 mins',
      bio: 'Passionate naturalists who restored this coastal cliff parcel into an eco-haven.'
    },
    houseRules: {
      checkIn: '1:00 PM',
      checkOut: '11:00 AM',
      pets: 'Small pets allowed upon prior confirmation',
      smoking: 'Designated outdoor sea decks only',
      quietHours: '10:30 PM – 7:00 AM'
    },
    cancellationDetailed: 'Free cancellation up to 24 hours before check-in. Flexible monsoon rescheduling permitted.',
    ratingsBreakdown: {
      cleanliness: 4.95,
      location: 5.0,
      service: 4.9,
      value: 4.85,
      food: 5.0
    },
    reviewsList: [
      {
        id: 'rev-03',
        customerName: 'Aditya & Tanvi Joshi',
        location: 'Thane, Mumbai',
        rating: 5,
        date: 'August 2026',
        stayType: 'Anniversary Stay',
        comment: 'Pure bliss! Watching dolphins leaping in the sea while having hot breakfast on the deck was an unforgettable highlight.',
        verified: true
      },
      {
        id: 'rev-04',
        customerName: 'Vikram Merchant',
        location: 'Bengaluru',
        rating: 5,
        date: 'July 2026',
        stayType: 'Solo Wellness Trip',
        comment: 'Incredible peace, stunning architecture, and attentive hosts. The infinity pool at sunset is magic.',
        verified: true
      }
    ],
    nearbyPlaces: [
      { name: 'Karde Dolphin Beach', distance: '1.2 km', type: 'Dolphin Safari' },
      { name: 'Murud Beach Watersports', distance: '2.4 km', type: 'Parasailing & Jet Ski' },
      { name: 'Ladghar Red Pebble Beach', distance: '4.8 km', type: 'Scenic Sunset Beach' },
      { name: 'Suvarnadurg Sea Fort', distance: '8.5 km', type: 'Historic Island Fort' }
    ],
    roomTypes: [
      {
        roomId: 'room-03-a',
        name: 'Panoramic Ocean Suite',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        capacity: '2 Adults',
        bedType: '1 King Bed',
        amenities: ['180° Ocean View Deck', 'AC', 'Rain Shower', 'Espresso Machine', 'Starlink Wi-Fi'],
        mealPlan: 'Artisan Konkan Breakfast Included',
        cancellationPolicy: 'Free cancellation until 24h prior',
        pricePerNight: 7200,
        taxesPerNight: 864,
        availability: 2
      },
      {
        roomId: 'room-03-b',
        name: 'Private Plunge Pool Cliff Villa',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        capacity: '2 Adults, 2 Children',
        bedType: '1 King Bed + 1 Daybed',
        amenities: ['Private Heated Plunge Pool', 'Cliff Sunset Patio', 'Bathtub with Ocean View', 'Butler Call Service'],
        mealPlan: 'Full Breakfast & High Tea Included',
        cancellationPolicy: 'Free cancellation until 48h prior',
        pricePerNight: 11500,
        taxesPerNight: 1380,
        availability: 1
      }
    ]
  },
  {
    id: 'stay-02',
    propertyId: 'KT-STAY-02',
    title: 'Wada 1892 Heritage Konkan Estate',
    slug: 'wada-1892-heritage-konkan-estate',
    destinationId: 'dest-ratnagiri',
    destinationName: 'Ratnagiri (Near Ganpatipule)',
    microLocation: 'Mango Orchard Belt',
    fullAddress: 'Gokhale Estate, Aare Ware Coastal Road, Ratnagiri 415612, Maharashtra',
    category: 'wada',
    categoryLabel: 'Heritage Wada',
    badge: 'Heritage Classic',
    rating: 4.88,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 4800,
    taxesPerNight: 576,
    originalPrice: 5500,
    bookingBenefit: 'Complimentary Farm Tour · Free Konkani Breakfast',
    breakfastIncluded: true,
    roomAvailability: 3,
    distanceInfo: 'Situated in a 12-acre Alphonso Mango Orchard',
    distanceFromDestination: '4.5 km from Ratnagiri Port',
    coordinates: { lat: 17.0012, lng: 73.2845 },
    travellerTypes: ['families', 'groups', 'solo'],
    amenities: ['Alphonso Mango Trail', 'Courtyard Chulha Kitchen', 'Organic Farm Meals', 'AC', 'Library & Board Games', 'Free Parking', 'EV Charger'],
    highlights: [
      'Restored 130-year-old red laterite architecture with inner courtyards',
      '12-acre organic Alphonso mango and spice orchard trail',
      'Traditional wood-fired chulha cooking demonstrations',
      'Zero-plastic eco-conscious homestead'
    ],
    shortDesc: 'A restored 130-year-old traditional red laterite wada with inner wooden courtyards, antique brass fixtures, and traditional farm-to-table cuisine.',
    fullDescription: 'Step back in time to the golden age of Konkani wada living. Constructed in 1892 by the prominent Gokhale family, this estate features open-sky central courtyards (chowk), intricately carved Burma teak pillars, terracotta-tiled roofs, and cool laterite stone masonry. Set within 12 acres of heritage Alphonso orchards and spice groves, guests participate in seasonal harvesting, learn traditional heirloom recipes, and sleep in thoughtfully restored chambers with brass antique fixtures and modern ensuite comforts.',
    host: {
      name: 'Advait Gokhale',
      type: 'Fourth-Generation Konkan Estate Owner',
      responseRate: '98% within 2 hours',
      bio: 'Architectural restorer preserving traditional Konkan wada culture and heirloom mango cultivars.'
    },
    houseRules: {
      checkIn: '12:00 PM',
      checkOut: '10:30 AM',
      pets: 'Pets welcome in garden wing',
      smoking: 'Strictly prohibited indoors',
      quietHours: '10:00 PM – 7:00 AM'
    },
    cancellationDetailed: 'Full refund up to 72 hours before arrival. Flexible date modifications.',
    ratingsBreakdown: {
      cleanliness: 4.88,
      location: 4.9,
      service: 4.95,
      value: 4.85,
      food: 5.0
    },
    reviewsList: [
      {
        id: 'rev-05',
        customerName: 'Shalini Pradhan',
        location: 'Mumbai',
        rating: 5,
        date: 'July 2026',
        stayType: 'Family Heritage Vacation',
        comment: 'A true living heritage masterpiece! The courtyard breeze, warm brass lanterns, and organic mango thali made this our most special holiday in Maharashtra.',
        verified: true
      }
    ],
    nearbyPlaces: [
      { name: 'Ganpatipule Beach & Temple', distance: '14.0 km', type: 'Spiritual & Coastal' },
      { name: 'Aare Ware Cliff Highway', distance: '2.5 km', type: 'Scenic Coastal Drive' },
      { name: 'Ratnadurg Fort & Lighthouse', distance: '7.8 km', type: 'Sea Cliff Fort' }
    ],
    roomTypes: [
      {
        roomId: 'room-02-a',
        name: 'Heritage Courtyard Room',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        capacity: '2 Adults',
        bedType: '1 Teakwood Four-Poster King Bed',
        amenities: ['Direct Courtyard Access', 'AC', 'Brass Rain Shower', 'Organic Toiletries'],
        mealPlan: 'Farm-Fresh Traditional Breakfast Included',
        cancellationPolicy: 'Free cancellation until 72 hours prior',
        pricePerNight: 4800,
        taxesPerNight: 576,
        availability: 2
      },
      {
        roomId: 'room-02-b',
        name: 'Grand Laterite Loft',
        image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
        capacity: '3 Adults',
        bedType: '1 King Bed + 1 Single Teak Bed',
        amenities: ['Orchard View Balcony', 'High Ceilings', 'AC', 'Reading Nook', 'Tea Station'],
        mealPlan: 'Farm-Fresh Traditional Breakfast Included',
        cancellationPolicy: 'Free cancellation until 72 hours prior',
        pricePerNight: 6800,
        taxesPerNight: 816,
        availability: 1
      }
    ]
  },
  {
    id: 'stay-05',
    propertyId: 'KT-STAY-05',
    title: 'Alibaug Coconut Grove Private Pool Villa',
    slug: 'alibaug-coconut-grove-private-pool-villa',
    destinationId: 'dest-alibaug',
    destinationName: 'Awas - Alibaug, Raigad',
    microLocation: 'Awas & Kihim Belt',
    fullAddress: 'Survey 18, Awas Beach Road, Awas, Alibaug 402201, Raigad, Maharashtra',
    category: 'villas',
    categoryLabel: 'Luxury Pool Villa',
    badge: 'Private Pool',
    rating: 4.94,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 12500,
    taxesPerNight: 1500,
    originalPrice: 15000,
    bookingBenefit: 'Dedicated Butler & Chef · Heated Private Pool · 1-Acre Lawn',
    breakfastIncluded: true,
    roomAvailability: 1,
    distanceInfo: '5 mins to Awas Beach, 15 mins from Mandwa Jetty',
    distanceFromDestination: '6.0 km from Alibaug Town',
    coordinates: { lat: 18.7842, lng: 72.8711 },
    travellerTypes: ['families', 'groups'],
    amenities: ['Private Heated Pool', 'Dedicated Cook & Butler', 'Lush 1-Acre Lawn', 'BBQ Grill', 'Ultra Fast Starlink Wi-Fi', 'AC in all rooms', 'EV Charger'],
    highlights: [
      'Heated private swimming pool surrounded by towering coconut palms',
      'Full-time private chef for fresh seafood, barbecue, and regional fare',
      'Sprawling 1-acre manicured lawn with evening campfire setup',
      'Fast 15-minute speed boat transfer connection from Mandwa Jetty'
    ],
    shortDesc: 'A contemporary tropical sanctuary surrounded by swaying supari and coconut palms. Features a private pool and private chef for Konkani delicacies.',
    fullDescription: 'Designed as a bespoke tropical oasis, this entire 3-BHK luxury estate offers complete privacy in Alibaug’s tranquil Awas belt. Featuring a 35-foot private pool, glass-walled pavilion living areas, a private chef and butler team, and expansive open lawns with barbecue grills. Only 5 minutes from the calm waters of Awas Beach and 15 minutes from the Mumbai Ro-Ro ferry terminal at Mandwa.',
    host: {
      name: 'Rohan & Tara Deshmukh',
      type: 'Superhost & Architect',
      responseRate: '100% within 15 mins',
      bio: 'Architects dedicated to luxury coastal retreats in Raigad.'
    },
    houseRules: {
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      pets: 'Pets welcome on lawn & ground floor',
      smoking: 'Outdoor poolside areas only',
      quietHours: '11:00 PM – 7:00 AM'
    },
    cancellationDetailed: 'Free cancellation up to 7 days before check-in. 50% refund within 3–7 days.',
    ratingsBreakdown: {
      cleanliness: 5.0,
      location: 4.9,
      service: 5.0,
      value: 4.85,
      food: 5.0
    },
    reviewsList: [
      {
        id: 'rev-06',
        customerName: 'Sameer Singhania',
        location: 'South Mumbai',
        rating: 5,
        date: 'August 2026',
        stayType: 'Family Celebration',
        comment: 'Outstanding villa! The private chef made mouthwatering crab and pomfret fry. The heated pool in the rains was pure luxury.',
        verified: true
      }
    ],
    nearbyPlaces: [
      { name: 'Awas White Sand Beach', distance: '1.2 km', type: 'Quiet Swimming Beach' },
      { name: 'Mandwa Ro-Ro Jetty', distance: '6.5 km', type: 'Mumbai Ferry Connection' },
      { name: 'Kihim Beach & Watersports', distance: '4.8 km', type: 'Beach Activities' }
    ],
    roomTypes: [
      {
        roomId: 'room-05-a',
        name: 'Entire 3-BHK Luxury Pool Estate',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        capacity: '6–8 Guests',
        bedType: '3 King Bedrooms with Ensuite Bathrooms',
        amenities: ['Private Heated Pool', 'Chef & Butler', 'Gazebo Lounge', 'AC in all rooms', 'Starlink Wi-Fi'],
        mealPlan: 'Gourmet Breakfast Included',
        cancellationPolicy: 'Free cancellation up to 7 days prior',
        pricePerNight: 12500,
        taxesPerNight: 1500,
        availability: 1
      }
    ]
  }
];

const CATEGORIES_DATA = [
  {
    id: 'cat-beaches',
    title: 'Pristine Beaches',
    count: '42+ Beaches',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    icon: 'umbrella'
  },
  {
    id: 'cat-nature',
    title: 'Nature & Orchards',
    count: '28+ Trails',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    icon: 'trees'
  },
  {
    id: 'cat-water',
    title: 'Water & Scuba',
    count: '15+ Centers',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    icon: 'waves'
  },
  {
    id: 'cat-heritage',
    title: 'Historic Sea Forts',
    count: '18+ Forts',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    icon: 'castle'
  },
  {
    id: 'cat-food',
    title: 'Malvani Gastronomy',
    count: '50+ Eateries',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    icon: 'utensils'
  },
  {
    id: 'cat-adventure',
    title: 'Coastal Adventure',
    count: '20+ Activities',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
    icon: 'compass'
  }
];

const EXPERIENCES_DATA = [
  {
    id: 'exp-01',
    title: 'Tarkarli PADI Certified Coral Scuba Diving',
    location: 'Tarkarli, Sindhudurg',
    category: 'Water Sports',
    price: 1850,
    duration: '2.5 Hours',
    rating: 4.95,
    reviewsCount: 340,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    highlights: ['Underwater video included', 'Certified PADI instructors', 'Beginner friendly in calm bay']
  },
  {
    id: 'exp-02',
    title: 'Sindhudurg Sea Fort Heritage Boat Expedition',
    location: 'Malvan Coast',
    category: 'Heritage Trail',
    price: 650,
    duration: '3 Hours',
    rating: 4.88,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    highlights: ['Boat ride to island fort', 'Historian guide story session', 'Shivaji Maharaj footprint site']
  },
  {
    id: 'exp-03',
    title: 'Karli River Estuary Sunset Kayak Safari',
    location: 'Devbagh Sangam',
    category: 'Adventure & Nature',
    price: 850,
    duration: '2 Hours',
    rating: 4.92,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
    highlights: ['Golden hour sunset over Arabian sea', 'Mangrove bird watching', 'High-end double/single kayaks']
  },
  {
    id: 'exp-04',
    title: 'Authentic Malvani Seafood Cooking & Spice Trail',
    location: 'Ratnagiri Village',
    category: 'Culinary Masterclass',
    price: 1200,
    duration: '4 Hours',
    rating: 4.98,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    highlights: ['Fish market tour with local chef', 'Stone ground masala preparation', 'Full feast with Solkadhi & Kombdi Vade']
  }
];

const TRUST_POINTS_DATA = [
  {
    id: 'trust-01',
    icon: 'shield-check',
    title: '100% Verified Stays',
    desc: 'Every homestay, heritage wada, and coastal villa is personally inspected for hygiene, safety, and authentic local hosts.'
  },
  {
    id: 'trust-02',
    icon: 'compass',
    title: 'Authentic Local Experiences',
    desc: 'Led by native Konkani boaters, certified divers, and local historians who share the true coastal heritage.'
  },
  {
    id: 'trust-03',
    icon: 'credit-card',
    title: 'Transparent & Easy Booking',
    desc: 'Clear upfront pricing with no hidden resort surcharges, instant SMS/WhatsApp vouchers, and hassle-free cancellation.'
  },
  {
    id: 'trust-04',
    icon: 'headphones',
    title: '24/7 Coastal Concierge',
    desc: 'Local on-ground travel assistance before and during your journey to ensure a flawless Konkan coastal holiday.'
  }
];

/**
 * Screen 02 — Search Suggestions & Entities Data
 * Structured entities with type: 'DESTINATION' | 'PROPERTY' | 'LOCATION'
 */
const SEARCH_SUGGESTIONS_DATA = [
  // --- DESTINATIONS ---
  {
    id: 'sug-dest-01',
    name: 'Dapoli',
    type: 'DESTINATION',
    location: 'Maharashtra · Ratnagiri District',
    destination: 'Dapoli',
    propertyCount: 124,
    badge: '120+ stays',
    slug: 'dapoli',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tags: ['dapoli', 'ratnagiri', 'karde', 'murud', 'dolphin']
  },
  {
    id: 'sug-dest-02',
    name: 'Tarkarli & Devbagh',
    type: 'DESTINATION',
    location: 'Maharashtra · Sindhudurg District',
    destination: 'Tarkarli',
    propertyCount: 88,
    badge: '85+ stays',
    slug: 'tarkarli',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    tags: ['tarkarli', 'devbagh', 'sindhudurg', 'scuba', 'sangam']
  },
  {
    id: 'sug-dest-03',
    name: 'Ganpatipule',
    type: 'DESTINATION',
    location: 'Maharashtra · Ratnagiri District',
    destination: 'Ganpatipule',
    propertyCount: 65,
    badge: '60+ stays',
    slug: 'ganpatipule',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80',
    tags: ['ganpatipule', 'temple', 'aare ware', 'ratnagiri']
  },
  {
    id: 'sug-dest-04',
    name: 'Malvan',
    type: 'DESTINATION',
    location: 'Maharashtra · Sindhudurg District',
    destination: 'Malvan',
    propertyCount: 76,
    badge: '70+ stays',
    slug: 'malvan',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
    tags: ['malvan', 'sindhudurg fort', 'chivla', 'seafood']
  },
  {
    id: 'sug-dest-05',
    name: 'Alibaug',
    type: 'DESTINATION',
    location: 'Maharashtra · Raigad District',
    destination: 'Alibaug',
    propertyCount: 142,
    badge: '140+ stays',
    slug: 'alibaug',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    tags: ['alibaug', 'kihim', 'nagaon', 'raigad', 'villas']
  },
  {
    id: 'sug-dest-06',
    name: 'Ratnagiri',
    type: 'DESTINATION',
    location: 'Maharashtra · Ratnagiri District',
    destination: 'Ratnagiri',
    propertyCount: 52,
    badge: '50+ stays',
    slug: 'ratnagiri',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    tags: ['ratnagiri', 'guhagar', 'alphonso', 'thiba', 'wada']
  },
  {
    id: 'sug-dest-07',
    name: 'Guhagar & Velas',
    type: 'DESTINATION',
    location: 'Maharashtra · Ratnagiri District',
    destination: 'Guhagar',
    propertyCount: 34,
    badge: '30+ stays',
    slug: 'guhagar',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tags: ['guhagar', 'velas', 'turtle festival', 'virgin beach']
  },
  {
    id: 'sug-dest-08',
    name: 'Vengurla',
    type: 'DESTINATION',
    location: 'Maharashtra · Sindhudurg District',
    destination: 'Vengurla',
    propertyCount: 28,
    badge: '25+ stays',
    slug: 'vengurla',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    tags: ['vengurla', 'shiroda', 'sagareshwar', 'cashew']
  },

  // --- PROPERTIES ---
  {
    id: 'sug-prop-01',
    name: 'Dapoli Beach Resort',
    type: 'PROPERTY',
    location: 'Murud Beach Road, Dapoli',
    destination: 'Dapoli',
    stayId: 'stay-03',
    propertyCount: 1,
    badge: '₹5,800/night · 4.8★',
    slug: 'dapoli-beach-resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    tags: ['dapoli beach resort', 'dapoli', 'resort', 'murud', 'pool']
  },
  {
    id: 'sug-prop-02',
    name: 'The Blue Lagoon Beachfront Villa',
    type: 'PROPERTY',
    location: 'Tarkarli Beach Front, Sindhudurg',
    destination: 'Tarkarli',
    stayId: 'stay-01',
    propertyCount: 1,
    badge: '₹6,400/night · 4.9★',
    slug: 'the-blue-lagoon-villa',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
    tags: ['blue lagoon', 'tarkarli', 'beachfront', 'villa', 'sindhudurg']
  },
  {
    id: 'sug-prop-03',
    name: 'Wada 1892 Heritage Konkan Estate',
    type: 'PROPERTY',
    location: 'Ratnagiri Mango Orchard Belt',
    destination: 'Ratnagiri',
    stayId: 'stay-02',
    propertyCount: 1,
    badge: '₹4,800/night · 4.9★',
    slug: 'wada-1892-heritage',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    tags: ['wada 1892', 'heritage', 'ratnagiri', 'mango orchard', 'estate']
  },
  {
    id: 'sug-prop-04',
    name: 'Cliffside Ocean Song Eco Resort',
    type: 'PROPERTY',
    location: 'Karde Cliff Road, Dapoli',
    destination: 'Dapoli',
    stayId: 'stay-03',
    propertyCount: 1,
    badge: '₹7,200/night · 4.95★',
    slug: 'cliffside-ocean-song',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    tags: ['cliffside ocean song', 'dapoli', 'cliffside', 'karde', 'dolphin']
  },
  {
    id: 'sug-prop-05',
    name: 'Devbagh Estuary Palms Homestay',
    type: 'PROPERTY',
    location: 'Karli Riverfront, Devbagh',
    destination: 'Tarkarli',
    stayId: 'stay-04',
    propertyCount: 1,
    badge: '₹3,900/night · 4.85★',
    slug: 'devbagh-estuary-palms',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80',
    tags: ['devbagh estuary palms', 'tarkarli', 'devbagh', 'homestay', 'kayak']
  },
  {
    id: 'sug-prop-06',
    name: 'Alibaug Coconut Grove Pool Villa',
    type: 'PROPERTY',
    location: 'Kihim Coconut Belt, Alibaug',
    destination: 'Alibaug',
    stayId: 'stay-05',
    propertyCount: 1,
    badge: '₹12,500/night · 4.9★',
    slug: 'alibaug-coconut-grove',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    tags: ['alibaug coconut grove', 'alibaug', 'villa', 'pool', 'kihim']
  },
  {
    id: 'sug-prop-07',
    name: 'Ganpatipule Sea Cliff Retreat',
    type: 'PROPERTY',
    location: 'Aare Ware Road, Ganpatipule',
    destination: 'Ganpatipule',
    stayId: 'stay-06',
    propertyCount: 1,
    badge: '₹5,200/night · 4.88★',
    slug: 'ganpatipule-sea-cliff',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80',
    tags: ['ganpatipule sea cliff', 'ganpatipule', 'retreat', 'aare ware']
  },

  // --- LOCATIONS ---
  {
    id: 'sug-loc-01',
    name: 'Dapoli Beach',
    type: 'LOCATION',
    location: 'Dapoli, Maharashtra',
    destination: 'Dapoli',
    propertyCount: 38,
    badge: 'Dolphin Point',
    slug: 'dapoli-beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tags: ['dapoli beach', 'dapoli', 'karde', 'murud', 'beach', 'sunset']
  },
  {
    id: 'sug-loc-02',
    name: 'Karde Beach',
    type: 'LOCATION',
    location: 'Dapoli, Ratnagiri District',
    destination: 'Dapoli',
    propertyCount: 22,
    badge: 'Dolphin Safari Hub',
    slug: 'karde-beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tags: ['karde beach', 'dapoli', 'dolphin', 'soft sand', 'watersports']
  },
  {
    id: 'sug-loc-03',
    name: 'Murud Beach',
    type: 'LOCATION',
    location: 'Dapoli, Ratnagiri',
    destination: 'Dapoli',
    propertyCount: 26,
    badge: 'Parasailing Beach',
    slug: 'murud-beach-dapoli',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tags: ['murud beach', 'dapoli', 'parasailing', 'atv rides']
  },
  {
    id: 'sug-loc-04',
    name: 'Sindhudurg Sea Fort',
    type: 'LOCATION',
    location: 'Malvan Coast, Sindhudurg',
    destination: 'Malvan',
    propertyCount: 42,
    badge: 'Heritage Island Fort',
    slug: 'sindhudurg-sea-fort',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    tags: ['sindhudurg fort', 'malvan', 'sea fort', 'shivaji maharaj', 'island']
  },
  {
    id: 'sug-loc-05',
    name: 'Devbagh Sangam & Tsunami Island',
    type: 'LOCATION',
    location: 'Tarkarli, Sindhudurg',
    destination: 'Tarkarli',
    propertyCount: 35,
    badge: 'River & Sea Confluence',
    slug: 'devbagh-sangam',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
    tags: ['devbagh sangam', 'tsunami island', 'tarkarli', 'karli river', 'watersports']
  },
  {
    id: 'sug-loc-06',
    name: 'Aare Ware Coastal Cliff Drive',
    type: 'LOCATION',
    location: 'Ganpatipule - Ratnagiri Road',
    destination: 'Ganpatipule',
    propertyCount: 29,
    badge: 'Scenic Ocean Highway',
    slug: 'aare-ware-cliffs',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80',
    tags: ['aare ware', 'ganpatipule', 'coastal drive', 'viewpoint', 'cliff']
  },
  {
    id: 'sug-loc-07',
    name: 'Kolaba Sea Fort & Kihim Beach',
    type: 'LOCATION',
    location: 'Alibaug, Raigad',
    destination: 'Alibaug',
    propertyCount: 64,
    badge: 'Historic Low-Tide Fort',
    slug: 'kolaba-fort-alibaug',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    tags: ['kolaba fort', 'kihim', 'alibaug', 'horse cart', 'raigad']
  }
];

/**
 * Regional Discovery Data ("Explore Konkan by region")
 */
const REGIONS_DATA = [
  {
    id: 'region-north',
    name: 'North Konkan',
    district: 'Raigad District',
    description: 'Boutique luxury pool villas, historic island sea forts, and serene palm groves with swift access from Mumbai & Pune.',
    staysCount: 140,
    destinations: ['Alibaug', 'Kihim', 'Murud-Janjira', 'Kashid', 'Nagaon'],
    highlights: ['Kolaba Island Fort', 'Boutique Villas', 'Water Sports'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    badge: 'Gateway to Konkan'
  },
  {
    id: 'region-central',
    name: 'Central Konkan',
    district: 'Ratnagiri District',
    description: 'Heritage laterite wadas, 12-acre Alphonso mango orchards, dramatic ocean cliffs, and serene dolphin safaris.',
    staysCount: 185,
    destinations: ['Dapoli', 'Ganpatipule', 'Ratnagiri', 'Guhagar', 'Velas'],
    highlights: ['Alphonso Mango Trails', 'Dolphin Watching', 'Heritage Wadas'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    badge: 'Mango Trails & Cliffs'
  },
  {
    id: 'region-south',
    name: 'South Konkan',
    district: 'Sindhudurg District',
    description: 'Crystal-clear Arabian sea waters, coral reef scuba diving, legendary Chhatrapati Shivaji forts, and authentic Malvani thalis.',
    staysCount: 156,
    destinations: ['Tarkarli', 'Malvan', 'Devbagh', 'Vengurla', 'Sawantwadi'],
    highlights: ['PADI Scuba Diving', 'Sindhudurg Fort', 'Fresh Malvani Catch'],
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    badge: 'Coral Reefs & Forts'
  }
];

/**
 * Default Recent Searches for instant demonstration
 */
const INITIAL_SEARCH_HISTORY = [
  {
    id: 'hist-01',
    destination: 'Dapoli',
    location: 'Ratnagiri District · 120+ stays',
    type: 'DESTINATION',
    timestamp: '2 hours ago'
  },
  {
    id: 'hist-02',
    destination: 'Tarkarli',
    location: 'Sindhudurg District · 85+ stays',
    type: 'DESTINATION',
    timestamp: 'Yesterday'
  },
  {
    id: 'hist-03',
    destination: 'Ganpatipule',
    location: 'Ratnagiri District · 60+ stays',
    type: 'DESTINATION',
    timestamp: '3 days ago'
  }
];

/**
 * Screen 03 — Destination Availability & Booking Rules
 * Represents backend inventory rules connecting Owner Property/Room systems to Customer Booking
 */
const DESTINATION_AVAILABILITY_RULES = {
  'dapoli': {
    destinationId: 'dest-dapoli',
    name: 'Dapoli',
    district: 'Ratnagiri District',
    state: 'Maharashtra',
    minimumStay: 2,
    maximumStay: 14,
    minAdvanceDays: 0,
    maxAdvanceDays: 180,
    maxGuestsPerRoom: 4,
    seasonalNotice: 'Monsoon special: Flexible 24h cancellation on coastal cliff villas.',
    pricingRange: '₹3,800 – ₹12,500 / night',
    availableRoomsEstimate: 42
  },
  'tarkarli': {
    destinationId: 'dest-tarkarli',
    name: 'Tarkarli & Devbagh',
    district: 'Sindhudurg District',
    state: 'Maharashtra',
    minimumStay: 2,
    maximumStay: 14,
    minAdvanceDays: 0,
    maxAdvanceDays: 180,
    maxGuestsPerRoom: 4,
    seasonalNotice: 'Scuba diving & water sports operating in sheltered Karli estuary.',
    pricingRange: '₹3,400 – ₹14,000 / night',
    availableRoomsEstimate: 38
  },
  'ganpatipule': {
    destinationId: 'dest-ganpatipule',
    name: 'Ganpatipule',
    district: 'Ratnagiri District',
    state: 'Maharashtra',
    minimumStay: 1,
    maximumStay: 21,
    minAdvanceDays: 0,
    maxAdvanceDays: 180,
    maxGuestsPerRoom: 3,
    seasonalNotice: 'Temple coastal road & beach wadas open year-round.',
    pricingRange: '₹2,900 – ₹8,500 / night',
    availableRoomsEstimate: 29
  },
  'malvan': {
    destinationId: 'dest-malvan',
    name: 'Malvan',
    district: 'Sindhudurg District',
    state: 'Maharashtra',
    minimumStay: 2,
    maximumStay: 14,
    minAdvanceDays: 0,
    maxAdvanceDays: 180,
    maxGuestsPerRoom: 4,
    seasonalNotice: 'Sea fort boat safari operates based on sea conditions.',
    pricingRange: '₹2,600 – ₹9,200 / night',
    availableRoomsEstimate: 35
  },
  'alibaug': {
    destinationId: 'dest-alibaug',
    name: 'Alibaug',
    district: 'Raigad District',
    state: 'Maharashtra',
    minimumStay: 2,
    maximumStay: 14,
    minAdvanceDays: 0,
    maxAdvanceDays: 180,
    maxGuestsPerRoom: 5,
    seasonalNotice: 'Weekend luxury pool villa tariffs apply (Fri–Sun).',
    pricingRange: '₹5,500 – ₹28,000 / night',
    availableRoomsEstimate: 64
  },
  'ratnagiri': {
    destinationId: 'dest-ratnagiri',
    name: 'Ratnagiri',
    district: 'Ratnagiri District',
    state: 'Maharashtra',
    minimumStay: 1,
    maximumStay: 21,
    minAdvanceDays: 0,
    maxAdvanceDays: 180,
    maxGuestsPerRoom: 4,
    seasonalNotice: 'Authentic 130-year wada courtyard stays with Alphonso farm meals.',
    pricingRange: '₹2,800 – ₹7,800 / night',
    availableRoomsEstimate: 31
  }
};

/**
 * Screen 06 — Logged-in Customer Profile Simulation & Checkout Data
 */
const CUSTOMER_PROFILE_MOCK = {
  customerId: 'cust-98201',
  firstName: 'Aniket',
  lastName: 'Kulkarni',
  email: 'aniket.kulkarni@example.com',
  phone: '9820194820',
  city: 'Pune',
  state: 'Maharashtra',
  savedCompany: {
    name: 'Kulkarni Design Studio LLP',
    gstin: '27AABCK1234F1Z8',
    address: '42, Deccan Gymkhana, Pune 411004'
  }
};

const SPECIAL_REQUESTS_PRESETS = [
  'Ground floor room requested',
  'Late check-in (after 8:00 PM)',
  'Extra pillows & towels',
  'Pure vegetarian / Jain food preference',
  'Quiet corner room with garden view'
];



