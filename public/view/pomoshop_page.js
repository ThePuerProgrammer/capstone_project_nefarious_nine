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

    // retrieve user info from Firebase
    let user;
    try {
        user = await FirebaseController.getUser(Auth.currentUser.uid);
    }catch (e) {
        console.log(e);
    }

    Elements.root.innerHTML = ``;
    let html = '';

    // more buttons can be added for different categories
    /*html += `<div id="pomoshop-page">
    <div id="pomo-sidenav" class="sidenav">
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
    `;*/
        
    html += `<div class="pomoshop-category" id="accessories">`;
    
    items.forEach(item => {
        // sort for accessories
        if(item.skinType == "") {
            html += buildItemView(item, user);
        }
    });
        
    html+= `</div>
        <br>
        <br>
        <div class="pomoshop-category" id="skins">`;

    items.forEach(item => {
        // sort for skins
        if(item.skinType != "") {
            html += buildItemView(item, user);
        }
    });
            
    html += `</div>
    </div>
    </div>`;



    Elements.root.innerHTML = html;

    items.forEach(item => {
        // disable buy button if already owned
        if (user.itemsOwned.includes(item.docID)) {
            document.getElementById(item.docID).innerHTML = "owned";
            document.getElementById(item.docID).disabled = true;
        }
        // disable buy button if not enough funds
        else if(user.coins < item.cost) {
            document.getElementById(item.docID).disabled = true;
        }
    });

    /*
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
    })*/

    const buyItemButtons =
    document.getElementsByClassName("form-buy-item");

    // Add event listener for BUY buttons on each item
    for (let i = 0; i < buyItemButtons.length; i++) {
        buyItemButtons[i].addEventListener('submit', async (e) => {
            e.preventDefault();
            const index = e.target.docId.value
            console.log(index);

            user.itemsOwned.push(index);

            //disable the button once bought
            document.getElementById(index).disabled = true;
            document.getElementById(index).innerHTML = "owned";

            //TODO: substract and update coins
                 
            // call firebase function to update user's itemsOwned
           try {
                await FirebaseController.updateItemsOwned(Auth.currentUser.uid, user.itemsOwned);
            }catch (e) {
                console.log(e);
            }
  
        });
    }

}

function buildItemView(item, user) {

    let html = `<div id="pomoshop-item"  style="display: inline-block">
        <img src="${item.photoURL}" style="width: 200px; height: 200px; object-fit: cover;">
        <h3 class="item-name pomo-text-color-dark" style="text-align: center; font-size: 20px;">${item.name}</h3>

        <form class="form-buy-item" method="post">
        <input type="hidden" name="docId" value="${item.docID}">`;
    
        html += `<button id="${item.docID}" class="btn btn-secondary pomo-bg-color-dark" type="submit">Buy $ ${item.cost}</button>`;
         
        html += `</form>
           </div>`;

    return html;
}