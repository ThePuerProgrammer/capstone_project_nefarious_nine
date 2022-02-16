import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as DeckPage from './deck_page.js'
import * as Auth from '../controller/firebase_auth.js'


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
        const isFavorited = false;

        // relevant to Cody's story:
        const dateCreated = Date.now();

        const deck = new Deck({
            name,
            subject,
            dateCreated,
            isFavorited,
        });

        try {
            console.log("Creating Deck");
            const docId = await FirebaseController.createDeck(Auth.currentUser.uid, deck);
            console.log("Deck Created");
            deck.docId = docId;
            localStorage.setItem("deckPageDeckDocID", deck.docId);
            Elements.modalCreateDeck.hide();
            history.pushState(null, null, Routes.routePathname.DECK + "#" + deck.docId);
            await DeckPage.deck_page(deck.docId);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }

    });

    // Clears CREATE DECK input fields when user closes modal
    $(`#create-deck-modal`).on('hidden.bs.modal', function (e) {
        Elements.formCreateDeck.reset();
    });
}

export async function study_decks_page() {
    Elements.root.innerHTML = "";
    //Clears all HTML so it doesn't double
    let html = ''
    html += '<h1> Study Decks </h1>';

    // Solution for merging Piper's 'create_deck_deck_title branch
    html += `
        <button type="button" class="btn btn-secondary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#create-deck-modal">
            Create New Deck
        </button><br><br>
    `;

    let deckList;
    try {
        // this is pretty temporary since we're just pulling all decks to test
        // in the future, we can set up our getDecks function to filter by criteria
        // also TODO: add a dropdown menu to sort decks by different filters - Cody
        deckList = await FirebaseController.getUserDecks(Auth.currentUser.uid);
    } catch (e) {
        // TODO: we can display a popup if there was an error getting the decklists
        // I'm not doing this now because I don't want to - Cody
        console.log(e);
    }

    for (let i = 0; i < deckList.length; ++i) {
        let flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, deckList[i].docId);
        html += buildDeckView(deckList[i], flashcards);
    }

    // it might be better to add this when we actually pull the decks from Firebase
    // but I'm leaving it here for now - Cody
    if (deckList.length == 0) {
        html += '<h2> No decks found! Go create some and get to studying!</h2>'
    }

    Elements.root.innerHTML += html;
    DeckPage.addViewButtonListener();

    const favoritedCheckboxes = document.getElementsByClassName("form-check-input");
    for (let i = 0; i < favoritedCheckboxes.length; ++i) {
        favoritedCheckboxes[i].addEventListener('change', async e => {
            const docId = e.target.value;
            const favorited = document.getElementById('favorited').checked;
            await FirebaseController.favoriteDeck(Auth.currentUser.uid, docId, favorited);
        });
    }

}


function buildDeckView(deck, flashcards) {
    let html = `
    <div id="card-${deck.docId}" class="card" style="width: 18rem; display: inline-block; background-color: #5F4B66; padding: 5px; margin-bottom: 5px">
        <div class="card-body">
            <h5 class="card-text">${deck.name}</h5>
            <p class="card-text" >Subject: ${deck.subject}</p>
            <p class="card-text"># of flashcards: ${flashcards.length}</p>
            <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
        </div>
        <form class="form-view-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <button class="btn btn-outline-primary pomo-bg-color-dark" type="submit">View</button>
        </form>`;

    html += deck.isFavorited ? `<div class="form-check">
            <input class="form-check-input" type="checkbox" value="${deck.docId}" id="favorited" checked>
            <label class="form-check-label" for="favorited">Favorite deck</label>
        </div>
    </div>
    ` : `<div class="form-check">
    <input class="form-check-input" type="checkbox" value="${deck.docId}" id="favorited">
    <label class="form-check-label" for="favorited">Favorite deck</label>
</div>
</div>`;
    return html;
}