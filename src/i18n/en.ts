export default {
  // Common
  common: {
    error: "Error",
    cancel: "Cancel",
    ok: "OK",
    new: "New",
    xafPerHour: "XAF/hr",
    cameroon: "Cameroon",
    reviews: "reviews",
    delete: "Delete",
    reset: "Reset",
    goBack: "Go Back",
    save: "Save",
  },

  // Tab labels
  tabs: {
    home: "Home",
    favorites: "Favorites",
    manage: "Manage",
  },

  // Screen titles
  screens: {
    technicianDetails: "Technician Details",
    addTechnician: "Add Technician",
    editTechnician: "Edit Technician",
    manageTechnicians: "Manage Technicians",
  },

  // Home screen
  home: {
    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    heroTitle: "Find the perfect technician",
    experts: "Experts",
    available: "Available",
    cities: "Cities",
    featuredExpert: "Featured Expert",
    results: "Results",
    allTechnicians: "All Technicians",
    noTechniciansTitle: "No technicians found",
    noTechniciansFiltered: "Try adjusting your search or filters to see more results.",
    noTechniciansEmpty: "No technicians available. Check back later!",
    filterDescription: "{{skill}} in {{location}} matching \"{{query}}\"",
    technicians: "Technicians",
  },

  // Skills
  skills: {
    Plumber: "Plumber",
    Electrician: "Electrician",
    Carpenter: "Carpenter",
    Mason: "Mason",
    Painter: "Painter",
  },

  // Skill short labels (for filter icons)
  skillShort: {
    Plumber: "Plumber",
    Electrician: "Electric",
    Carpenter: "Carpent.",
    Mason: "Mason",
    Painter: "Painter",
  },

  // Availability
  availability: {
    available: "Available",
    busy: "Busy",
    offline: "Offline",
    availableNow: "Available Now",
    currentlyBusy: "Currently Busy",
  },

  // Sort options
  sort: {
    topRated: "Top Rated",
    mostExperienced: "Most Experienced",
    priceLowToHigh: "Price: Low to High",
    priceHighToLow: "Price: High to Low",
  },

  // Filter bar
  filters: {
    filters: "Filters",
    clear: "Clear",
    advancedFilters: "Advanced Filters",
    city: "City",
    sortBy: "Sort By",
    applyFilters: "Apply Filters",
  },

  // Search bar
  search: {
    placeholder: "Search by name, skill, or city...",
  },

  // Technician card
  card: {
    topRated: "Top Rated",
  },

  // Technician detail screen
  detail: {
    notFoundTitle: "Technician not found",
    notFoundMessage: "The technician you're looking for doesn't exist or has been removed.",
    yearsExp: "Years Exp.",
    jobsDone: "Jobs Done",
    about: "About",
    contactInfo: "Contact Information",
    location: "Location",
    phoneNumber: "Phone Number",
    call: "Call {{name}}",
    removeFromFavorites: "Remove from Favorites",
    addToFavorites: "Add to Favorites",
    cannotCallTitle: "Cannot Make Call",
    cannotCallMessage: "Phone calling is not supported on this device.",
    failedCall: "Failed to open phone app.",
  },

  // Admin screen
  admin: {
    title: "Technician Management",
    registered: "{{count}} technicians registered",
    addTechnician: "Add Technician",
    noTechniciansTitle: "No technicians",
    noTechniciansMessage: "Add your first technician using the button above.",
    deleteTitle: "Delete Technician",
    deleteMessage: "Are you sure you want to delete {{name}}?",
    deleteFailed: "Failed to delete technician.",
    resetTitle: "Reset Data",
    resetMessage: "This will restore all technicians to the original sample data. Continue?",
    resetFailed: "Failed to reset data.",
  },

  // Favorites screen
  favorites: {
    title: "Your Favorites",
    countSingular: "{{count}} technician saved",
    countPlural: "{{count}} technicians saved",
    emptyTitle: "No favorites yet",
    emptyMessage: "Tap the heart icon on a technician's profile to save them here for quick access.",
  },

  // Add technician form
  form: {
    newTechnician: "New Technician",
    enterDetails: "Enter the technician's details below",
    updateInfo: "Update {{name}}'s information",
    basicInfo: "Basic Information",
    professionalDetails: "Professional Details",
    fullName: "Full Name",
    fullNamePlaceholder: "e.g., Jean-Pierre Nkomo",
    skillTrade: "Skill / Trade",
    selectSkill: "Select a skill",
    phoneNumber: "Phone Number",
    phonePlaceholder: "e.g., +237 6 70 12 34 56",
    locationLabel: "Location",
    selectCity: "Select a city",
    yearsOfExperience: "Years of Experience",
    yearsPlaceholder: "e.g., 5",
    hourlyRate: "Hourly Rate (XAF)",
    ratePlaceholder: "e.g., 5000",
    availabilityLabel: "Availability",
    selectAvailability: "Select availability",
    bioLabel: "Bio / Description (Optional)",
    bioPlaceholder: "Describe specialties, certifications, approach...",
    adding: "Adding...",
    saving: "Saving...",
    saveChanges: "Save Changes",
    addFailed: "Failed to add technician. Please try again.",
    updateFailed: "Failed to update technician. Please try again.",
    technicianNotFound: "Technician Not Found",
  },

  // Validation
  validation: {
    nameRequired: "Name is required",
    nameMinLength: "Name must be at least 2 characters",
    selectSkill: "Please select a skill",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Please enter a valid phone number",
    selectLocation: "Please select a location",
    experienceRequired: "Experience is required",
    experienceInvalid: "Enter a valid number (0-50)",
    rateRequired: "Hourly rate is required",
    rateInvalid: "Enter a valid rate (500-100,000 XAF)",
    selectAvailability: "Please select availability",
  },

  // Select field
  selectField: {
    selectOption: "Select an option",
  },
};
