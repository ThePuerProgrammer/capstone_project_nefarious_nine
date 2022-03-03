import * as Elements from './elements.js';
import * as Utilities from './utilities.js';
import * as Routes from '../controller/routes.js';
import * as ProtectedMessage from './protected_message.js';
import * as Constants from '../model/constant.js';
import { currentUser } from '../controller/firebase_auth.js';
import { buildDeckView, buildStudyDecksPage } from './study_decks_page.js';
import * as FirebaseController from '../controller/firebase_controller.js';

let searchType;

export function addEventListeners() {

    Elements.formSearchBox.addEventListener('submit', async e => {
        e.preventDefault();
        const searchKeys = e.target.searchKeys.value.trim();
        if (searchKeys.length==0) {
            Utilities.info('Error', 'No search key found');
            return;
        }

        const button = e.target.getElementsByTagName('button')[0];
        const label = Utilities.disableButton(button);

        const searchKeysArray = searchKeys.toLowerCase(). match(/\S+/g);
        const joinedSearchKeys = searchKeysArray.join(',');

        history.pushState(null, null, Routes.routePathname.SEARCH + '#' + joinedSearchKeys);
        searchType = Elements.searchBoxType.value;
        await search_page(joinedSearchKeys, searchType); //for whichever search you're running

        Utilities.enableButton(button, label);
        e.target.reset();
        Elements.modalSearchBox.hide();
    });
    
}

export async function search_page(joinedSearchKeys, searchType) {
    

    if (!joinedSearchKeys) {
        Utilities.info('Error', 'No Search Keys Found');
        return;
    }

    const searchKeysArray = joinedSearchKeys.split(',');

    if (searchKeysArray.length == 0) {
        Utilities.info('Erros', 'No Search Query Found');
        return;
    }

    if (!currentUser) {
        Elements.root.innerHTML = ProtectedMessage.html;
        return;
    }

    switch(searchType) {

        case 'deckSearch':
            const deckList = searchDecks(searchKeysArray);
            //buildStudyDecksHeader();
            buildStudyDecksPage(deckList);
            break;

        default: Utilities.info('No search type detected');

    }
}

export function buildStudyDecksHeader() {
    html += '<h1> Study Decks Searched by: </h1> '
    ;
}

// export function assembleDeckSearchPage(deckList) {
//     html += `<div id="deck-container">`
//     for (let i = 0; i < deckList.length; i++) { //assembles the deck view
//         let flashcards = await FirebaseController.getFlashcards(currentUser.uid, deckList[i].docId);
//         html += buildDeckView(deckList[i], flashcards);
//     }
//     html += `</div>`

//     if (deckList.length == 0) {
//         html += '<h2> No searched decks found!</h2>'
//     }
// }

export function setSearchType(searchType) {
    Elements.searchBoxType.value = searchType;
}

export async function searchDecks(searchKeysArray) {
    let deckList;
    try {
        deckList = await FirebaseController.searchDecks(currentUser.uid, searchKeysArray);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Utilities.info('There was an error with the Search', JSON.stringify(e));
        return;
    }
    return deckList;
}
