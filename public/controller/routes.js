import * as Home from '../view/home_page.js'
import * as Classrooms from '../view/classrooms_page.js'
import * as StudyDecks from '../view/study_decks_page.js'
import * as Profile from '../view/profile_page.js'
import * as Settings from '../view/settings_page.js'
import * as Deck from '../view/deck_page.js'
import * as Study from '../view/study_page.js'
import * as Minigames from '../view/minigames_page.js'
import * as OneClassroom from '../view/one_classroom_page.js';
import * as ChillZone from '../view/chillzone_page.js'
import * as Analytics from '../view/analytics_page.js'
import * as Search from '../view/search_page.js';
import * as HelpTicketsPage from '../view/help_tickets_page.js';
import * as OneHelpTicketPage from '../view/one_help_ticket_page.js';


export const routePathname = {
    HOME: '/',
    CLASSROOMS: '/classrooms',
    STUDYDECKS: '/study-decks',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    DECK: '/deck',
    STUDY: '/study',
    MINIGAMES: '/minigames',
    ONECLASSROOM: '/classroom',
    CHILLZONE: '/chillzone',
    ANALYTICS: '/analytics',
    SEARCH: '/search',
    HELPTICKETSPAGE: '/helptickets',
    ONEHELPTICKET: '/helpticket',
};

export const routes = [
    { pathname: routePathname.HOME, page: Home.home_page },
    { pathname: routePathname.CLASSROOMS, page: Classrooms.classrooms_page },
    { pathname: routePathname.STUDYDECKS, page: StudyDecks.study_decks_page },
    { pathname: routePathname.PROFILE, page: Profile.profile_page },
    { pathname: routePathname.SETTINGS, page: Settings.settings_page },
    { pathname: routePathname.DECK, page: Deck.deck_page },
    { pathname: routePathname.STUDY, page: Study.study_page },
    { pathname: routePathname.MINIGAMES, page: Minigames.minigames_page },
    { pathname: routePathname.ONECLASSROOM, page: OneClassroom.one_classroom_page },
    { pathname: routePathname.CHILLZONE, page: ChillZone.chill_zone_page },
    { pathname: routePathname.ANALYTICS, page: Analytics.analytics_page },
    { pathname: routePathname.SEARCH, page: Search.search_page },
    { pathname: routePathname.HELPTICKETSPAGE, page: HelpTicketsPage.help_tickets_page },
    { pathname: routePathname.ONEHELPTICKET, page: OneHelpTicketPage.one_help_ticket_page },

];

export function routing(path, hash) {
    const route = routes.find(r => r.pathname == path);
    if (route) route.page();
    else routes[0].page();
}