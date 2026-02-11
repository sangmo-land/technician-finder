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
    yearsShort: "yr",
  },

  // Tab labels
  tabs: {
    home: "Home",
    favorites: "Favorites",
    manage: "Manage",
    profile: "Profile",
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
    noTechniciansFiltered:
      "Try adjusting your search or filters to see more results.",
    noTechniciansEmpty: "No technicians available. Check back later!",
    filterDescription: '{{skill}} in {{location}} matching "{{query}}"',
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
    notFoundMessage:
      "The technician you're looking for doesn't exist or has been removed.",
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
    resetMessage:
      "This will restore all technicians to the original sample data. Continue?",
    resetFailed: "Failed to reset data.",
    noAccess:
      "You don't have permission to access this page. Only administrators can manage technicians.",
    tabTechnicians: "Technicians",
    tabAdmins: "Admins",
    addNewAdmin: "Add New Admin",
    addNewAdminDesc: "Enter the email of the user to promote",
    emailPlaceholder: "user@email.com",
    currentAdmins: "Current Admins",
    noAdmins: "No admins found",
    promoteSuccess: "User promoted to admin",
    promoteFailed: "Failed to promote user. Make sure the email is correct.",
    demoteConfirmTitle: "Remove Admin",
    demoteConfirmMessage: "Remove admin access for {{name}}?",
    demote: "Remove",
    demoteFailed: "Failed to remove admin role",
    cannotDemoteSelf: "You cannot remove your own admin access.",
    you: "You",
  },

  // Favorites screen
  favorites: {
    title: "Your Favorites",
    countSingular: "{{count}} technician saved",
    countPlural: "{{count}} technicians saved",
    emptyTitle: "No favorites yet",
    emptyMessage:
      "Tap the heart icon on a technician's profile to save them here for quick access.",
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

  // Gallery
  gallery: {
    title: "Work Gallery",
    formTitle: "Work Gallery (Optional)",
    addPhotos: "Add Photos",
    takePhoto: "Take Photo",
    chooseFromLibrary: "Choose from Library",
    photoCount: "{{count}} photo(s)",
    removePhoto: "Remove Photo",
    removePhotoMessage: "Are you sure you want to remove this photo?",
    permissionRequired: "Permission Required",
    cameraPermission: "Camera access is needed to take photos.",
    libraryPermission: "Photo library access is needed to select images.",
    maxPhotos: "Maximum {{max}} photos allowed",
    emptyGallery: "No work photos yet",
    viewFullscreen: "Tap to view",
  },

  // Profile
  profile: {
    guest: "Guest",
    account: "Account",
    name: "Name",
    email: "Email",
    app: "App",
    language: "Language",
    currentLanguage: "English",
    version: "Version",
    signOutTitle: "Sign Out",
    signOutMessage: "Are you sure you want to sign out?",
    signOutFailed: "Failed to sign out. Please try again.",
    technicianSection: "Technician",
    alreadyTechnician: "You are registered as a technician",
    viewMyProfile: "View My Technician Profile",
    becomeTechnician: "Become a Technician",
    becomeTechnicianDesc:
      "Register as a technician to offer your services and get discovered by clients.",
    registerNow: "Register Now",
    technicianRegistration: "Technician Registration",
    technicianRegistrationDesc:
      "Fill in your details to register as a technician",
    phoneNumber: "Phone Number",
    phonePlaceholder: "e.g., +237 6 70 12 34 56",
    location: "Location",
    selectCity: "Select a city",
    skillTrade: "Skill / Trade",
    selectSkill: "Select a skill",
    yearsOfExperience: "Years of Experience",
    yearsPlaceholder: "e.g., 5",
    hourlyRate: "Hourly Rate (XAF)",
    ratePlaceholder: "e.g., 5000",
    availability: "Availability",
    selectAvailability: "Select availability",
    bio: "Bio / Description (Optional)",
    bioPlaceholder: "Describe your specialties, certifications, approach...",
    registering: "Registering...",
    completeRegistration: "Complete Registration",
    registrationSuccess: "Registration Successful",
    registrationSuccessMsg:
      "You are now registered as a technician! Clients can find you in the directory.",
    registrationFailed: "Registration failed. Please try again.",
    editMyProfile: "Edit My Technician Profile",
    editTechnicianProfile: "Edit Technician Profile",
    editTechnicianProfileDesc: "Update your details and work gallery",
    saveChanges: "Save Changes",
    saving: "Saving...",
    updateSuccess: "Profile Updated",
    updateSuccessMsg: "Your technician profile has been updated successfully.",
    updateFailed: "Update failed. Please try again.",
  },

  // Auth
  auth: {
    welcomeBack: "Welcome Back",
    signInSubtitle: "Sign in to find the best technicians near you",
    createAccount: "Create Account",
    signUpSubtitle: "Join us to discover skilled technicians",
    email: "Email",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    fullName: "Full Name",
    fullNamePlaceholder: "e.g., Jean-Pierre Nkomo",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    fillAllFields: "Please fill in all fields.",
    passwordsMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    signInFailed: "Sign in failed. Please check your credentials.",
    signUpFailed: "Sign up failed. Please try again.",
    orContinueWith: "OR",
    continueWithGoogle: "Continue with Google",
    signUpWithGoogle: "Sign up with Google",
    googleFailed: "Google sign-in failed. Please try again.",
  },

  // Notifications
  notifications: {
    newUserTitle: "New User Joined! \uD83C\uDF89",
    newUserBody: "{{name}} just joined Technician Finder",
    newUserBodyWithLocation: "{{name}} from {{location}} just joined Technician Finder",
  },
};
