import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'

export function addEventListeners() {
    Elements.menuShop.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.POMOSHOP);
        await shop_page();
    });
}

export async function shop_page() {
    Elements.root.innerHTML = ``;
    let html = '';

    html += 'PomoShop Page';

    Elements.root.innerHTML = html;
}