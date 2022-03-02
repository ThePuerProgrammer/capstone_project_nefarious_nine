import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {}

export async function minigames_page() {
    /* Roloading the page causes an error here. 
     * I'm not sure exactly why, but this becomes null. 
     * Perhaps it just happens too fast? Robust testing needed. */
    window.localStorage.setItem('userid', Auth.currentUser.uid)
    window.localStorage.setItem('email', Auth.currentUser.email)
    Elements.root.innerHTML = `
        <div id="pomogame-iframe-container">
            <iframe src="../gd_exports/pomogame.html" id="pomogame-iframe"></iframe>
        </div>
    `;
}