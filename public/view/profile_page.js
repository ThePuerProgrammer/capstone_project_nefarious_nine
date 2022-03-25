import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'

//Declaration of Image
let imageFile2UploadProfile = "";

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
                const {profilePictureName, profilePictureURL} = await FirebaseController.uploadProfilePicture(imageFile2UploadProfile);
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
            Elements.formEditProfile.profilePictureTag.src=''; // TODO make it display pfp ?
            return;
        }

        //Loads the Image and displays preview
        const reader = new FileReader();
        reader.onload = () => (Elements.formEditProfile.profilePictureTag.src= reader.result);
        reader.readAsDataURL(imageFile2UploadProfile);
    });

     // Clears EDIT PROFILE input fields when user closes modal
    $(`#edit-profile-modal`).on('hidden.bs.modal', function (e) {
        Elements.formEditProfile.form.reset();
    });
}

export async function profile_page() {
    Coins.get_coins();

    // retrieve user info from Firebase
    let user;
    try {
        user = await FirebaseController.getUser(Auth.currentUser.uid);
    }catch (e) {
        console.log(e);
    }

    let html = '';

    // EDIT PROFILE button    
    html += `<div class="edit-profile-btn">
        <button id="${Constant.htmlIDs.editProfile}" type="button" class="btn btn-secondary pomo-bg-color-dark" style="padding:5px 12px; float:right">
        <i class="material-icons pomo-text-color-light">edit</i>Edit Profile</button>
        </div>`;

    html += `<div class="user-profile">
        <img src="${user.profilePhotoURL}" style="width: 200px; height: 200px; object-fit: cover;" class="center pfp">
        <br>
        <h3 class="user-username pomo-text-color-dark">${user.username}</h3>`;
    
    // if user bio, display
    if(user.userBio != "") {
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