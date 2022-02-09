import * as Home from '../view/home_page.js'
import * as Classrooms from '../view/classrooms_page.js'
import * as StudyDecks from '../view/study_decks_page.js'
import * as Profile from '../view/profile_page.js'
import * as Settings from '../view/settings_page.js'

export const routePathname = {
    HOME: '/',
    CLASSROOMS: '/classrooms',
    STUDYDECKS: '/study-decks',
    PROFILE: '/profile',
    SETTINGS: '/settings'
};

export const routes = [
    { pathname: routePathname.HOME,         page: Home.home_page },
    { pathname: routePathname.CLASSROOMS,   page: Classrooms.classrooms_page },
    { pathname: routePathname.STUDYDECKS,   page: StudyDecks.study_decks_page },
    { pathname: routePathname.PROFILE,      page: Profile.profile_page },
    { pathname: routePathname.SETTINGS,     page: Settings.settings_page },
];

export function routing(path, hash) {
    const route = routes.find(r => r.pathname == path);
    if (route) route.page();
    else routes[0].page();
}