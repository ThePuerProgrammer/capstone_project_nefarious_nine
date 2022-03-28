import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'
import * as Utilities from './utilities.js';
import { Pomoshop } from '../model/pomoshop.js'

//Declaration of Image
let imageFile2UploadProfile = "";
let currentPfpURL;
let currentPfpName;

export function addEventListeners() {
    Elements.menuProfile.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.PROFILE);
        await profile_page();
    });

    // EDIT PROFILE Submit button event listener
    Elements.formEditProfile.form.addEventListener('submit', async e => {
        e.preventDefault();
        const username = e.target.username.value;
        const bio = e.target.bio.value;

        try {
            // if updated pfp
            if(imageFile2UploadProfile != "") {
                const {profilePictureName, profilePictureURL} = await FirebaseController.uploadProfilePicture(imageFile2UploadProfile, currentPfpName);
                await FirebaseController.updateUserProfile(Auth.currentUser.uid, username, bio, profilePictureName, profilePictureURL);
            } else {
                await FirebaseController.updateUserProfile(Auth.currentUser.uid, username, bio, null, null);
            }
            await profile_page();
            Elements.modalEditProfile.hide();
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }
    });

    // Event listener for UPLOAD IMAGE button on Edit Profile modal
    Elements.formEditProfile.profilePictureButton.addEventListener('change', e => {
        e.preventDefault();
        imageFile2UploadProfile = e.target.files[0];

        if(!imageFile2UploadProfile){
            Elements.formEditProfile.profilePictureTag.src= currentPfpURL;
            return;
        }

        //Loads the Image and displays preview
        const reader = new FileReader();
        reader.onload = () => (Elements.formEditProfile.profilePictureTag.src = reader.result);
        reader.readAsDataURL(imageFile2UploadProfile);
    });

    // Clears EDIT PROFILE input fields when user closes modal
    $(`#edit-profile-modal`).on('hidden.bs.modal', function (e) {
        Elements.formEditProfile.form.reset();
    });

    Elements.addAccessoriesButton.addEventListener('click', e => {
        e.preventDefault();
        const accessoriesList = document.getElementById('current-accessories-list');
        const selectAccessories = document.getElementById('select-accessories');
        const addItem = selectAccessories.options[selectAccessories.selectedIndex].value;
        const checkItem = document.getElementById(addItem);
        // TODO: make sure you can only have one skin or one hat equipped
        if (checkItem) {
            accessoriesList.removeChild(checkItem);
        } else {
            const itemLi = document.createElement('li');
            itemLi.setAttribute('id', addItem);
            itemLi.setAttribute('class', 'list-group-item items-list');
            itemLi.appendChild(document.createTextNode(addItem));
            accessoriesList.appendChild(itemLi);
        }
    })

    Elements.removeAccessoriesButton.addEventListener('click', e => {
        e.preventDefault();
        const accessoriesList = document.getElementById('current-accessories-list');
        const selectAccessories = document.getElementById('select-accessories');
        const removeItem = selectAccessories.options[selectAccessories.selectedIndex].value;
        const checkItem = document.getElementById(removeItem);
        if (checkItem) {
            accessoriesList.removeChild(checkItem);
        } else {
            Utilities.info('Item not equipped', 'The item hasn\'t been equipped yet');
        }
    })

    // need a way to return pet to default skin
    Elements.submitAccessoriesButton.addEventListener('click', async () => {
        const user = await FirebaseController.getUser(Auth.currentUser.uid);
        const pomopet = user.pomopet;
        let itemsOwnedList = [];
        for (let i = 0; i < user.itemsOwned.length; i++) {
            const tempItem = await FirebaseController.getOwnedItem(user.itemsOwned[i]);
            itemsOwnedList.push(tempItem);
        }
        const accessoriesList = document.getElementsByClassName('items-list');
        for (let i = 0; i < accessoriesList.length; i++) {
            for (let j = 0; j < itemsOwnedList.length; j++) {
                if (itemsOwnedList[j].name == accessoriesList[i].id) {
                    pomopet.petPhotoURL = itemsOwnedList[j].photoURL;
                    pomopet.petSkin = itemsOwnedList[j].skinType;
                    await FirebaseController.updatePomopet(Auth.currentUser.uid, pomopet);
                    break;
                }
            }
        }
        Elements.modalDressup.hide();
        await profile_page();
    })
}

export async function profile_page() {
    try{
        await Coins.get_coins(Auth.currentUser.uid);
    } catch(e) {if(Constant.DEV)console.log(e);}    
    imageFile2UploadProfile = ""; // reset

    // retrieve user info from Firebase
    let user;
    try {
        user = await FirebaseController.getUser(Auth.currentUser.uid);
        currentPfpName = user.profilePhotoName;
        currentPfpURL= user.profilePhotoURL;
    }catch (e) {
        console.log(e);
    }

    let html = '';

    // EDIT PROFILE button    
    html += `<div class="edit-profile-btn">
        <button id="${Constant.htmlIDs.editProfile}" type="button" class="btn btn-secondary pomo-bg-color-dark" style="padding:5px 12px; float:right">
        <i class="material-icons pomo-text-color-light">edit</i>Edit Profile</button>
        <button type="button" id="pomo-dressup-btn" class="btn btn-secondary pomo-bg-color-md-dark" style="float:right; margin-right: 10px;">Dress up!</button>
        </div>`;

    html += `<div class="user-profile">
        <img src="${user.profilePhotoURL}" style="width: 200px; height: 200px; object-fit: cover;" class="center pfp">
        <br>
        <h3 class="user-username pomo-text-color-dark">${user.username}</h3>`;

    // if user bio, display
    if (user.userBio != "") {
        html += `<p>${user.userBio}</p>`;
    }

    html += `</div>`;

    html += `<div class="equipped-pomopet">

    <img src="${user.pomopet.petPhotoURL}" style="width: 200px; height: 200px; margin-bottom: -16px;" class="center">
    <hr class="pomopet-bar">`;
    

    html += `<div id="pomopet-edit-name-display">
        <button type="button" class="pomopet-edit-name-btn pomo-text-color-dark" id="pomopet-edit-name-btn" 
            style="font-size: 25px; font-weight: bold;">${user.pomopet.name}</button>
    </div>`;

    html += `<div id="pomopet-edit-name-form-display" style="display:none;">
        <form class="pomopet-edit-name-form" id="${Constant.htmlIDs.formEditPomopetName}">
        <input type="pomopet-name" class="form-control" style="flex: 3; margin-right: 20px;"
            id="pomopet-name" type="name" name='name' value="${user.pomopet.name}" placeholder="press esc to cancel" required minlength="1" autocomplete="off">
        <button type="submit" class="btn btn-secondary pomo-bg-color-md-dark" style="flex: 1;">Save</button>
        </form>
        </div>`;

    html += `</div>`;

    Elements.root.innerHTML = html;


    //** DYNAMIC EVENT LISTENERS **//

    const dressupButton = document.getElementById('pomo-dressup-btn');
    dressupButton.addEventListener('click', async e => {
        e.preventDefault();
        // opens dress up ✺◟(♥ᴥ♥)◞✺ modal
        document.getElementById('pomo-dressup-image').src = user.pomopet.petPhotoURL;
        const accessoriesSelect = document.getElementById('select-accessories');
        // clears out accessories list to prevent duplicates
        for (let i = accessoriesSelect.length; i > 0; i--) {
            accessoriesSelect.remove(i);
        }
        let itemsOwnedList = [];
        for (let i = 0; i < user.itemsOwned.length; i++) {
            const tempItem = await FirebaseController.getOwnedItem(user.itemsOwned[i]);
            itemsOwnedList.push(tempItem);
        }
        // rebuilds accessories list from owned items
        itemsOwnedList.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.name;
            opt.innerHTML = item.name;
            accessoriesSelect.appendChild(opt);
        })
        Elements.modalDressup.show();
    });

    const editProfileButton = document.getElementById(Constant.htmlIDs.editProfile);

    // EDIT PROFILE open modal button listener 
    editProfileButton.addEventListener('click', async e => {
        e.preventDefault();

        // doesn't seem necesarry to retrieve user info from firebase again, but can be added if needed
        // retrieve user info from Firebase
        /* let user;
         try {
             user = await FirebaseController.getUser(Auth.currentUser.uid);
         }catch (e) {
             console.log(e);
         }*/

        Elements.formEditProfile.profilePictureTag.src = `${user.profilePhotoURL}`;
        Elements.formEditProfile.username.value = `${user.username}`;
        Elements.formEditProfile.userBio.value = `${user.userBio}`;

        // opens edit Profile modal
        $(`#${Constant.htmlIDs.editProfileModal}`).modal('show');
    });

    // POMOPET NAME button listener
    const pomopetEditNameButton = document.getElementById('pomopet-edit-name-btn');

    pomopetEditNameButton.addEventListener('click', async e => {
        e.preventDefault();
        document.getElementById("pomopet-edit-name-display").style.display = "none";
        document.getElementById("pomopet-edit-name-form-display").style.display = "block";

    });

    // POMOPET SAVE button listener
    const formEditPomopetName = document.getElementById(Constant.htmlIDs.formEditPomopetName);
    formEditPomopetName.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pomopetName = e.target.name.value;
        console.log(pomopetName)

        user.pomopet.name = pomopetName;

        try {
            await FirebaseController.updatePomopet(Auth.currentUser.uid, user.pomopet);
            await profile_page();
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }

        document.getElementById("pomopet-edit-name-form-display").style.display = "none";
        document.getElementById("pomopet-edit-name-display").style.display = "block";
    });

    // ESC key press listener
    formEditPomopetName.addEventListener('keydown', (e) => {
        if (e.key == "Escape") {
            document.getElementById("pomopet-edit-name-form-display").style.display = "none";
            document.getElementById("pomopet-edit-name-display").style.display = "block";
        }
    });
}