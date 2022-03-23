import * as Routes from './controller/routes.js'
import * as Home from './view/home_page.js'
import * as Classrooms from './view/classrooms_page.js'
import * as StudyDecks from './view/study_decks_page.js'
import * as Profile from './view/profile_page.js'
import * as Settings from './view/settings_page.js'
import * as PomoTimer from './view/pomo_timer.js'
import * as FirebaseAuth from './controller/firebase_auth.js'
import * as Deck from './view/deck_page.js'
import * as Study from '../view/study_page.js'
import * as Minigames from '../view/minigames_page.js'
import * as EditFlashcard from './controller/edit_flashcard.js'
import * as EditDeck from './controller/edit_deck.js'
import * as Search from '../view/search_page.js'
import * as HelpTicketsPage from '../view/help_tickets_page.js'
import * as ShopPage from '../view/pomoshop_page.js';

window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    Routes.routing(pathname, hash);
}

window.addEventListener('popstate', e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    const hash = e.target.location.hash;
    Routes.routing(pathname, hash);
});

Home.addEventListeners();
Classrooms.addEventListeners();
StudyDecks.addEventListeners();
Profile.addEventListeners();
Settings.addEventListeners();
PomoTimer.addEventListeners();
FirebaseAuth.addEventListeners();
Deck.addEventListeners();
Study.addEventListeners();
Minigames.addEventListeners();
EditFlashcard.addEventListeners();
EditDeck.addEventListeners();
Search.addEventListeners();
HelpTicketsPage.addEventListeners();
ShopPage.addEventListeners();
