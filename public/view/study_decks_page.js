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
        const category = e.target.selectCategory.value;

        console.log("category is: " + category);

        // relevant to Cody's story:
        const dateCreated = Date.now();

        const deck = new Deck({
            name,
            subject,
            dateCreated,
            isFavorited,
            category
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
    /*html += `
        <button type="button" class="btn btn-secondary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#create-deck-modal">
            Create New Deck
        </button>
    `;*/

    html += `<button id="${Constant.htmlIDs.createDeck}" type="button" class="btn btn-secondary pomo-bg-color-dark">
     Create Deck</button>`;

    // sort select menu
    html += `
    <div style="float:right">
    <label for="sort-decks">Order by:</label>
    <select name="sort-decks" id="sort-decks" style="width: 200px">
        <option selected>Sort decks by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="date">Date</option>
    </select>
    </div>
    <br><br>
    `

    let deckList;
    try {
        deckList = await FirebaseController.getUserDecks(Auth.currentUser.uid);
    } catch (e) {
        console.log(e);
    }

    html += `<div id="deck-container">`
    for (let i = 0; i < deckList.length; i++) {
        let flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, deckList[i].docId);
        html += buildDeckView(deckList[i], flashcards);
    }
    html += `</div>`

    if (deckList.length == 0) {
        html += '<h2> No decks found! Go create some and get to studying!</h2>'
    }


    Elements.root.innerHTML += html;
    // adds an event listener to each of the view buttons
    DeckPage.addViewButtonListener();

    const sortDeckSelect = document.getElementById("sort-decks");
    sortDeckSelect.addEventListener('change', async e => {
        e.preventDefault();
        // get the value from the sort deck list select item, the value === deckDocID
        var opt = e.target.options[e.target.selectedIndex].value;
        // grab the div wrapped around the deck cards
        var deckContainer = document.getElementById('deck-container');
        // grab the cards contained in the deck
        var decks = deckContainer.getElementsByClassName('deck-card');
        // store the decks inside of an array for sorting
        var list = [];
        for (let i = 0; i < decks.length; ++i) {
            list.push(decks.item(i));
        }
        /* Brief explanation of sorting in JS:
            By default, sort() sorts values as strings. As such, it doesn't work correctly when
            attempting to sort numbers. Hence, you can create a compare function to sort numbers corrently
            If the function returns a negative result, a is sorted before b. If the function returns a
            positive result, b is sorted before a. If the result is zero, no changes are done as the values
            are in the correct order.
            Since it isn't just sorting those items but actually variables of those items, we're using a compare
            function for each item in the list to sort it properly. Each compare function works in a similar manner
            but is using different variables
        */
        // First, we check what the value of the selected item from the sort deck list is
        if (opt == "name") {
            // next, we call the sort() function on the list and utilize a lambda function
            list.sort(function (a, b) {
                // This gets the 'id' attribute from the card
                var aId = a.getAttribute('id');
                var bId = b.getAttribute('id');
                // this will find the corresponding deck by the docId and then convert it to lowercase
                // Note: .toLowerCase() does not transform the string itself, but creates a new string
                var firstName = deckList.find(deck => deck.docId == aId).name.toLowerCase();
                var secondName = deckList.find(deck => deck.docId == bId).name.toLowerCase();
                /* Utilizing a nested ternary operator:
                    1. Check if a is less than b. If true, return -1 as explained above
                    2. If false, check if a is greater than b. If true, return 1 as explained above
                    3. If false, then the function returns 0 as the values are already in their proper place
                */
                return (firstName < secondName) ? -1 : (firstName > secondName) ? 1 : 0;
            });
            // Each function will operate in a similar manner
        } else if (opt == "subject") {
            list.sort(function (a, b) {
                var aId = a.getAttribute('id');
                var bId = b.getAttribute('id');
                var firstSubject = deckList.find(deck => deck.docId == aId).subject.toLowerCase();
                var secondSubject = deckList.find(deck => deck.docId == bId).subject.toLowerCase();
                return (firstSubject < secondSubject) ? -1 : (firstSubject > secondSubject) ? 1 : 0;
            });
        } else if (opt == "date") {
            list.sort(function (a, b) {
                /* DO NOT TOUCH THIS ONE 
                    A different method could probably be worked out for sorting by name and subject,
                    but dateCreated can ONLY be sorted using a compare function
                */
                var aId = a.getAttribute('id');
                var bId = b.getAttribute('id');
                var first = deckList.find(deck => deck.docId == aId);
                var second = deckList.find(deck => deck.docId == bId);
                return (first.dateCreated < second.dateCreated) ? -1 : (first.dateCreated > second.dateCreated) ? 1 : 0;
            });
        }
        // Finally, append the decks to the div wrapped around them, replacing the original order with the new order
        for (let i = 0; i < list.length; ++i) {
            deckContainer.appendChild(list[i]);
        }
        // If you've made it this far, then thank you for for following along
    })

    const favoritedCheckboxes = document.getElementsByClassName("favorite-checkbox");
    for (let i = 0; i < favoritedCheckboxes.length; ++i) {
        favoritedCheckboxes[i].addEventListener('change', async e => {
            const docId = e.target.value;
            console.log(docId);
            const favorited = deckList.find(deck => docId == deck.docId).isFavorited ? false : true;
            await FirebaseController.favoriteDeck(Auth.currentUser.uid, docId, favorited);
            await study_decks_page();
        });
    }

    const createDeckButton = document.getElementById(Constant.htmlIDs.createDeck);

    // restructured create deck button to add category dropdown menu
    createDeckButton.addEventListener('click', async e => {

        const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

        // add firebase func. to retrieve categories list

        // clear innerHTML to prevent duplicates
        Elements.formDeckCategorySelect.innerHTML = '';
 
        categories.forEach(category => {
            Elements.formDeckCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>
                  `;
          });

        // opens create Deck modal
        $(`#${Constant.htmlIDs.createDeckModal}`).modal('show');
    })

}


function buildDeckView(deck, flashcards) {
    let html = `
    <div id="${deck.docId}" class="deck-card">
        <div class="deck-view-css">
        <div class="card-body">
            <h5 class="card-text">${deck.name}</h5>
            <h6 class="card-text" >Subject: ${deck.subject}</h6>
            <h7 class="card-text"># of flashcards: ${flashcards.length}</h7>
            <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
        </div>
        <form class="form-view-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;">View</button>
        </form>
        </div>`;

    // ternary operator to check if a deck is favorited or not
    html += deck.isFavorited ? `<div class="form-check">
    <input class="favorite-checkbox form-check-input" type="checkbox" value="${deck.docId}" id="favorited" checked>        
    <label class="form-check-label" for="favorited">Favorite deck</label>
    </div>
    </div>
    ` : `<div class="form-check">
    <input class="favorite-checkbox form-check-input" type="checkbox" value="${deck.docId}" id="favorited">
    <label class="form-check-label pomo-text-color-light" for="favorited">Favorite deck</label>
</div>
</div>`;
    return html;
}