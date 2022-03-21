/*****************************************
 * Development to restrict logs to console
 *****************************************/
export const DEV = true

/*****************************************
 * Admin constant until we get accounts
 * working better
 *****************************************/
export const ADMIN = 'admin@test.com'
/*****************************************
 *          COLLECTION NAMES
 ***************************************** 
 * Where we reference the collection names
 *****************************************/
export const collectionName = {
    FLASHCARDS: 'flashcards',
    OWNED_DECKS: 'owned_decks',
    USERS: 'users',
    DECK_DATA: 'deck_data',
    FLASHCARDS_DATA: 'flashcards_data',
    CLASSROOMS: 'classrooms',
    BACKEND: 'backend',
    CLASSROOM_CHATS: 'classroom_chats',
    MESSAGES: 'messages',
    FLASHCARDS_DATA_SUFFIX: '_flashcard_data',
    HELPTICKETS: 'help_tickets',
}

/*****************************************
 *          STORAGE FOLDERS
 *****************************************
 * Where we reference the storage of images
 * or anything else stored in the storage 
 * portion.
 * ALL MUST END WITH A FORWARD SLASH
 ******************************************/
export const storageFolderName = {
    FLASHCARD_IMAGES: 'flashcard_images/',
    HELPTICKET_IMAGES: 'helpticket_images/',
    POMOPETS: 'pomopets/',
    PROFILE_PICTURES: 'profile_pictures/',
}

/*****************************************
 *              HTML ID'S
 *****************************************
 * Where we reference html id's across 
 ******************************************/
export const htmlIDs = {
    buttonShowCreateAFlashcardModal: 'button-show-create-a-flashcard-modal',
    modalCreateAFlashcard: 'modal-create-a-flashcard',
    buttonStudy: 'btn-study-deck',
    formAnswerFlashcard: 'form-answer-flashcard',
    overrideFlashcardBtn: 'override-flashcard-btn',
    deleteFlashcard: 'button-delete-flashcard-modal',
    deleteFlashcardModal: 'modal-delete-a-flashcard',
    formCheckInputIsMultiple: 'form-check-input-is-multiple',
    createAccountModal: 'modal-create-account',
    smartStudyCheckbox: 'smart-study-checkbox',
    smartStudyPopupTextContainer: 'smart-study-popup-text-container',
    streakNumberText: 'streak-number-text',
    studyFlashcardAnswer: 'study-flashcard-answer',
    smartStudyIndicator: 'smart-study-indicator',
    createDeck: 'button-create-deck-modal',
    createDeckModal: 'create-deck-modal',
    createClassroom: 'button-create-classroom-modal',
    createClassroomModal: 'create-classroom-modal',
    buttonEditClassroom: 'button-edit-class',
    miniGamesPage: 'godot-mini-games',
    chillZonePage: 'chill-zone-page',
    analyticsPage: 'analytics-page',
    leaderboardCoins: 'button-leaderboard-coins',
    leaderboardDecks: 'button-leaderboard-decks',
    leaderboardFlashcards: 'button-leaderboard-flashcards',
    analyticsSelectDeck: 'analytics-select-deck',
    analyticsSelectStatistics: 'analytics-select-statistics',
    loadingIcon: 'loading-icon',
    analyticsChart: 'analytics-chart',
    analyticsChartContainer: 'analytics-chart-container',
    analyticsPageContainer: 'analytics-page-container',
    editProfile: 'button-edit-profile-modal',
    editProfileModal: 'edit-profile-modal',
    studyPageReturnToDeckPageButton: 'study-page-return-to-deck-page-button',
    areaChartRadioButton: 'area-chart-radio-button',
    columnChartRadioButton: 'column-chart-radio-button',
    pieChartRadioButton: 'pie-chart-radio-button',
    hideFillerDaysSwitchRow: 'hide-filler-days-switch-row',
    hideFillerDaysSwitch: 'hide-filler-days-switch',
    chartViewSettingsColumn: 'chart-view-settings-column',
    chartViewRadioButtonRow: 'chart-view-radio-button-row',
    pieChartRadioButtonContainer: 'pie-chart-radio-button-container',
    formEditPomopetName: 'form-edit-pomopet-name',
}
