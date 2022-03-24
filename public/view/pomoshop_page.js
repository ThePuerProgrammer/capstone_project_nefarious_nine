import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'

export function addEventListeners() {
    Elements.menuShop.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.POMOSHOP);
        await shop_page();
    });
}

export async function shop_page() {
    Coins.get_coins();

    Elements.root.innerHTML = ``;
    let html = '';

    html += 'PomoShop Page';

    Elements.root.innerHTML = html;
}