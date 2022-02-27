import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {
    Elements.menuTempGodot.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.MINIGAMES);
        await minigames_page();
    });
}

export async function minigames_page() {
    window.localStorage.setItem('userid', Auth.currentUser.uid)
    window.localStorage.setItem('email', Auth.currentUser.email)
    Elements.root.innerHTML = `
        <div id="pomogame-iframe-container">
            <iframe src="../gd_exports/pomogame.html" id="pomogame-iframe"></iframe>
        </div>
    `;
}