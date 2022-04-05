import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import { Pomoshop } from '../model/pomoshop.js'
import * as Utilities from './utilities.js'

let imageFile2Upload;


export function addEventListeners() {
    Elements.menuShop.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.POMOSHOP);
        await shop_page();
    });

}

export async function shop_page() {
    try{
        await Coins.get_coins(Auth.currentUser.uid);
    } catch(e) {if(Constant.DEV)console.log(e);}

    // retrieve pomoshop items from Firebase
    let items;
    try {
        items = await FirebaseController.getPomoshopItems();
    } catch (e) {
        console.log(e);
    }

    // retrieve user info from Firebase
    let user;
    try {
        user = await FirebaseController.getUser(Auth.currentUser.uid);
    } catch (e) {
        console.log(e);
    }

    let adminUser = Constant.ADMIN;

    Elements.root.innerHTML = ``;
    let html = '';

    html += `<div id="pomo-sidenav" class="sidenav">
        <img src="./assets/images/pomoshop_sign.png" style="height: 95px; width: 285px; object-fit: cover; margin-top: 10px;">
        <div class="pomoshop-sidenav-buttons">
        <br>
        <button id="default-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Show All</button>
        <br>
        <button id="accessories-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Accessories</button>
        <br>
        <button id="skins-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Skins</button>`;
    
    if(user.email == adminUser) {
        html += `<br>
            <button id="add-item-button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" type="button">Add Item</button>`;
    }

    html += `</div>`;

    html += `<div class="equipped-shop-pomopet">`;

    // if no equipped skin
    if (user.equippedSkin == "") {
        html += `<img src="${user.pomopet.petPhotoURL}" style="width: 250px; height: 250px; margin-bottom: -16px;" class="pomopet-display center">`;
    } else {
        let skin = items.find(item => item.docID === user.equippedSkin);
        html += `<img src="${skin.photoURL}" style="width: 250px; height: 250px; margin-bottom: -16px;" class="pomopet-display center">`;
    }

    // if equipped acc
    if (user.equippedAcc != "") {
        let acc = items.find(item => item.docID === user.equippedAcc);
        html += `<img src="${acc.photoURL}" style="height: 80px; width: 100px; margin-bottom: -50px;  object-fit: cover;" class="acc-display center">`;
    }

    html += `<hr class="pomopet-shop-bar">
        </div>
        </div>`;

    html += `<div class="pomoshop">
        <div class="pomoshop-category" id="accessories">
        <h4 class="item-name pomo-text-color-light" style="text-align: left; padding: 10px 0px 0px 20px; margin-bottom: -10px;">Accessories</h4>`;

    items.forEach(item => {
        // sort for accessories
        if (item.skinType == "") {
            html += buildItemView(item, user.email);
        }
    });

    html += `</div>
        <br>
        <div class="pomoshop-category" id="skins">
        <h4 class="item-name pomo-text-color-light" style="text-align: left; padding: 10px 0px 0px 20px; margin-bottom: -10px;">Skins</h4>`;

    items.forEach(item => {
        // sort for skins
        if (item.skinType != "") {
            html += buildItemView(item, user.email);
        }
    });

    html += `</div>
        </div>
        </div>`;

    Elements.root.innerHTML = html;

    items.forEach(item => {
        let equip = item.docID + "_equip"; //create unique id for each item for equip button
        
        if (user.itemsOwned.includes(item.docID)) {
            // if item is currently equipped, show unequip
            if((user.equippedAcc == item.docID) || (user.equippedSkin == item.docID)) {
                document.getElementById(equip).innerHTML = "Unequip";
            }

            // for skins, only show equip for equipped pomopet 
            //(e.g. only show equip dog skins if pomopet is dog)
            if((item.skinType != "") && (user.pomopet.type != item.skinType)) {
                document.getElementById(item.docID).innerHTML = "owned";
                document.getElementById(item.docID).disabled = true;
            } else {
                // hide buy button, show equip button if already owned
                document.getElementById(item.docID).style.display = "none";
                document.getElementById(equip).style.display = "block";
            }  
        }
        // disable buy button if not enough funds
        else if (user.coins < item.cost) {
            document.getElementById(item.docID).disabled = true;
        }
    });

    // button listeners to show different items within the shop
    const defaultShopButton = document.getElementById('default-shop-button');
    defaultShopButton.addEventListener('click', () => {

        document.getElementById("accessories").style.display = "block";
        document.getElementById("skins").style.display = "block";
    })

    const accessoriesShopButton = document.getElementById('accessories-shop-button');
    accessoriesShopButton.addEventListener('click', () => {

        document.getElementById("skins").style.display = "none";
        document.getElementById("accessories").style.display = "block";
    })

    const skinsShopButton = document.getElementById('skins-shop-button');
    skinsShopButton.addEventListener('click', () => {

        document.getElementById("skins").style.display = "block";
        document.getElementById("accessories").style.display = "none";
    })

    const buyItemButtons =
        document.getElementsByClassName("form-buy-item");

    // Add event listeners for BUY buttons on each item
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
            } catch (e) {
                console.log(e);
            }

            await shop_page();
        });
    }

    const equipItemButtons =
        document.getElementsByClassName("form-equip-item");

    // Add event listeners for EQUIP buttons on each item
    for (let i = 0; i < equipItemButtons.length; i++) {
        equipItemButtons[i].addEventListener('submit', async (e) => {
            e.preventDefault();
            let index = e.target.docId.value;
            let skinType = e.target.skin.value;

            // call firebase function to update user's equippedAcc / equippedSkin
            try {
                if(skinType == "") {
                    // if press unequip, clear equippedAcc
                    if(user.equippedAcc == index) {
                        index = "";
                    }
                    await FirebaseController.updateEquippedAcc(Auth.currentUser.uid, index);
                } else {
                    // if press unequip, clear equippedSkin
                    if(user.equippedSkin == index) {
                        index = "";
                    }
                    await FirebaseController.updateEquippedSkin(Auth.currentUser.uid, index);
                }
            } catch (e) {
                console.log(e);
            }

            await shop_page();
        });
    }

    if (user.email == Constant.ADMIN) { //avoids null button/listener errors when user is not admin

        const deleteButtons = document.getElementsByClassName('form-del-item');

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('submit', async e => {
                e.preventDefault();
                const docID = e.target.docId.value;
                const imagename = e.target.imagename.value;
                await FirebaseController.deleteItemFromShop(imagename, docID);
                await shop_page();
            });
        }

        const addItemButton = document.getElementById('add-item-button');
        addItemButton.addEventListener('click', async e => {
            e.preventDefault();
            // let items;
            // items = await FirebaseController.getPomoshopItems();
            Elements.formAddItem.skintype.innerHTML = '';

            Elements.formAddItem.skintype.innerHTML += `
            <option value="">accessory</option>`;

            Constant.SKINTYPES.forEach(type => {
                Elements.formAddItem.skintype.innerHTML += `
                    <option value="${type}">${type}</option>`;
            });

            Elements.addItemModal.show();
        })

        Elements.formAddItem.imageButton.addEventListener('change', e => {
            imageFile2Upload = e.target.files[0];
            if (!imageFile2Upload) {
                Elements.formAddItem.imageTag.src = null;
                return;
            }
            const reader = new FileReader(); //reads the object
            reader.onload = () => Elements.formAddItem.imageTag.src = reader.result
            reader.readAsDataURL(imageFile2Upload);
        })

        Elements.formAddItem.form.addEventListener('submit', async e => {
            e.preventDefault();
            const name = e.target.itemname.value;
            const cost = e.target.itemcost.value;
            const skinType = e.target.selectSkin.value;
            const rarity = 1; // default, to be updated @ Blake
            const pomoshop = new Pomoshop({ name, cost, skinType, rarity });

            try {
                const { imagename, imageURL } = await FirebaseController.uploadItemImage(imageFile2Upload);
                pomoshop.photoName = imagename;
                pomoshop.photoURL = imageURL;
                await FirebaseController.addItemtoShop(pomoshop.serialize());
                Utilities.info('Success!', `Item ${e.target.itemname.value} has been added`, 'modal-add-item');
                await shop_page();
            } catch (e) {
                if (Constant.DEV) console.log(e)

            }

        })
        // Elements.formAddItem.reset();
    }
}

function buildItemView(item, email) {
    let html;
    
    // display DELETE button if user is ADMIN
    if (email == Constant.ADMIN) {

        html = `<div class="pomoshop-item" id="pomoshop-item"  style="display: inline-block;">`;
        
        // change sizing for acc pics
        if(item.skinType == "") {
            html += `<img src="${item.photoURL}" style="height: 150px; width: 180px; object-fit: cover;  margin-bottom: 10px;">`;
        }
        else {
            html += `<img src="${item.photoURL}" style="height: 180px; width: 180px; object-fit: cover;  margin-bottom: 10px;">`;
        }
        
        html += `<br>
            <h3 class="item-name pomo-text-color-dark" style="font-size: 20px; text-align: center; margin-bottom: -10px;">${item.name}</h3>`;

        //display item rarity stars
        if(item.rarity == 1) {
            html += `<h4 style="margin-top: 10px; text-align: center;">
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star_border</i>
                <i class="material-icons pomo-text-color-light">star_border</i>
            </h4>`;
        }
        else if(item.rarity == 2) {
            html += `<h4 style="margin-top: 10px; text-align: center;">
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star_border</i>
            </h4>`;

            //cost multiplier
            item.cost *= 2;
        }
        else if(item.rarity == 3) {
            html += `<h4 style="margin-top: 10px; text-align: center;">
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star</i>
            </h4>`;

            //cost multiplier
            item.cost *= 3;
        }

        // BUTTONS div
        html += `<div  style="display: inline-block;">`;

        // BUY button hidden for admin
        html += `
            <form class="form-buy-item" method="post">
            <input type="hidden" name="docId" value="${item.docID}">
            <input type="hidden" name="cost" value="${item.cost}">
            <button id="${item.docID}" class="btn btn-secondary pomo-bg-color-dark" style="display: none;" type="submit">Buy $ ${item.cost}</button>
        </form>`;

        let equip = item.docID + "_equip";  //create unique id for each item for equip button 

        // EQUIP button hidden for admin
        html += `<form class="form-equip-item" method="post">
            <input type="hidden" name="docId" value="${item.docID}">
            <input type="hidden" name="skin" value="${item.skinType}">
            <button id="${equip}" class="btn btn-secondary pomo-bg-color-md" style="display: none;" type="submit">Equip</button>
        </form>`;

        // display DELETE button if user is ADMIN
        html += `</form>
                <form class="form-del-item" method="post">
                <input type="hidden" name="docId" value="${item.docID}">
                <input type="hidden" name="imagename" value="${item.photoName}">
                <button class="btn btn-secondary pomo-bg-color-dark" type="submit">Delete</button>
            </form>`;

        html += `</div>
            </div>`;

    } else {

        html = `<div class="pomoshop-item" id="pomoshop-item"  style="display: inline-block;">`;
        
        // change sizing for acc pics
        if(item.skinType == "") {
            html += `<img src="${item.photoURL}" style="height: 150px; width: 180px; object-fit: cover;  margin-bottom: 10px;">`;
        }
        else {
            html += `<img src="${item.photoURL}" style="height: 180px; width: 180px; object-fit: cover;  margin-bottom: 10px;">`;
        }
        
        html += `<br>
            <h3 class="item-name pomo-text-color-dark" style="font-size: 20px; text-align: center; margin-bottom: -10px;">${item.name}</h3>`;

        //display item rarity stars
        if(item.rarity == 1) {
            html += `<h4 style="margin-top: 10px; text-align: center;">
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star_border</i>
                <i class="material-icons pomo-text-color-light">star_border</i>
            </h4>`;
        }
        else if(item.rarity == 2) {
            html += `<h4 style="margin-top: 10px; text-align: center;">
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star_border</i>
            </h4>`;

            //cost multiplier
            item.cost *= 2;
        }
        else if(item.rarity == 3) {
            html += `<h4 style="margin-top: 10px; text-align: center;">
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star</i>
                <i class="material-icons pomo-text-color-light">star</i>
            </h4>`;

            //cost multiplier
            item.cost *= 3;
        }

        // BUTTONS div
        html += `<div  style="display: inline-block;">`;

        // BUY button
        html += `
            <form class="form-buy-item" method="post">
            <input type="hidden" name="docId" value="${item.docID}">
            <input type="hidden" name="cost" value="${item.cost}">
            <button id="${item.docID}" class="btn btn-secondary pomo-bg-color-dark" type="submit">Buy $ ${item.cost}</button>
        </form>`;

        let equip = item.docID + "_equip";  //create unique id for each item for equip button 

        // EQUIP button
        html += `<form class="form-equip-item" method="post">
            <input type="hidden" name="docId" value="${item.docID}">
            <input type="hidden" name="skin" value="${item.skinType}">
            <button id="${equip}" class="btn btn-secondary pomo-bg-color-md" style="display: none;" type="submit">Equip</button>
        </form>`;
        
        html += `</div>
            </div>`;
    }

    return html;
}