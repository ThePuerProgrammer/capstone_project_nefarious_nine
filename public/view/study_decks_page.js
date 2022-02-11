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
            Elements.modalCreateDeck.hide();
        } catch (e) {
            if (Constant.DEV) console.log(e);
        }

    })

    // Elements.formCreateAFlashcard.addEventListener('submit', createFlashCard);
}


export async function study_decks_page() {
    //Going to make the cards populate here so we can show in the testing them physically
    //being pulled and added to the page.
    //Clears all HTML so it doesn't double
    let html = '';
    html += '<h1> Study Decks </h1>';
    //Allows for the create a flashcard button
    html += `
        <button class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modal-create-a-flashcard"> + Create Flashcard</button>
    `;

    // Solution for merging Piper's 'create_deck_deck_title branch
    html += `
        <button type="button" class="btn btn-primary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#create-deck-modal">
            Create New Deck
        </button>
    `;

    Elements.root.innerHTML = html;
}