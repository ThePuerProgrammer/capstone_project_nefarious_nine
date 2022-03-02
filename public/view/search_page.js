import * as Elements from './elements.js';
import * as Util from './utilities.js';
import * as Routes from '../controller/routes.js';
import * as ProtectedMessage from './protected_message.js';
import * as Constants from '../model/constant.js';
import { currentUser } from "../controller/firebase_auth.js";
import { buildDeckView } from "./study_decks_page.js";
import * as FirestoreController from '../controller/firebase_controller.js';

export function addEventListeners() {

    //SEARCH DECKS EVENT search button event listener
    Elements.formSearchDeck.addEventListener('submit', async e => {
        e.preventDefault();
        const searchKeys = e.target.searchKeys.value.trim();
        if (searchKeys.length==0) {
            Uint8ClampedArray.info('Error', 'No search key found');
            return;
        }

        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);

        const searchKeysArray = searchKeys.toLowerCase(). match(/\S+/g);
        const joinedSearchKeys = searchKeysArray.join(',');

        history.pushState(null, null, Routes.routePathname.SEARCH + '#' + joinedSearchKeys);
        await search_page(joinedSearchKeys);

        Util.enableButton(button, label);
    });
    
}

export async function search_page(joinedSearchKeys) {

    if (!joinedSearchKeys) {
        Util.info('Error', 'No Search Query Found');
        return;
    }

    if (searchKeysArray.length == 0) {
        Util.info('Erros', 'No Search Query Found');
        return;
    }

    if (!currentUser) {
        Elements.root.innerHTML = ProtectedMessage.html;
        return;
    }

    let deckList;
    try {
        deckList = await FirestoreController.searchDecks(searchKeysArray);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Util.info('There was an error with the Search', JSON.stringify(e));
        return;
    }
    
    buildDeckView(deckList);
}