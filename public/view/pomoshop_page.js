import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {
    Elements.menuShop.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.POMOSHOP);
        await shop_page();
    });
}

export async function shop_page() {
    Coins.get_coins();
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
    html += `<div id="pomo-sidenav" class="sidenav">
    <h4 class="item-name pomo-text-color-light" style="font-size: 30px;">Pomoshop</h4>
    <br>
    <button id="default-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Show All</button>
    <br>
    <button id="accessories-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Accessories</button>
    <br>
    <button id="skins-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Skins</button>
    <br>
    </div>`;


    html += `<div class="pomoshop">
        <div class="pomoshop-category" id="accessories">
        <h4 class="item-name pomo-text-color-dark" style="text-align: left; padding: 10px 0px 0px 20px; margin-bottom: -10px;">Accessories</h4>`;
    
    items.forEach(item => {
        // sort for accessories
        if(item.skinType == "") {
            html += buildItemView(item);
        }
    });
        
    html+= `</div>
        <br>
        <div class="pomoshop-category" id="skins">
        <h4 class="item-name pomo-text-color-dark" style="text-align: left; padding: 10px 0px 0px 20px; margin-bottom: -10px;">Skins</h4>`;

    items.forEach(item => {
        // sort for skins
        if(item.skinType != "") {
            html += buildItemView(item);
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

    
    // button listeners to show different items within the shop
    const defaultShopButton = document.getElementById('default-shop-button');
    defaultShopButton.addEventListener('click', () =>{

        document.getElementById("accessories").style.display = "block";
        document.getElementById("skins").style.display = "block";
    })

    const accessoriesShopButton = document.getElementById('accessories-shop-button');
    accessoriesShopButton.addEventListener('click', () =>{

        document.getElementById("skins").style.display = "none";
        document.getElementById("accessories").style.display = "block";
    })

    const skinsShopButton = document.getElementById('skins-shop-button');
    skinsShopButton.addEventListener('click', () =>{

        document.getElementById("skins").style.display = "block";
        document.getElementById("accessories").style.display = "none";
    })

    const buyItemButtons =
    document.getElementsByClassName("form-buy-item");

    // Add event listener for BUY buttons on each item
    for (let i = 0; i < buyItemButtons.length; i++) {
        buyItemButtons[i].addEventListener('submit', async (e) => {
            e.preventDefault();
            const index = e.target.docId.value;
            const cost = e.target.cost.value;

            user.itemsOwned.push(index);
            user.coins -= cost;
                 
            // call firebase function to update user's itemsOwned and coins
           try {
                await FirebaseController.updateItemsOwned(Auth.currentUser.uid, user.itemsOwned);
                await FirebaseController.updateCoins(Auth.currentUser.uid, user.coins);
            }catch (e) {
                console.log(e);
            }

            //disable the button once bought
            document.getElementById(index).disabled = true;
            document.getElementById(index).innerHTML = "owned";

            await shop_page();
  
        });
    }

}

function buildItemView(item) {

    let html = `<div class="pomoshop-item" id="pomoshop-item"  style="display: inline-block">
        <img src="${item.photoURL}" style="width: 180px; height: 180px; object-fit: cover;  margin-bottom: 10px;">
        <br>
        <h3 class="item-name pomo-text-color-dark" style="text-align: center; font-size: 20px;">${item.name}</h3>
        <br>
        <form class="form-buy-item" method="post">
        <input type="hidden" name="docId" value="${item.docID}">
        <input type="hidden" name="cost" value="${item.cost}">
        <button id="${item.docID}" class="btn btn-secondary pomo-bg-color-dark" type="submit">Buy $ ${item.cost}</button>
        </form>
        </div>`;

    return html;
}