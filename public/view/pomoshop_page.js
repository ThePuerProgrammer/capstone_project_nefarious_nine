import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {
    Elements.menuShop.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.POMOSHOP);
        await shop_page();
    });
}

export async function shop_page() {
    // retrieve pomoshop items from Firebase
    let items;
    try {
        items = await FirebaseController.getPomoshopItems();
    }catch (e) {
        console.log(e);
    }

    // retrieve user's owned & equipped info
    let user;
    try {
        //user = await FirebaseController.getUser();
    }catch (e) {
        console.log(e);
    }

    Elements.root.innerHTML = ``;
    let html = '';

    // more buttons can be added for different categories
    html += `<div id="pomo-sidenav" class="sidenav">
    <button id="default-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Show All</button>
    <br>
    <button id="skins-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Skins</button>
    <br>
    <button id="accessories-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Accessories</button>
    <br>
    </div>
    <div id="pomoshop">
    <h1>Welcome to the PomoShop!</h1>
    <div id="default-tag">
    <h3>Showing skins and accessories</h3>
    </div>
    `;
        
    html += `<div class="pomoshop-category" id="accessories">`;
    
    items.forEach(item => {
        html += buildItemView(item);
    });
        
    html+= `</div>
        <br>
        <br>
        <div class="pomoshop-category" id="skins">`;

    items.forEach(item => {
        html += buildItemView(item);
    });
            
    html += `</div>
    </div>`;



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

    const buyItemButtons =
    document.getElementsByClassName("form-buy-item");

    // Add event listener for BUY buttons on each item
    for (let i = 0; i < buyItemButtons.length; i++) {
        buyItemButtons[i].addEventListener('submit', async (e) => {
            e.preventDefault();
            const index = e.target.docId.value

            // add call to firebase function to update user's itemsOwned
  
        });
    }

}

function buildItemView(item) {
    let html = `<div id="pomoshop-item"  style="display: inline-block">
        <img src="${item.photoURL}" style="width: 200px; height: 200px; object-fit: cover;">
        <h3 class="item-name pomo-text-color-dark" style="text-align: center; font-size: 20px;">${item.name}</h3>

        <form class="form-buy-item" method="post">
        <input type="hidden" name="docId" value="${item.docID}">
        <button class="btn btn-secondary pomo-bg-color-dark" type="submit">Buy $ ${item.cost}</button>
        </form>
    </div>`;

    return html;
}