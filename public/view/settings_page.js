import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'

export function addEventListeners() {
    Elements.menuSettings.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.SETTINGS);
        await settings_page();
    });
}

export async function settings_page() {
    Elements.root.innerHTML = `Settings Page`;
}