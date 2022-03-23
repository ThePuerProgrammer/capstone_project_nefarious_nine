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

    html += `<div id="pomo-sidenav" class="sidenav">
    <button id="skins-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Skins</button>
    <button id="accessories-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Accessories</button>
    </div>
    <div id="pomoshop"></div>`;

    Elements.root.innerHTML += html;
    const original = html;

    const skinsShopButton = document.getElementById('skins-shop-button');
    skinsShopButton.addEventListener('click', () =>{
        Elements.root.innerHTML = original;
        const skinsShop = '<h3>Skins</h3>';
        const skinShopTag = document.createElement('div');
        skinShopTag.innerHTML = skinsShop;
        document.getElementById('pomoshop').appendChild(skinShopTag);
    })

    const accessoriesShopButton = document.getElementById('accessories-shop-button');
    accessoriesShopButton.addEventListener('click', () =>{
        Elements.root.innerHTML = original;
        const accessoriesShop = '<h3>Accessories</h3>';
        const accessoriesShopTag = document.createElement('div');
        accessoriesShopTag.innerHTML = accessoriesShop;
        document.getElementById('pomoshop').appendChild(accessoriesShopTag);
    })

}