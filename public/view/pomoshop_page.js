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

    // more buttons can be added for different categories
    html += `<div id="pomo-sidenav" class="sidenav">
    <button id="default-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Show All</button><br>
    <button id="skins-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Skins</button><br>
    <button id="accessories-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Accessories</button><br>
    </div><div id="pomoshop" style="text-align: center;"><h1>Welcome to the PomoShop!</h1><div id="default-tag"><h3>Showing skins and accessories</h3></div></div>`;

    Elements.root.innerHTML = html;

    // button listeners to show different items within the shop
    const defaultShopButton = document.getElementById('default-shop-button');
    defaultShopButton.addEventListener('click', () =>{
        // keep it from duplicating tags
        if(document.getElementById('default-tag')){
            return;
        }
        const defaultShop = '<h3>Showing skins and accessories</h3>';
        const defaultShopTag = document.createElement('div');
        defaultShopTag.id = "default-tag";
        defaultShopTag.innerHTML = defaultShop;
        // check for existing tags and delete them
        const accessoriesTemp = document.getElementById('accessories-tag');
        if(accessoriesTemp){
            accessoriesTemp.remove();
        }
        const skinTemp = document.getElementById('skin-tag');
        if(skinTemp){
            skinTemp.remove();
        }
        document.getElementById('pomoshop').appendChild(defaultShopTag);
    })

    const skinsShopButton = document.getElementById('skins-shop-button');
    skinsShopButton.addEventListener('click', () =>{
        if(document.getElementById('skin-tag')){
            return;
        }
        const skinsShop = '<h3>Skins</h3>';
        const skinShopTag = document.createElement('div');
        skinShopTag.id = "skin-tag";
        skinShopTag.innerHTML = skinsShop;
        const accessoriesTemp = document.getElementById('accessories-tag');
        if(accessoriesTemp){
            accessoriesTemp.remove();
        }
        const defaultTemp = document.getElementById('default-tag');
        if(defaultTemp){
            defaultTemp.remove();
        }
        document.getElementById('pomoshop').appendChild(skinShopTag);
    })

    const accessoriesShopButton = document.getElementById('accessories-shop-button');
    accessoriesShopButton.addEventListener('click', () =>{
        if(document.getElementById('accessories-tag')){
            return;
        }
        const accessoriesShop = '<h3>Accessories</h3>';
        const accessoriesShopTag = document.createElement('div');
        accessoriesShopTag.id = "accessories-tag";
        accessoriesShopTag.innerHTML = accessoriesShop;
        const skinTemp = document.getElementById('skin-tag');
        if(skinTemp){
            skinTemp.remove();
        }
        const defaultTemp = document.getElementById('default-tag');
        if(defaultTemp){
            defaultTemp.remove();
        }
        document.getElementById('pomoshop').appendChild(accessoriesShopTag);
    })

}