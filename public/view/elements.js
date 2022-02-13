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
//============================================================================//

// STUDY DECKS PAGE
//============================================================================//
export const decksCreateDeck = document.getElementById('decks-create-deck');
//============================================================================//


// DECK PAGE
//============================================================================//
export const formCreateAFlashcardSelectContainer = document.getElementById('form-create-a-flashcard-select-container');
export const formCheckInputIsMultipleChoice = document.getElementById('form-check-input-is-multiple-choice');
export const formAnswerContainer = document.getElementById('form-answer-container');
export const formAddFlashCardImageButton = document.getElementById('form-add-image-to-flashcard-button');
export const btnStudyDeck = document.getElementById('btn-study-deck');
//============================================================================//



// FORMS
//============================================================================//
export const formSignIn = document.getElementById('form-signin');
export const formCreateDeck = document.getElementById('form-create-deck');
export const formCreateAFlashcard = document.getElementById('form-create-a-flashcard');
export const formCreateAccount = document.getElementById('form-create-account');
//============================================================================//

// MODALS
//============================================================================//
/* This allows us to close the modal when an information/popup modal needs to popup.
 * Incase there is an error, we can't have 2 modals open at the same time. */
// export const modalInfoBox = {
//     modal: new bootstrap.Modal(document.getElementById('modal-infobox'), {backdrop: 'static'}),
//     title: document.getElementById('modal-infobox-title'),
//     body: document.getElementById('modal-infobox-body'),
// }
export const popupInfoTitle = document.getElementById('modal-infobox-title');
export const popupInfoBody = document.getElementById('modal-infobox-body');

export const modalSignIn = new bootstrap.Modal(document.getElementById('modal-signin-form'), { backdrop: 'static' });
export const modalCreateAFlashCard = new bootstrap.Modal(document.getElementById('modal-create-a-flashcard'));
export const modalCreateAccount = new bootstrap.Modal(document.getElementById('modal-create-account', { backdrop: 'static' }));
export const modalCreateDeck = new bootstrap.Modal(document.getElementById('create-deck-modal'));


//IMAGE TAG
//============================================================================//
export const imageTagCreateFlash = document.getElementById('form-add-image-to-flashcard-tag');
