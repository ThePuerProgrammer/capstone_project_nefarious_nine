// SINGLE PAGE ROOT
//============================================================================//
export const root = document.getElementById('root');
//============================================================================//

// MENU BUTTONS
//============================================================================//
export const menuHome = document.getElementById('menu-home');
export const menuClassrooms = document.getElementById('menu-classrooms');
export const menuStudyDecks = document.getElementById('menu-study-decks');
export const menuProfile = document.getElementById('menu-profile');
export const menuSettings = document.getElementById('menu-settings');
export const menuSignOut = document.getElementById('menu-signout');
export const modalMenuResetPassword = document.getElementById('reset-password');
export const menuHelpTickets = document.getElementById('menu-help-tickets');

// pomo timer buttons
export const pomoTimerToggleButton = document.getElementById('pomo-timer-toggle-button')
export const pomoTimerStartButton = document.getElementById('start-timer-button');
export const pomoTimerPauseButton = document.getElementById('pause-timer-button');
export const pomoTimerResetButton = document.getElementById('reset-timer-button');
export const pomoTimerMakeSettingDefaultButton = document.getElementById('timer-make-setting-default-button');
//============================================================================//

// DECK PAGE
//============================================================================//
export const formCreateAFlashcardSelectContainer = document.getElementById('form-create-a-flashcard-select-container');
export const formCheckInputIsMultipleChoice = document.getElementById('form-check-input-is-multiple-choice');
export const formAnswerContainer = document.getElementById('form-answer-container');
export const decksCreateDeck = document.getElementById('decks-create-deck');
export const formQuestionTextInput = document.getElementById('form-question-text-input');
export const formCreateAFlashcard = document.getElementById('form-create-a-flashcard');
export const formAnswerTextInput = document.getElementById('form-answer-text-input');
export const formDeleteFlashcard = document.getElementById('form-delete-flashcard');
export const formDeleteFlashcardSelect = document.getElementById('delete-option');
//============================================================================//

// STUDY DECKS PAGE
//============================================================================//
export const formSignIn = document.getElementById('form-signin');
export const formCreateDeck = document.getElementById('form-create-deck');
export const formDeckCategorySelect = document.getElementById('select-deck-category');
export const formCreateAccount = document.getElementById('form-create-account');
export const formViewDeck = document.getElementById('form-view-deck');
export const formClassSelect = document.getElementById('select-deck-classroom');
//============================================================================//

// STUDY PAGE
//============================================================================//
//export const formAnswerFlashcard = document.getElementById('form-answer-flashcard');
//export const overrideFlashcardBtn = document.getElementById('override-flashcard-btn');
//============================================================================//

// PW RESET FORM
//============================================================================//
export const formResetPassword = document.getElementById('form-reset-password');
//============================================================================//


// MODALS
//============================================================================//
/* This allows us to close the modal when an information/popup modal needs to popup.
 * Incase there is an error, we can't have 2 modals open at the same time. */

export const popupInfoTitle = document.getElementById('modal-infobox-title');
export const popupInfoBody = document.getElementById('modal-infobox-body');

export const modalSignIn = new bootstrap.Modal(document.getElementById('modal-signin-form'), { backdrop: 'static' });
export const modalCreateAFlashCard = new bootstrap.Modal(document.getElementById('modal-create-a-flashcard'));
export const modalCreateAccount = new bootstrap.Modal(document.getElementById('modal-create-account', { backdrop: 'static' }));
export const modalCreateDeck = new bootstrap.Modal(document.getElementById('create-deck-modal'));
export const modalResetPassword = new bootstrap.Modal(document.getElementById('modal-reset-password'));
export const modalDeleteFlashcard = new bootstrap.Modal(document.getElementById('modal-delete-a-flashcard', { backdrop: 'static' }));
export const modalEditFlashcard = new bootstrap.Modal(document.getElementById('modal-edit-a-flashcard', { backdrop: 'static' }));
export const modalEditDeck = new bootstrap.Modal(document.getElementById('modal-edit-a-deck', { backdrop: 'static' }));
export const modalCreateClassroom = new bootstrap.Modal(document.getElementById('create-classroom-modal'));
export const modalDeleteDeckConfirmation = new bootstrap.Modal(document.getElementById('modal-confirmation-delete-deck', { backdrop: 'static' }));
export const modalEditClassroom = new bootstrap.Modal(document.getElementById('modal-edit-classroom', { backdrop: 'static' }));
export const modalPreviewClassroom = new bootstrap.Modal(document.getElementById('preview-classroom-modal', { backdrop: 'static' }));
export const modalLeaveClassroomConfirmation = new bootstrap.Modal(document.getElementById('modal-confirmation-leave-classroom', { backdrop: 'static' }));
export const modalDeleteClassroom = new bootstrap.Modal(document.getElementById('modal-delete-classroom', { backdrop: 'static' }));
export const modalSubmitHelpTicket = new bootstrap.Modal(document.getElementById('modal-submit-help-ticket', { backdrop: 'static' }));
export const modalEditProfile = new bootstrap.Modal(document.getElementById('edit-profile-modal'));
export const modalPomodoption = new bootstrap.Modal(document.getElementById('modal-pomodoption'));
//============================================================================//

// POMO TIMER MISC ACCESSABLES
//============================================================================//
export const pomoTimerInnerDiv = document.getElementById('pomo-timer-inner-div');
export const timerSecondsDisplay = document.getElementById('timer-seconds-display');
export const timerMinutesDisplay = document.getElementById('timer-minutes-display');
export const timerIntervalSettingsSliders = document.getElementById('timer-interval-settings-sliders');
export const timerModeDisplay = document.getElementById('timer-mode-display');
export const timerModeDisplayToggle = document.getElementById('timer-mode-display-toggle');
export const timerModeDisplayStudy = document.getElementById('timer-mode-display-study');
export const timerModeDisplayRelax = document.getElementById('timer-mode-display-relax');
export const totalTimeIntervalSlider = document.getElementById('total-time-interval-slider');
export const timerThumb0 = document.getElementById('timer-thumb-0');
export const studyRelaxIntervalSlider = document.getElementById('study-relax-interval-slider');
export const timerThumb1 = document.getElementById('timer-thumb-1');
//============================================================================//

//FLASHCARD IMAGE 
//============================================================================//
export const imageTagCreateFlashAnswer = document.getElementById('form-add-image-to-flashcard-answer-tag');
export const imageTagCreateFlashQuestion = document.getElementById('form-add-image-to-flashcard-question-tag');
export const formAddFlashCardAnswerImageButton = document.getElementById('form-add-image-to-flashcard-answer-button');
export const formAddFlashCardQuestionImageButton = document.getElementById('form-add-image-to-flashcard-question-button');
export const formCheckInputIsImageQuestion = document.getElementById('form-check-input-is-image-question');
export const formCheckInputIsImageAnswer = document.getElementById('form-check-input-is-image-answer');
export const formContainerAnswerImage = document.getElementById('form-answer-image-container');
export const formContainerQuestionImage = document.getElementById('form-question-image-container');
//===========================================================================//

// Submit help ticket
//============================================================================//
export const formSubmitHelpTicket = {
    form: document.getElementById('form-submit-help-ticket'),
    imageTag: document.getElementById('form-add-image-to-help-ticket-tag'),
    imageButton: document.getElementById('form-add-image-to-help-ticket-button'),
}


//EDIT FLASHCARD
//==========================================================================//
export const formEditFlashcard = {
    form: document.getElementById('form-edit-a-flashcard'),
    questionImageTag: document.getElementById('form-edit-flashcard-question-image-tag'),
    questionImageButton: document.getElementById('form-edit-flashcard-question-image-button'),
    questionImageContainer: document.getElementById('form-edit-flashcard-question-image-container'),
    answerImageTag: document.getElementById('form-edit-flashcard-answer-image-tag'),
    answerImageButton: document.getElementById('form-edit-flashcard-answer-image-button'),
    answerImageContainer: document.getElementById('form-edit-flashcard-answer-image-container'),
    multipleChoiceToggle: document.getElementById('form-check-input-is-multiple-choice-edit'),
    questionImageToggle: document.getElementById('form-check-input-is-image-question-edit'),
    answerImageToggle: document.getElementById('form-check-input-is-image-answer-edit'),
    multipleAnswerContainer: document.getElementById('form-edit-answer-container'),
    answerTextInput: document.getElementById('form-answer-text-input-edit'),
}
export const formCheckInputIsMultipleChoiceEdit = document.getElementById('form-check-input-is-multiple-choice-edit');
export const formAnswerTextInputEdit = document.getElementById('form-edit-answer-container');
//==========================================================================//

//EDIT DECK
//==========================================================================//
export const formEditDeck = {
    form: document.getElementById('form-edit-a-deck'),
    //if we are wanting to add checkbox into the edit
    //checkboxIsFavorited: document.getElementById(''),
}
export const formEditDeckCategorySelect = document.getElementById('select-deck-category-edit');
export const formDeleteDeckConfirmation = document.getElementById('form-delete-deck-confirmation');
export const formEditDeckClassroomSelect = document.getElementById('select-deck-classroom-edit');
//Coin Display
//==========================================================================//
export const coinCount = document.getElementById('coin-count');
//==========================================================================//
//==========================================================================//
//PET ADOPTION
//============================================================================//
export const formPomodoption = {
    form: document.getElementById('form-pomodoption'),
    bunnyButton: document.getElementById('bunny-btn'),
    dogButton: document.getElementById('dog-btn'),
    catButton: document.getElementById('cat-btn'),
}
//============================================================================//
//CLASSROOMS PAGE
//============================================================================//
export const formCreateClassroom = document.getElementById('form-create-classroom');
export const formClassCategorySelect = document.getElementById('select-class-category');
export const formEditClassroom = document.getElementById('form-edit-classroom');
export const formEditClassCategorySelect = document.getElementById('edit-class-category');
export const formDeleteClassroom = document.getElementById('form-delete-classroom');
//============================================================================//

//PREVIEW CLASSROOMS 
//============================================================================//
// export const formJoinClassroom = document.getElementById('form-join-classroom');
export const previewClassroomFooter = document.getElementById('preview-classroom-modal-footer');
export const previewClassroomBody = document.getElementById('preview-classroom-modal-body');
export const previewClassroomLabel = document.getElementById('preview-classroom-modal-label');
//============================================================================//


//SEARCH
//============================================================================//
export const modalSearchBox = new bootstrap.Modal(document.getElementById('modal-searchbox'));
export const searchBoxTitle = document.getElementById('modal-searchbox-title');
export const searchBoxPlaceholder = document.getElementById('modal-searchbox-placeholder');
export const searchBoxType = document.getElementById('modal-searchbox-type');
export const formSearchBox = document.getElementById('form-searchbox');
export const checkBoxMyClassrooms = document.getElementById('checkbox-myClassrooms');
export const checkBoxNotMyClassrooms = document.getElementById('checkbox-notMyClassrooms');
//============================================================================//


//PROFILE PAGE
//============================================================================//
export const formEditProfile = {
    form: document.getElementById('form-edit-profile'),
    profilePictureTag: document.getElementById('form-edit-profile-picture-tag'),
    profilePictureButton: document.getElementById('form-edit-profile-picture-button'),
    username: document.getElementById('username'),
    userBio: document.getElementById('bio'),
}
// Profile Picture
export const formContainerProfilePicture = document.getElementById('form-edit-profile-picture');
//============================================================================//