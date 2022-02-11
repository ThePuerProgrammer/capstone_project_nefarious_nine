import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';
import * as Flashcards from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'


export function addEventListeners() {
    Elements.menuStudyDecks.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.STUDYDECKS);
        await study_decks_page();
    });

    // CREATE A DECK Submit button event listener
    Elements.formCreateDeck.addEventListener('submit', async e => {
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;

        // relevant to Cody's story:
        const dateCreated = Date.now();

        const deck = new Deck({
            name,
            subject,
            dateCreated
        });

        try {
            const docId = await FirebaseController.createDeck(deck);
            deck.docId = docId;
        } catch (e) {
            if (Constant.DEV) 
                console.log(e);
        }

    });

    // CREATE A FLASHCARD Submit butotn event listener
    // TODO: move actual work into its own function and just pass function name
    Elements.formCreateAFlashcard.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = e.target;
        
        // Getting contents of flashcard
        const question = formData.question.value;
        // Needs Answer
        // Needs Incorrect Answers
        // Needs isMultipleChoice
        const imageURL = "TESTING";
        const imageName = "TESTING";

        // TODO: const deckDocIDReceivingNewFlashcard = "......."

        const flashcard = new Flashcard({
            question,
            imageURL,
            imageName
        });

        try {
            const docId = await FirebaseController.createFlashcard(deckDocIDReceivingNewFlashcard, flashcard);
            flashcard.docId = docId;
            
            if (Constant.DEV) {
                console.log(`Flashcard created in deck with doc id [${deckDocIDReceivingNewFlashcard}]:`);
                console.log("Flashcard Contents: ");
                console.log(JSON.stringify(flashcard));
            }
        } catch (e) {
            if (Constant.DEV) 
                console.log(e);
        }

    });
    // Elements.formCreateAFlashcard.addEventListener('submit', createFlashcard);
}

// export async function createFlashcard(formData) {
//     e.preventDefault();
// }


export async function study_decks_page() {
    //Going to make the cards populate here so we can show in the testing them physically
    //being pulled and added to the page.
    //Clears all HTML so it doesn't double
    let html = '';
    html += '<h1> Study Decks </h1>';
    //Allows for the create a flashcard button
    html += `
        <button id="${Constant.htmlIDs.buttonShowCreateAFlashcardModal}" class="btn btn-outline-danger"> + Create Flashcard</button>
    `;

    // Solution for merging Piper's 'create_deck_deck_title branch
    html += `
        <button type="button" class="btn btn-primary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#create-deck-modal">
            Create New Deck
        </button>
    `;

    Elements.root.innerHTML = html;

    const buttonShowCreateAFlashcardModal = document.getElementById(Constant.htmlIDs.buttonShowCreateAFlashcardModal);

    // Manually Opening
    buttonShowCreateAFlashcardModal.addEventListener('click', async e => {
        e.preventDefault();

        const listOfTestDecks = await FirebaseController.getAllTestingDecks();

        for (var deck in listOfTestDecks) {
            document.getElementById('container-for-test-deck-list').innerHTML += `
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked>
                <label class="form-check-label" for="flexRadioDefault2">
                Default checked radio
                </label>
            `;
        }

        
        
        // Constant.openModal(Constant.htmlIDs.modalCreateAFlashcard);
        $(`#${Constant.htmlIDs.modalCreateAFlashcard}`).modal('show');
    });
}