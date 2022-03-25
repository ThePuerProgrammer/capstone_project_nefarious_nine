import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
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

    // more buttons can be added for different categories
    if (user.email == adminUser) {
        html += `<div id="pomo-sidenav" class="sidenav">
        <h4 class="item-name pomo-text-color-light" style="font-size: 30px;">Pomoshop</h4>
        <br>
        <button id="default-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Show All</button>
        <br>
        <button id="accessories-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Accessories</button>
        <br>
        <button id="skins-shop-button" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="margin-bottom: 10px">Skins</button>
        <br>
        <button id="add-item-button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" type="button">Add Item</button>
        </div>`;
    } else {
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
    }


    html += `<div class="pomoshop">
        <div class="pomoshop-category" id="accessories">
        <h4 class="item-name pomo-text-color-dark" style="text-align: left; padding: 10px 0px 0px 20px; margin-bottom: -10px;">Accessories</h4>`;

    items.forEach(item => {
        // sort for accessories
        if (item.skinType == "") {
            html += buildItemView(item, user.email);
        }
    });

    html += `</div>
        <br>
        <div class="pomoshop-category" id="skins">
        <h4 class="item-name pomo-text-color-dark" style="text-align: left; padding: 10px 0px 0px 20px; margin-bottom: -10px;">Skins</h4>`;

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
        // disable buy button if already owned
        if (user.itemsOwned.includes(item.docID)) {
            document.getElementById(item.docID).innerHTML = "owned";
            document.getElementById(item.docID).disabled = true;
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
            } catch (e) {
                console.log(e);
            }

        });
    }

    if (user.email == Constant.ADMIN) { //avoids null button/listener errors when user is not admin
        const addItemButton = document.getElementById('add-item-button');
        addItemButton.addEventListener('click', async e => {
            e.preventDefault();
            // let items;
            // items = await FirebaseController.getPomoshopItems();
            Elements.formAddItem.skintype.innerHTML = '';

            Constant.SKINTYPES.forEach(type => {
                Elements.formAddItem.skintype.innerHTML += `
                    <option value="${type}">${type}</option>`;
            });

            Elements.addItemModal.show();
        })

        Elements.formAddItem.form.addEventListener('submit', async e => {
            e.preventDefault();
            await addNewItem(e.target);
            await shop_page();
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

    }


}

function buildItemView(item, email) {
    let html;
    if (email == Constant.ADMIN) {
        html = `<div class="pomoshop-item" id="pomoshop-item"  style="display: inline-block">
        <img src="${item.photoURL}" style="width: 180px; height: 180px; object-fit: cover;  margin-bottom: 10px;">
        <br>
        <h3 class="item-name pomo-text-color-dark" style="text-align: center; font-size: 20px;">${item.name}</h3>
        <br>
        <form class="form-buy-item" method="post">
        <input type="hidden" name="docId" value="${item.docID}">`;

        html += `<div><button id="${item.docID}" class="btn btn-secondary pomo-bg-color-dark" type="submit"style="float:right;margin:auto;text-align: center;display: inline-block">Buy $ ${item.cost}</button>`;

        html += `</form>
        <form class="form-del-item" method="post">
        <input type="hidden" name="docId" value="${item.docID}">
        <button class="btn btn-secondary pomo-bg-color-dark" type="submit" style="text-align: center;margin:auto;display: inline-block">Delete</button>
        </form>
        </div>

        </div>`;

    } else {
        html = `<div class="pomoshop-item" id="pomoshop-item"  style="display: inline-block">
        <img src="${item.photoURL}" style="width: 180px; height: 180px; object-fit: cover;  margin-bottom: 10px;">
        <br>
        <h3 class="item-name pomo-text-color-dark" style="text-align: center; font-size: 20px;">${item.name}</h3>
        <br>
        <form class="form-buy-item" method="post">
        <input type="hidden" name="docId" value="${item.docID}">`;

        html += `<button id="${item.docID}" class="btn btn-secondary pomo-bg-color-dark" type="submit">Buy $ ${item.cost}</button>`;

        html += `</form>
           </div>`;

    }

    return html;
}

async function addNewItem(form) {
    // console.log("Item name test" + form.itemname);

    const name = form.itemname.value;
    const cost = form.itemcost.value;
    const skinType = form.selectSkin.value;
    const pomoshop = new Pomoshop({ name, cost, skinType });

    try {
        const { photoName, photoURL } = await FirebaseController.uploadItemImage(imageFile2Upload);
        pomoshop.photoName = photoName;
        console.log("PHOTO NAME" + pomoshop.photoName);
        pomoshop.photoURL = photoURL;
        console.log("PHOTO URL " + pomoshop.photoURL); //undefined?
        await FirebaseController.addItemtoShop(pomoshop.serialize());
        Utilities.info('Success!', `${pomoshop.name} added!`, Elements.addItemModal);

    } catch (e) {
        if (Constant.DEV) console.log(e)
        Utilities.info('Add Product Failed', JSON.stringify(e), Elements.addItemModal);

    }
}