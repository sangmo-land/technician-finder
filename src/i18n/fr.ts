export default {
  // Common
  common: {
    error: "Erreur",
    cancel: "Annuler",
    ok: "OK",
    new: "Nouveau",
    xafPerHour: "XAF/h",
    cameroon: "Cameroun",
    reviews: "avis",
    delete: "Supprimer",
    reset: "Réinitialiser",
    goBack: "Retour",
    save: "Enregistrer",
    yearsShort: "an",
  },

  // Tab labels
  tabs: {
    home: "Accueil",
    favorites: "Favoris",
    manage: "Gérer",
    profile: "Profil",
  },

  // Screen titles
  screens: {
    technicianDetails: "Détails du technicien",
    addTechnician: "Ajouter un technicien",
    editTechnician: "Modifier le technicien",
    manageTechnicians: "Gérer les techniciens",
  },

  // Home screen
  home: {
    greetingMorning: "Bonjour",
    greetingAfternoon: "Bon après-midi",
    greetingEvening: "Bonsoir",
    heroTitle: "Trouvez le technicien idéal",
    experts: "Experts",
    available: "Disponibles",
    cities: "Villes",
    featuredExpert: "Expert en vedette",
    results: "Résultats",
    allTechnicians: "Tous les techniciens",
    noTechniciansTitle: "Aucun technicien trouvé",
    noTechniciansFiltered:
      "Essayez d'ajuster votre recherche ou vos filtres pour voir plus de résultats.",
    noTechniciansEmpty: "Aucun technicien disponible. Revenez plus tard !",
    filterDescription: '{{skill}} à {{location}} correspondant à "{{query}}"',
    technicians: "Techniciens",
    recentlyViewed: "Vus récemment",
    seeAll: "Voir tout",
  },

  // Skills
  skills: {
    Plumber: "Plombier",
    Electrician: "Électricien",
    Carpenter: "Menuisier",
    Mason: "Maçon",
    Painter: "Peintre",
  },

  // Skill short labels (for filter icons)
  skillShort: {
    Plumber: "Plombier",
    Electrician: "Électr.",
    Carpenter: "Menuis.",
    Mason: "Maçon",
    Painter: "Peintre",
  },

  // Availability
  availability: {
    available: "Disponible",
    busy: "Occupé",
    offline: "Hors ligne",
    availableNow: "Disponible maintenant",
    currentlyBusy: "Actuellement occupé",
  },

  // Sort options
  sort: {
    topRated: "Mieux noté",
    mostExperienced: "Plus expérimenté",
    priceLowToHigh: "Prix : croissant",
    priceHighToLow: "Prix : décroissant",
  },

  // Filter bar
  filters: {
    filters: "Filtres",
    clear: "Effacer",
    advancedFilters: "Filtres avancés",
    city: "Ville",
    sortBy: "Trier par",
    applyFilters: "Appliquer les filtres",
  },

  // Search bar
  search: {
    placeholder: "Rechercher par nom, métier ou ville...",
  },

  // Technician card
  card: {
    topRated: "Mieux noté",
    views: "vues",
    memberSince: "Membre depuis {{date}}",
  },

  // Technician detail screen
  detail: {
    notFoundTitle: "Technicien introuvable",
    notFoundMessage:
      "Le technicien que vous recherchez n'existe pas ou a été supprimé.",
    yearsExp: "Ans d'exp.",
    jobsDone: "Travaux",
    about: "À propos",
    contactInfo: "Coordonnées",
    location: "Localisation",
    phoneNumber: "Numéro de téléphone",
    call: "Appeler {{name}}",
    removeFromFavorites: "Retirer des favoris",
    addToFavorites: "Ajouter aux favoris",
    cannotCallTitle: "Appel impossible",
    cannotCallMessage:
      "Les appels téléphoniques ne sont pas pris en charge sur cet appareil.",
    failedCall: "Impossible d'ouvrir l'application téléphone.",
    whatsapp: "WhatsApp {{name}}",
    whatsappGreeting:
      "Bonjour {{name}}, j'ai trouvé votre profil sur Technician Finder et j'aimerais discuter d'un travail.",
    whatsappFailed:
      "Impossible d'ouvrir WhatsApp. Assurez-vous qu'il est installé.",
    share: "Partager",
    shareTitle: "Découvrez {{name}} sur Technician Finder !",
    shareMessage:
      "{{name}} - {{skills}}\n📍 {{location}}\n📞 {{phone}}\n\nTrouvé sur Technician Finder",
    shareFailed: "Impossible de partager ce profil.",
    memberSince: "Membre depuis {{date}}",
  },

  // Admin screen
  admin: {
    title: "Gestion des techniciens",
    registered: "{{count}} techniciens inscrits",
    addTechnician: "Ajouter un technicien",
    noTechniciansTitle: "Aucun technicien",
    noTechniciansMessage:
      "Ajoutez votre premier technicien en utilisant le bouton ci-dessus.",
    deleteTitle: "Supprimer le technicien",
    deleteMessage: "Êtes-vous sûr de vouloir supprimer {{name}} ?",
    deleteFailed: "Échec de la suppression du technicien.",
    resetTitle: "Réinitialiser les données",
    resetMessage:
      "Cela restaurera tous les techniciens aux données d'exemple d'origine. Continuer ?",
    resetFailed: "Échec de la réinitialisation des données.",
    noAccess:
      "Vous n'avez pas la permission d'accéder à cette page. Seuls les administrateurs peuvent gérer les techniciens.",
    tabTechnicians: "Techniciens",
    tabAdmins: "Admins",
    addNewAdmin: "Ajouter un admin",
    addNewAdminDesc: "Entrez l'email de l'utilisateur à promouvoir",
    emailPlaceholder: "utilisateur@email.com",
    currentAdmins: "Admins actuels",
    noAdmins: "Aucun admin trouvé",
    promoteSuccess: "Utilisateur promu administrateur",
    promoteFailed: "Impossible de promouvoir l'utilisateur. Vérifiez l'email.",
    demoteConfirmTitle: "Retirer l'accès admin",
    demoteConfirmMessage: "Retirer l'accès admin pour {{name}} ?",
    demote: "Retirer",
    demoteFailed: "Impossible de retirer le rôle admin",
    cannotDemoteSelf: "Vous ne pouvez pas retirer votre propre accès admin.",
    you: "Vous",
  },

  // Favorites screen
  favorites: {
    title: "Vos favoris",
    countSingular: "{{count}} technicien enregistré",
    countPlural: "{{count}} techniciens enregistrés",
    emptyTitle: "Aucun favori",
    emptyMessage:
      "Appuyez sur l'icône cœur sur le profil d'un technicien pour l'enregistrer ici.",
  },

  // Add technician form
  form: {
    newTechnician: "Nouveau technicien",
    enterDetails: "Entrez les détails du technicien ci-dessous",
    updateInfo: "Mettre à jour les informations de {{name}}",
    basicInfo: "Informations de base",
    professionalDetails: "Détails professionnels",
    fullName: "Nom complet",
    fullNamePlaceholder: "ex. Jean-Pierre Nkomo",
    skillTrade: "Métier / Compétence",
    selectSkill: "Sélectionner un métier",
    phoneNumber: "Numéro de téléphone",
    phonePlaceholder: "ex. +237 6 70 12 34 56",
    locationLabel: "Localisation",
    selectCity: "Sélectionner une ville",
    yearsOfExperience: "Années d'expérience",
    yearsPlaceholder: "ex. 5",
    hourlyRate: "Tarif horaire (XAF)",
    ratePlaceholder: "ex. 5000",
    availabilityLabel: "Disponibilité",
    selectAvailability: "Sélectionner la disponibilité",
    bioLabel: "Bio / Description en anglais (Facultatif)",
    bioPlaceholder: "Décrivez les spécialités, certifications, approche...",
    bioLabelFr: "Bio / Description en français (Facultatif)",
    bioPlaceholderFr: "Décrivez les spécialités en français...",
    adding: "Ajout en cours...",
    saving: "Enregistrement...",
    saveChanges: "Enregistrer les modifications",
    addFailed: "Échec de l'ajout du technicien. Veuillez réessayer.",
    updateFailed: "Échec de la mise à jour du technicien. Veuillez réessayer.",
    technicianNotFound: "Technicien introuvable",
  },

  // Validation
  validation: {
    nameRequired: "Le nom est obligatoire",
    nameMinLength: "Le nom doit contenir au moins 2 caractères",
    selectSkill: "Veuillez sélectionner un métier",
    phoneRequired: "Le numéro de téléphone est obligatoire",
    phoneInvalid: "Veuillez entrer un numéro de téléphone valide",
    selectLocation: "Veuillez sélectionner une localisation",
    experienceRequired: "L'expérience est obligatoire",
    experienceInvalid: "Entrez un nombre valide (0-50)",
    rateRequired: "Le tarif horaire est obligatoire",
    rateInvalid: "Entrez un tarif valide (500-100 000 XAF)",
    selectAvailability: "Veuillez sélectionner la disponibilité",
  },

  // Select field
  selectField: {
    selectOption: "Sélectionner une option",
  },

  // Multi-select field
  multiSelect: {
    selected: "sélectionné(s)",
    maxHint: "Sélectionnez jusqu'à {{max}}",
    done: "Terminé",
  },

  // Gallery
  gallery: {
    title: "Galerie de travaux",
    formTitle: "Galerie de travaux (Facultatif)",
    addPhotos: "Ajouter des photos",
    takePhoto: "Prendre une photo",
    chooseFromLibrary: "Choisir de la galerie",
    photoCount: "{{count}} photo(s)",
    removePhoto: "Supprimer la photo",
    removePhotoMessage: "Êtes-vous sûr de vouloir supprimer cette photo ?",
    permissionRequired: "Autorisation requise",
    cameraPermission:
      "L'accès à la caméra est nécessaire pour prendre des photos.",
    libraryPermission:
      "L'accès à la photothèque est nécessaire pour sélectionner des images.",
    maxPhotos: "Maximum {{max}} photos autorisées",
    emptyGallery: "Aucune photo de travaux",
    viewFullscreen: "Appuyez pour voir",
  },

  // Profile
  profile: {
    guest: "Invité",
    account: "Compte",
    name: "Nom",
    email: "Email",
    app: "Application",
    language: "Langue",
    currentLanguage: "Français",
    version: "Version",
    signOutTitle: "Déconnexion",
    signOutMessage: "Êtes-vous sûr de vouloir vous déconnecter ?",
    signOutFailed: "Échec de la déconnexion. Veuillez réessayer.",
    technicianSection: "Technicien",
    alreadyTechnician: "Vous êtes inscrit en tant que technicien",
    viewMyProfile: "Voir mon profil technicien",
    becomeTechnician: "Devenir technicien",
    becomeTechnicianDesc:
      "Inscrivez-vous en tant que technicien pour offrir vos services et être trouvé par les clients.",
    registerNow: "S'inscrire maintenant",
    technicianRegistration: "Inscription technicien",
    technicianRegistrationDesc:
      "Remplissez vos informations pour vous inscrire en tant que technicien",
    phoneNumber: "Numéro de téléphone",
    phonePlaceholder: "ex. +237 6 70 12 34 56",
    location: "Localisation",
    selectCity: "Sélectionner une ville",
    skillTrade: "Compétence / Métier",
    selectSkill: "Sélectionner une compétence",
    yearsOfExperience: "Années d'expérience",
    yearsPlaceholder: "ex. 5",
    hourlyRate: "Tarif horaire (XAF)",
    ratePlaceholder: "ex. 5000",
    availability: "Disponibilité",
    selectAvailability: "Sélectionner la disponibilité",
    bio: "Bio / Description en anglais (Optionnel)",
    bioPlaceholder: "Décrivez vos spécialités, certifications, approche...",
    bioFr: "Bio / Description en français (Optionnel)",
    bioFrPlaceholder: "Décrivez vos spécialités en français...",
    registering: "Inscription en cours...",
    completeRegistration: "Finaliser l'inscription",
    registrationSuccess: "Inscription réussie",
    registrationSuccessMsg:
      "Vous êtes maintenant inscrit en tant que technicien ! Les clients peuvent vous trouver dans l'annuaire.",
    registrationFailed: "Échec de l'inscription. Veuillez réessayer.",
    editMyProfile: "Modifier mon profil technicien",
    editTechnicianProfile: "Modifier le profil technicien",
    editTechnicianProfileDesc:
      "Mettez à jour vos informations et galerie de travaux",
    saveChanges: "Enregistrer les modifications",
    saving: "Enregistrement...",
    updateSuccess: "Profil mis à jour",
    updateSuccessMsg: "Votre profil technicien a été mis à jour avec succès.",
    updateFailed: "Échec de la mise à jour. Veuillez réessayer.",
    deleteTechProfile: "Supprimer le profil technicien",
    deleteTechTitle: "Supprimer le profil technicien",
    deleteTechMessage:
      "Êtes-vous sûr de vouloir supprimer votre profil technicien ? Cette action est irréversible.",
    deleteTechSuccess: "Profil supprimé",
    deleteTechSuccessMsg: "Votre profil technicien a été supprimé.",
    deleteTechFailed: "Échec de la suppression. Veuillez réessayer.",
    quickAvailability: "Disponibilité",
    availabilityFailed:
      "Échec de la mise à jour de la disponibilité. Veuillez réessayer.",
    changeAvatar: "Changer la photo",
    chooseAvatar: "Photo de profil",
    avatarUpdated: "Avatar mis à jour !",
    avatarFailed: "Échec de la mise à jour de l'avatar. Veuillez réessayer.",
  },

  // Auth
  auth: {
    welcomeBack: "Bon retour",
    signInSubtitle: "Connectez-vous pour trouver les meilleurs techniciens",
    createAccount: "Créer un compte",
    signUpSubtitle: "Rejoignez-nous pour découvrir des techniciens qualifiés",
    email: "Email",
    emailPlaceholder: "votre@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    confirmPasswordPlaceholder: "Ressaisissez votre mot de passe",
    fullName: "Nom complet",
    fullNamePlaceholder: "ex. Jean-Pierre Nkomo",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    signOut: "Se déconnecter",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
    fillAllFields: "Veuillez remplir tous les champs.",
    passwordsMismatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    signInFailed: "Échec de la connexion. Vérifiez vos identifiants.",
    signUpFailed: "Échec de l'inscription. Veuillez réessayer.",
    orContinueWith: "OU",
    continueWithGoogle: "Continuer avec Google",
    signUpWithGoogle: "S'inscrire avec Google",
    googleFailed: "Échec de la connexion Google. Veuillez réessayer.",
  },

  // Notifications
  notifications: {
    newUserTitle: "Nouvel utilisateur ! \uD83C\uDF89",
    newUserBody: "{{name}} vient de rejoindre Technician Finder",
    newUserBodyWithLocation:
      "{{name}} de {{location}} vient de rejoindre Technician Finder",
  },
};
