/*****************************************
 * Development to restrict logs to console
 *****************************************/
export const DEV = true

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
    modalCreateAccount: 'modal-create-account',
    smartStudyCheckbox: 'smart-study-checkbox',
    smartStudyPopupTextContainer: 'smart-study-popup-text-container',
    streakNumberText: 'streak-number-text',
    studyFlashcardAnswer: 'study-flashcard-answer',
    smartStudyIndicator: 'smart-study-indicator',
    createDeck: 'button-create-deck-modal',
    createDeckModal: 'create-deck-modal',
    createClassroom: 'button-create-classroom-modal',
    createClassroomModal: 'create-classroom-modal',
}
