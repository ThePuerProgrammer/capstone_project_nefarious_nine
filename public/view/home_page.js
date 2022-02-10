import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'

export function addEventListeners() {
    Elements.menuHome.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.HOME);
        await home_page();
    });
}

export async function home_page() {
    Elements.root.innerHTML = `Home page`;
}