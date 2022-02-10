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
//============================================================================//

// FORMS
//============================================================================//
export const formCreateDeck = document.getElementById('form-create-deck');
export const formCreateAFlashcard = document.getElementById('form-create-a-flashcard');
//============================================================================//

// MODALS
//============================================================================//
/* This allows us to close the modal when an information/popup modal needs to popup.
 * Incase there is an error, we can't have 2 modals open at the same time. */
export const modalCreateAFlashCard = new bootstrap.Modal(document.getElementById('modal-create-a-flashcard'));
//============================================================================//
