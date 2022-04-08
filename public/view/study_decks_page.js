import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as DeckPage from './deck_page.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as EditDeck from '../controller/edit_deck.js'
import * as Search from './search_page.js'
import * as Coins from '../controller/coins.js'

let confirmation = false;
let noClassDeckSelected = false;

export function addEventListeners() {
    Elements.menuStudyDecks.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.STUDYDECKS);
        sessionStorage.setItem('cameFromClassDeck', false); 
        await study_decks_page();
    });

    // CREATE A DECK Submit button event listener
    Elements.formCreateDeck.addEventListener('submit', async e => {
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;
        const isFavorited = false;
        const category = e.target.selectCategory.value;
        const isClassDeck = e.target.selectClassroom.value;
        const flashcardNumber = 0;
        const created_by = Auth.currentUser.uid
        const isMastered = false;
        //NOTE: If no class was chosen, isClassDeck value will be false.
        // Otherwise, the value will be the CLASSROOM DOC ID tied to the deck.

        //if there is no class selected, the deck is not a class deck

        const keywords = Search.cleanDataToKeywords(name, subject, category)

        // relevant to Cody's story:
        const dateCreated = Date.now();

        const deck = new Deck({
            name,
            subject,
            dateCreated,
            isFavorited,
            category,
            keywords,
            isClassDeck,
            flashcardNumber,
            created_by,
            isMastered,

        });


        if (isClassDeck == "false" || isClassDeck == false) { //if no class is tied to this deck
            try {
                //Passes UID Since it is a Personal Deck
                //deck.created_by=Auth.currentUser.uid;

                console.log("Creating Deck");
                const deckId = await FirebaseController.createDeck(Auth.currentUser.uid, deck);
                console.log("Deck Created");
                deck.docId = deckId;
                localStorage.setItem("deckPageDeckDocID", deck.docId);
                sessionStorage.setItem('deckId', deckId);
                sessionStorage.setItem('isClassDeck', deck.isClassDeck);
                history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
                Elements.modalCreateDeck.hide();
                await FirebaseController.updateDeckCount(Auth.currentUser.uid);
                //history.pushState(null, null, Routes.routePathname.DECK + "#" + deck.docId);
                await DeckPage.deck_page(deckId, deck.isClassDeck);
            } catch (e) {
                if (Constant.DEV)
                    console.log(e);
            }
        } else { // a class is tied to this deck, isClassDeck is now the classroom DOCID its tied to
            try {
                //Passes Class ID, since it is a Class Deck
                //deck.created_by=isClassDeck;

                console.log("Creating Deck");
                const deckId = await FirebaseController.createClassDeck(deck.isClassDeck, deck);
                console.log("Deck Created");
                deck.docId = deckId;
                localStorage.setItem("deckPageDeckDocID", deck.docId);
                sessionStorage.setItem('deckId', deckId);
                history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
                Elements.modalCreateDeck.hide();
                //history.pushState(null, null, Routes.routePathname.DECK + "#" + deck.docId);
                await DeckPage.deck_page(deckId, deck.isClassDeck);
            } catch (e) {
                if (Constant.DEV)
                    console.log(e);
            }

        }

    });

    // Clears CREATE DECK input fields when user closes modal
    $(`#create-deck-modal`).on('hidden.bs.modal', function (e) {
        Elements.formCreateDeck.reset();
    });



}

export async function study_decks_page() {
    try {
        await Coins.get_coins(Auth.currentUser.uid);
    } catch (e) { if (Constant.DEV) console.log(e); }

    let deckList = [];
    try {
        deckList = await FirebaseController.getUserDecks(Auth.currentUser.uid); //this is what's showing up as null

    } catch (e) {
        console.log(e);
    }



    buildStudyDecksPage(deckList);

} //end study_decks_page()

export async function buildStudyDecksPage(deckList) {
    let availableClassroomList = [];
    let classDecks = [];
    let clase;

    try {
        availableClassroomList = await FirebaseController.getAvailableClassrooms();
    } catch (e) {
        Utilities.info('Error getting available classrooms', JSON.stringify(e));
        console.log(e);
    }


    // get my classrooms
    let myClassroomList = [];
    for (let i = 0; i < availableClassroomList.length; i++) {
        //If we want to make it for all members of class we just change this line to this
        if (availableClassroomList[i].members.includes(Auth.currentUser.email)) {

        //if (availableClassroomList[i].moderatorList.includes(Auth.currentUser.email)) {
            myClassroomList.push(availableClassroomList[i]);
            let tempDeck = await FirebaseController.getClassDecks(availableClassroomList[i].docID);
            if (tempDeck.length < 1) {
                continue;
            }
            classDecks.push(tempDeck);
            tempDeck = [];
        } else {
            //keep looping to fill myclassroom list
            continue;
        }

    }
    //push our class decks onto the deckList for build view, 
    //might want to distinguish which are class decks or not for the view
    for (let i = 0; i < classDecks.length; i++) {
        deckList.push(...classDecks[i]);
    }




    Elements.root.innerHTML = ""
    //Clears all HTML so it doesn't double
    let html = ''
    html += '<h1> Study Decks <button id="search-decks-button" class="btn search-btn search-btn-decks search-btn-hover rounded-pill" type="click" style="float:right;"><i class="material-icons">search</i>Search Decks</button></h1> '
        ;

    //create deck button
    html += `<button id="${Constant.htmlIDs.createDeck}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">
    <i class="material-icons pomo-text-color-light">add</i> Create A Deck</button>
     `;

    // sort select menu
    html += `
    <div style="float:right; padding-right:50px;">
    <label for="sort-decks">Order by:</label>
    <select name="sort-decks" id="sort-decks" style="width: 200px">
        <option selected disabled>Sort decks by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="date">Date</option>
        <option value="category">Category</option>
    </select>
    </div>    
    <br><br>
    `

    let streaks;
    let isMastered = false;
    html += `<div id="deck-container">`
    for (let i = 0; i < deckList.length; i++) {

        if (deckList[i].isClassDeck == "false" || deckList[i].isClassDeck == false) {
            streaks = [];
            isMastered = false;
            let flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, deckList[i].docId);
            let lastSRSaccess = await FirebaseController.getUserLastSrsAccessDeckData(Auth.currentUser.uid, deckList[i].docId);
            for (let k = 0; k < flashcards.length; k++) {
                let streak = await FirebaseController.getUserFlashcardDataByLastSrsAccessandFCid(Auth.currentUser.uid, deckList[i].docId, lastSRSaccess, flashcards[k].docID);
                streaks.push(streak);
            }
            console.log("STR$EAKS " + streaks.length);
            if (streaks.length >= 1) {
                for (let j = 0; j < streaks.length; j++) {
                    if (streaks[j] > 3) {
                        isMastered = true;
                    }
                }
            }

            if (isMastered == true && deckList[i].isMastered == false) {

                await FirebaseController.updateDeckMasteryandAddCoins(Auth.currentUser.uid, deckList[i].docId);

            }
            html += buildDeckView(deckList[i], flashcards, 'false', isMastered);
 

        }

    }


    html += `</div>`

    if (deckList.length == 0) {
        html += '<h2> No decks found! Go create some and get to studying!</h2>'
    }



    Elements.root.innerHTML += html;
    // adds an event listener to each of the view buttons
    const viewDeckButtons = document.getElementsByClassName('form-view-deck');
    for (let i = 0; i < viewDeckButtons.length; i++) {
        viewDeckButtons[i].addEventListener('submit', async e => {
            e.preventDefault();
            let deckId = e.target.docId.value;
            let isClassDeck = e.target.classdocId.value;
            console.log("check for form view deck submit event " + e.target.classdocId.value);

            window.sessionStorage;
            sessionStorage.setItem('deckId', deckId);
            sessionStorage.setItem('isClassDeck', isClassDeck)

            history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
            await DeckPage.deck_page(deckId, isClassDeck);
        })
    }

    const editDeckForms = document.getElementsByClassName('form-edit-deck');
    for (let i = 0; i < editDeckForms.length; i++) {
        editDeckForms[i].addEventListener('submit', async e => {
            //prevents refresh on submit of form
            e.preventDefault();
            if (e.target.classdocId.value == "false") { //if not a class deck
                await EditDeck.edit_deck(Auth.currentUser.uid, e.target.docId.value);
            } else {//else is a class deck
                let classDocID = e.target.classdocId.value;
                await EditDeck.edit_class_deck(classDocID, e.target.docId.value);
            }
            //setTimeout(await study_decks_page(), 2000);
            // await study_decks_page();
        });
    }
    const deleteDeckForms = document.getElementsByClassName('form-delete-deck');
    for (let i = 0; i < deleteDeckForms.length; i++) {
        deleteDeckForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Utilities.disableButton(button);
            let deckId = e.target.docId.value;
            let classDocID = e.target.classdocId.value;
            Elements.modalDeleteDeckConfirmation.show();
            const button2 = document.getElementById('modal-confirmation-delete-deck-yes');
            button2.addEventListener("click", async e => {
                if (classDocID == "false" || classDocID == false) {
                    confirmation = true;
                    await EditDeck.delete_deck(deckId, confirmation);
                } else {
                    confirmation = true;
                    await EditDeck.delete_class_deck(deckId, confirmation, classDocID, Auth.currentUser.uid);
                    //await study_decks_page();

                }
            });
            Utilities.enableButton(button, label);
        });
    }
    const favoritedCheckboxes = document.getElementsByClassName("form-favorite-deck");
    for (let i = 0; i < favoritedCheckboxes.length; ++i) {
        favoritedCheckboxes[i].addEventListener('submit', async e => {
            e.preventDefault();
            const docId = e.target.deckDocId.value;
            const isClassDeck = e.target.isClassDeck.value;

            const favorited = deckList.find(deck => docId == deck.docId).isFavorited ? false : true;
            if (isClassDeck == "false" || isClassDeck == false) {
                await FirebaseController.favoriteDeck(Auth.currentUser.uid, docId, favorited);
                await study_decks_page();
            } else {
                await FirebaseController.favoriteClassDeck(isClassDeck, docId, favorited);
                await study_decks_page();
            }

        });
    }

    const unfavoritedCheckboxes = document.getElementsByClassName("form-unfavorite-deck");
    for (let i = 0; i < unfavoritedCheckboxes.length; ++i) {
        unfavoritedCheckboxes[i].addEventListener('submit', async e => {
            e.preventDefault();
            const docId = e.target.deckDocId.value;
            const isClassDeck = e.target.isClassDeck.value;

            const favorited = deckList.find(deck => docId == deck.docId).isFavorited ? false : true;
            if (isClassDeck == "false" || isClassDeck == false) {
                await FirebaseController.favoriteDeck(Auth.currentUser.uid, docId, favorited);
                await study_decks_page();
            } else {
                await FirebaseController.favoriteClassDeck(isClassDeck, docId, favorited);
                await study_decks_page();
            }
        });
    }


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
                return (firstName < secondName) ? -1 :
                    (firstName > secondName) ? 1 : 0;
            });
            // Each function will operate in a similar manner
        } else if (opt == "subject") {
            list.sort(function (a, b) {
                var aId = a.getAttribute('id');
                var bId = b.getAttribute('id');
                var firstSubject = deckList.find(deck => deck.docId == aId).subject.toLowerCase();
                var secondSubject = deckList.find(deck => deck.docId == bId).subject.toLowerCase();
                return (firstSubject < secondSubject) ? -1 :
                    (firstSubject > secondSubject) ? 1 : 0;
            });
        } else if (opt == "date") {
            list.sort(function (a, b) {
                /* DO NOT TOUCH THIS ONE 
                    A different method could probably be worked out for sorting by name and subject,
                    but dateCreated can ONLY be sorted using a compare function
                */
                var aId = a.getAttribute('id');
                var bId = b.getAttribute('id');
                var firstDate = deckList.find(deck => deck.docId == aId).dateCreated;
                var secondDate = deckList.find(deck => deck.docId == bId).dateCreated;
                // third date ( ͡° ͜ʖ ͡°)
                return (firstDate < secondDate) ? -1 :
                    (firstDate > secondDate) ? 1 : 0;
            });
        } else if (opt == "category") {
            list.sort(function (a, b) {
                var aId = a.getAttribute('id');
                var bId = b.getAttribute('id');
                var firstCategory = deckList.find(deck => deck.docId == aId).category;
                var secondCategory = deckList.find(deck => deck.docId = bId).category;
                return (firstCategory.category < secondCategory.category) ? -1 :
                    (firstCategory.category > secondCategory.category) ? 1 : 0;
            });
        }
        // Finally, append the decks to the div wrapped around them, replacing the original order with the new order
        for (let i = 0; i < list.length; ++i) {
            deckContainer.appendChild(list[i]);
        }
        // If you've made it this far, then thank you for for following along
    })

    //const createDeckButton = document.getElementById(Constant.htmlIDs.createDeck);

    // restructured create deck button to add category dropdown menu
    const createDeckButton = document.getElementById(Constant.htmlIDs.createDeck);
    createDeckButton.addEventListener('click', async e => {

        // call Firebase func. to retrieve categories list
        let categories;
        try {
            categories = await FirebaseController.getCategories();
            //console.log(cat);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }

        // clear innerHTML to prevent duplicates
        Elements.formDeckCategorySelect.innerHTML = '';

        categories.forEach(category => {
            Elements.formDeckCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>
                  `;
        });

        Elements.formClassSelect.innerHTML = '';
        //logic for if the dropdown box selection on create deck is NONE or is a CLASSROOM
        Elements.formClassSelect.innerHTML += `
                    <option value="${noClassDeckSelected}">None</option>
                  `;
        myClassroomList.forEach(myclass => {
            console.log(myclass.docID);
            Elements.formClassSelect.innerHTML += `
                      <option value="${myclass.docID}">${myclass.name}</option>
                  `;

        });




        // opens create Deck modal
        $(`#${Constant.htmlIDs.createDeckModal}`).modal('show');
    })

    const searchDeckButton = document.getElementById('search-decks-button');
    searchDeckButton.addEventListener('click', async e => {
        const searchtype = 'deckSearch';
        Search.setSearchType(searchtype);
        Utilities.searchBox('Search Decks', 'input query');
    })

} //buildStudyDecksPage(deckList)

export function buildDeckView(deck, flashcards, clase, isMastered) {
    console.log("IS MASTER D + " + isMastered);
    window.sessionStorage;
    let html;
    if (isMastered == false) {
        html = `
        <div id="${deck.docId}" class="deck-card">
            <div class="deck-view-css">
            <div class="card-body">
                <h5 class="card-text">${deck.name}</h5>
                <h6 class="card-text" >Subject: ${deck.subject}</h6>
                <h6 class="card-text">Category: ${deck.category}</h6>
                <h7 class="card-text"># of flashcards: ${flashcards.length}</h7>
                <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
            <div class="btn-group">
            <form class="form-view-deck" method="post">
                <input type="hidden" name="docId" value="${deck.docId}">
                <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
                <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
            </form>
            <form class="form-edit-deck" method="post">
                <input type="hidden" name="docId" value="${deck.docId}">
                <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
                <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">edit</i>Edit</button>
            </form>
            <form class="form-delete-deck" method="post">
                <input type="hidden" name="docId" value="${deck.docId}">
                <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
                <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">delete</i>Delete</button>
            </form>
            </div>`

    } else {
        html = `
            <div id="${deck.docId}" class="deck-card">
                <div class="deck-view-css">
                <div class="card-body">
                    <h5 class="card-text"><i class="small material-icons" style="color: #ffdf00;">emoji_events</i>${deck.name}</h5>
                    <h6 class="card-text" >Subject: ${deck.subject}</h6>
                    <h6 class="card-text">Category: ${deck.category}</h6>
                    <h7 class="card-text"># of flashcards: ${flashcards.length}</h7>
                    <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
                <div class="btn-group">
                <form class="form-view-deck" method="post">
                    <input type="hidden" name="docId" value="${deck.docId}">
                    <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
                    <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
                </form>
                <form class="form-edit-deck" method="post">
                    <input type="hidden" name="docId" value="${deck.docId}">
                    <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
                    <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">edit</i>Edit</button>
                </form>
                <form class="form-delete-deck" method="post">
                    <input type="hidden" name="docId" value="${deck.docId}">
                    <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
                    <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">delete</i>Delete</button>
                </form>
                </div>`

    }
    // ternary operator to check if a deck is favorited or not // my changes messed up horizontal view, idk why tho --blake
    html += deck.isFavorited ? ` 
    <form class="form-favorite-deck" method="post">
    <input type="hidden" name="isClassDeck" value="${deck.isClassDeck}">
    <input type="hidden" name="deckDocId" value="${deck.docId}">
    <button id="fav-btn" class="btn btn-link-secondary pomo-text-color-light" type="submit" style="border:none;box-shadow:none;" for="favorited"><i class="material-icons">favorite</i></button>
    <label class="pomo-text-color-light" for="favorited">Favorited</label>
    </form>
    </div>
    </div>
    </div>
    ` : `
    <form class="form-unfavorite-deck" method="post">
    <input type="hidden" name="isClassDeck" value="${deck.isClassDeck}">
    <input type="hidden" name="deckDocId" value="${deck.docId}">
    <button id="unfav-btn" class="btn btn-link-secondary pomo-text-color-light" type="submit" style="border:none;box-shadow:none;" for="favorited"><i class="material-icons">favorite_border</i></button>
    <label class="pomo-text-color-light" for="favorited">Not Favorited</label>
    </form>
    </div></div></div>
    `;



    return html;
}