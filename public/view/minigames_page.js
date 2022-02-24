import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'

export function addEventListeners() {
    Elements.menuTempGodot.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.MINIGAMES);
        await minigames_page();
    });
}

export async function minigames_page() {
    Elements.root.innerHTML = `
        <div id="pomogame-iframe-container">
            <iframe src="pomogame.html" id="pomogame-iframe"></iframe>
        </div>
    `;
}