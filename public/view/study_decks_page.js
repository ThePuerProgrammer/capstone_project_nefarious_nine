import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'


export function addEventListeners() {
    Elements.menuStudyDecks.addEventListener('click', async () => {
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
            Elements.modalCreateDeck.hide();
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }

    });

    Elements.formViewDeck.addEventListener('submit', async e => {

    })
}


export async function study_decks_page() {

    //Clears all HTML so it doesn't double
    let html = '';
    html += '<h1> Study Decks </h1>';

    // Solution for merging Piper's 'create_deck_deck_title branch
    html += `
        <button type="button" class="btn btn-primary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#create-deck-modal">
            Create New Deck
        </button>
    `;

    html += `
        <button id="${Constant.htmlIDs.buttonModalViewDeck}" type="button" class="btn btn-primary pomo-bg-color-dark" data-bs-target="#modal-view-deck">
            View Deck
        </button>
    `;
    Elements.root.innerHTML = html;

    const buttonViewDeckModal = document.getElementById(Constant.htmlIDs.buttonModalViewDeck);
    buttonViewDeckModal.addEventListener('click', async e => {
        e.preventDefault();
        // get list of decks from Firestore
        // TODO: add more information to help filter decks
        // i.e., created by, subject, classroom, SRS, etc
        const listOfDecks = await FirebaseController.getAllTestingDecks();
        listOfDecks.forEach(d => {
            document.getElementById('form-view-deck-select-container').innerHTML += `
        <option value="${d.docId}">${d.name}</option>`;
        });
        Elements.modalViewDeck.show();

    });
}