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
  },

  // Tab labels
  tabs: {
    home: "Accueil",
    favorites: "Favoris",
    manage: "Gérer",
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
    noTechniciansFiltered: "Essayez d'ajuster votre recherche ou vos filtres pour voir plus de résultats.",
    noTechniciansEmpty: "Aucun technicien disponible. Revenez plus tard !",
    filterDescription: "{{skill}} à {{location}} correspondant à \"{{query}}\"",
    technicians: "Techniciens",
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
  },

  // Technician detail screen
  detail: {
    notFoundTitle: "Technicien introuvable",
    notFoundMessage: "Le technicien que vous recherchez n'existe pas ou a été supprimé.",
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
    cannotCallMessage: "Les appels téléphoniques ne sont pas pris en charge sur cet appareil.",
    failedCall: "Impossible d'ouvrir l'application téléphone.",
  },

  // Admin screen
  admin: {
    title: "Gestion des techniciens",
    registered: "{{count}} techniciens inscrits",
    addTechnician: "Ajouter un technicien",
    noTechniciansTitle: "Aucun technicien",
    noTechniciansMessage: "Ajoutez votre premier technicien en utilisant le bouton ci-dessus.",
    deleteTitle: "Supprimer le technicien",
    deleteMessage: "Êtes-vous sûr de vouloir supprimer {{name}} ?",
    deleteFailed: "Échec de la suppression du technicien.",
    resetTitle: "Réinitialiser les données",
    resetMessage: "Cela restaurera tous les techniciens aux données d'exemple d'origine. Continuer ?",
    resetFailed: "Échec de la réinitialisation des données.",
  },

  // Favorites screen
  favorites: {
    title: "Vos favoris",
    countSingular: "{{count}} technicien enregistré",
    countPlural: "{{count}} techniciens enregistrés",
    emptyTitle: "Aucun favori",
    emptyMessage: "Appuyez sur l'icône cœur sur le profil d'un technicien pour l'enregistrer ici.",
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
    bioLabel: "Bio / Description (Facultatif)",
    bioPlaceholder: "Décrivez les spécialités, certifications, approche...",
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
};
