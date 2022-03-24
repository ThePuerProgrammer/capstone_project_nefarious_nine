import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as Minigames from './minigames_page.js'
import * as ChillZone from './chillzone_page.js'
import * as Analytics from './analytics_page.js'
import * as Coins from '../controller/coins.js'

export function addEventListeners() {
    Elements.menuHome.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.HOME);
        await home_page();
    });
}

export async function home_page() {

    //shows user coin count for coin display in navbar
    //currently has a bug where coins do not reset after switching user, temp fix is to refresh the page
    Coins.get_coins();


    Elements.root.innerHTML = ``;
    let html = '';
    html += `
    <div style="text-align: center; padding-top: 2%;">
        <h1 class="pomo-text-color-dark pomo-font-weight-bold"> Welcome to Pomobyte! </h1>
        <p class="pomo-text-color-md"> Help Tip: Start your experience by joining a classroom or creating a study deck!<p>
    <div>
    `;

    //Card Display
    html += `
    <div class="row" style="justify-content: space-evenly; max-width: 100%; padding-top: 2%;">
        <div class="card raise pomo-bg-color-md-dark" style="width: 30rem; height: 35rem;">
            <div class="card-body">
                <h5 class="card-title pomo-font-weight-bold">Study Progress</h5>
            </div>
            <input type="image" class="card-img" id="${Constant.htmlIDs.analyticsPage}" src="./assets/images/card_images/study-progress-card.png">
        </div>
        <div class="card raise pomo-bg-color-md-dark" style="width: 30rem; height: 35rem;">
            <div class="card-body">
                <h5 class="card-title pomo-font-weight-bold">Mini-Games</h5>
            </div>
            
        <input type="image" class="card-img" id="${Constant.htmlIDs.miniGamesPage}" src="./assets/images/card_images/mini-games-card.png">
            
        </div>
        <div class="card raise pomo-bg-color-md-dark" style="width: 30rem; height: 35rem;">
            <div class="card-body">
                <h5 class="card-title pomo-font-weight-bold">Chill Zone</h5>
            </div>
            <input type="image" class="card-img" id="${Constant.htmlIDs.chillZonePage}" src="./assets/images/card_images/chill-zone-card.png">
        </div>
    </div>
    `;

    Elements.root.innerHTML = html;

    const miniGamesPage = document.getElementById(
        Constant.htmlIDs.miniGamesPage
    );

    const chillZonePage = document.getElementById(
        Constant.htmlIDs.chillZonePage
    );

    const analyticsPage = document.getElementById(
        Constant.htmlIDs.analyticsPage
    );

    //routes to study progress page
    analyticsPage.addEventListener('click', async e => {
        e.preventDefault();

        history.pushState(null, null, Routes.routePathname.ANALYTICS);
        await Analytics.analytics_page();
    });

    //routes to godot minigames menu
    miniGamesPage.addEventListener('click', async e => {
        e.preventDefault();

        history.pushState(null, null, Routes.routePathname.MINIGAMES);
        await Minigames.minigames_page();
    });

    //routes to chillzone page
    chillZonePage.addEventListener('click', async e => {
        e.preventDefault();

        history.pushState(null, null, Routes.routePathname.CHILLZONE);
        await ChillZone.chill_zone_page();
    });
}