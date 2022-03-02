import * as Elements from './elements.js';
import * as Utilities from './utilities.js';
import * as Routes from '../controller/routes.js';
import * as ProtectedMessage from './protected_message.js';
import * as Constants from '../model/constant.js';
import { currentUser } from '../controller/firebase_auth.js';
import { buildDeckView } from './study_decks_page.js';
import * as FirestoreController from '../controller/firebase_controller.js';

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
        await search_page(joinedSearchKeys, searchKeysArray, searchType); //for whichever search you're running

        Utilities.enableButton(button, label);
    });
    
}

export async function search_page(joinedSearchKeys, searchKeysArray, searchType) {

    if (!joinedSearchKeys) {
        Utilities.info('Error', 'No Search Query Found');
        return;
    }

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
            const deckList = searchDecks();
            buildDeckView(deckList);
            break;

        default: Utilities.info('No search type detected');

    }
}

export function setSearchType(searchType) {
    Elements.searchBoxType.value = searchType;
}

export async function searchDecks() {
    let deckList;
    try {
        deckList = await FirestoreController.searchDecks(searchKeysArray);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Utilities.info('There was an error with the Search', JSON.stringify(e));
        return;
    }
    return deckList;
}
