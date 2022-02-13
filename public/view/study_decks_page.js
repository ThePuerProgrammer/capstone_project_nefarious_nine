import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as DeckPage from './deck_page.js'


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

    let deckList;
    try {
        // this is pretty temporary since we're just pulling all decks to test
        // in the future, we can set up our getDecks function to filter by criteria
        // also TODO: add a dropdown menu to sort decks by different filters - Cody
        deckList = await FirebaseController.getAllTestingDecks();
    } catch (e) {
        // TODO: we can display a popup if there was an error getting the decklists
        // I'm not doing this now because I don't want to - Cody
        console.log(e);
    }

    html += `
    <table class="table">
    <thread>
    <tr>
    <th scope="col">Select</th>
    <th scope="col">Subject</th>
    <th scope="col">Name</th>
    </tr>
    </thread>
    <tbody id="deck-table-body">`

    deckList.forEach(deck => {
        html += `
        <tr>
        ${buildDeckView(deck)}
        </tr>`
    })

    html += `</tbody>
    </table>`;
    Elements.root.innerHTML += html;

    // it might be better to add this when we actually pull the decks from Firebase
    // but I'm leaving it here for now - Cody
    if (deckList.length == 0) {
        html += '<h2> No decks found! Go create some and get to studying!</h2>'
        Elements.root.innerHTML += html;
    }

    DeckPage.addViewButtonListener();
}

function buildDeckView(deck) {
    return `
    <td>
        <form method="post" class="deck-view-form">
            <input type="hidden" name="deckID" value="${deck.docId}">
            <button type="submit" class="btn btn-primary pomo-bg-color-dark">View</button>
        </form>
    </td>
    <td>$${deck.subject}</td>
    <td>${deck.name}</td>
    `;
}