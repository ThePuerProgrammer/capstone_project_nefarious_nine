import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'

export function addEventListeners() {
    Elements.menuTempGodot.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.GODOT);
        await godot_page();
    });
}

export async function godot_page() {
    Elements.root.innerHTML = `GoDot page`;

    // Do godot magic here
}