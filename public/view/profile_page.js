import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'
import * as Utilities from './utilities.js';
import { Pomoshop } from '../model/pomoshop.js'
import { home_page } from './home_page.js'

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
            if (imageFile2UploadProfile != "") {
                const { profilePictureName, profilePictureURL } = await FirebaseController.uploadProfilePicture(imageFile2UploadProfile, currentPfpName);
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

        if (!imageFile2UploadProfile) {
            Elements.formEditProfile.profilePictureTag.src = currentPfpURL;
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
}

export async function profile_page() {
    try {
        await Coins.get_coins(Auth.currentUser.uid);
    } catch (e) { if (Constant.DEV) console.log(e); }
    imageFile2UploadProfile = ""; // reset

    // retrieve user info from Firebase
    let user;
    try {
        user = await FirebaseController.getUser(Auth.currentUser.uid);
        currentPfpName = user.profilePhotoName;
        currentPfpURL = user.profilePhotoURL;
    } catch (e) {
        console.log(e);
    }


    let equippedAccURL;
    // if user has equippedAcc retrieve photoURL 
    if (user.equippedAcc != "") {
        try {
            equippedAccURL = await FirebaseController.getEquippedAccURL(user.equippedAcc);
        } catch (e) {
            console.log(e);
        }
    }

    let equippedSkinURL;
    // if user has equippedSkin retrieve photoURL 
    if (user.equippedSkin != "") {
        try {
            equippedSkinURL = await FirebaseController.getEquippedSkinURL(user.equippedSkin);
        } catch (e) {
            console.log(e);
        }
    }

    let deckList = [];
    let masteredDecks = [];
    try {
        deckList = await FirebaseController.getUserDecks(Auth.currentUser.uid);
    } catch (e) {
        console.log(e);
    }
    console.log(deckList);


    //This will update the isMastered field and give rewards if user did not visit study decks page after smart studying
    let streaks;
    let isMastered = false;
    for (let i = 0; i < deckList.length; i++) {
        streaks = [];
        isMastered = false;
        let flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, deckList[i].docId);
        let lastSRSaccess = await FirebaseController.getUserLastSrsAccessDeckData(Auth.currentUser.uid, deckList[i].docId);
        for (let k = 0; k < flashcards.length; k++) {
            let streak = await FirebaseController.getUserFlashcardDataByLastSrsAccessandFCid(Auth.currentUser.uid, deckList[i].docId, lastSRSaccess, flashcards[k].docID);
            streaks.push(streak);
        }

        if (streaks.length >= 1) {
            for (let j = 0; j < streaks.length; j++) {
                if (streaks[j] > 3) {
                    isMastered = true;
                }
            }
        }
        if (isMastered == true && deckList[i].isMastered == false) {
            await FirebaseController.updateDeckMasteryandAddCoins(Auth.currentUser.uid, deckList[i].docId);
        }

    }
    //refresh our deck list in case study decks was not visited prior to visiting profile page
    let updatedDeckList;
    try {
        updatedDeckList = await FirebaseController.getUserDecks(Auth.currentUser.uid);
    } catch (e) {
        console.log(e);
    }

    for (let i = 0; i < updatedDeckList.length; i++) {
        if (updatedDeckList[i].isMastered == true) {
            masteredDecks.push(updatedDeckList[i]);
        }
    }

    let html = '';

    // EDIT PROFILE button    
    html += `<div class="edit-profile-btn">
        <form class="form-delete-account" method="post">
        <input type="hidden" name="userEmail" value="${user.email}">
        <button class="btn btn-danger" type="submit" style="padding:5px 12px; float:right;">
            <i class="material-icons ">delete</i>Delete Account</button>
        </form>

        <button id="${Constant.htmlIDs.editProfile}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light" style="padding:5px 12px; margin-right: 10px; float:right">
        <i class="material-icons pomo-text-color-light">edit</i>Edit Profile</button>
        
        </div>`;

    html += `<div class="user-profile">
        <img src="${user.profilePhotoURL}" style="width: 200px; height: 200px; object-fit: cover;" class="center pfp">
        <br>
        <h3 class="user-username pomo-text-color-dark" style="text-align: center;">${user.username}</h3>`;

    // if user bio, display
    if (user.userBio != "") {
        html += `<p style="text-align: center;">${user.userBio}</p>`;
    }

    html += `<br>
        <div class="user-mastered-decks"  style="display: inline-block;">
        <h3 class="pomo-text-color-dark" style="text-align: center;"> Mastered Decks </h3>`;
    
    if(masteredDecks.length == 0) {
        html += `<p class="pomo-text-color-dark" style="text-align: center;">No decks mastered yet, go do some studying!</p>`;
    } else {
        masteredDecks.forEach(deck => {
            html += `<div class = "user-deck-trophy" style="display: inline-block;">
                <h1 style="text-align: center;"><i class="material-icons" style="color:#ffdf00; font-size: 60px;">emoji_events</i></h1>
                <p class="pomo-text-color-dark">${deck.name}</p>
            </div>`;
        });     
    }

    html += `</div>
        </div>`;

    html += `<div class="equipped-pomopet">`;

    // if no equipped skin
    if (user.equippedSkin == "") {
        html += `<img src="${user.pomopet.petPhotoURL}" style="width: 250px; height: 250px; margin-bottom: -16px;" class="pomopet-display center">`;
    } else {
        html += `<img src="${equippedSkinURL}" style="width: 250px; height: 250px; margin-bottom: -16px;" class="pomopet-display center">`;
    }

    // if equipped acc
    if (user.equippedAcc != "") {
        html += `<img src="${equippedAccURL}" style="height: 80px; width: 100px; margin-bottom: -50px;  object-fit: cover;" class="acc-display center">`;
    }

    html += `<hr class="pomopet-bar">`;


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

    const deleteAccountForm = document.getElementsByClassName('form-delete-account');
    for (let i = 0; i < deleteAccountForm.length; i++) {
        deleteAccountForm[i].addEventListener('submit', async e => {
            e.preventDefault();
            let userEmail = e.target.userEmail.value;

            console.log("EMAIL: " + userEmail);
            Elements.modalDeleteAccountConfirmation.show();
            const yesbutton = document.getElementById('modal-confirmation-delete-account-yes');

            yesbutton.addEventListener("click", async e => {
                await home_page();
                await FirebaseController.deleteAccount(userEmail);
            });
        });

    }
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
            await FirebaseController.updatePomopetName(Auth.currentUser.uid, user.pomopet);
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