import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {
    Elements.menuProfile.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.PROFILE);
        await profile_page();
    });
}

export async function profile_page() {

    let user;
    try {
        user = await FirebaseController.getUser(Auth.currentUser.uid);
    }catch (e) {
        console.log(e);
    }

    let html = '';

    // EDIT PROFILE button
    html += `<div class="edit-profile-btn">
        <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px; float:right">
        <i class="material-icons pomo-text-color-light">edit</i>Edit Profile</button></div>`;

    html += `<div class="user-profile">
        <img src="${user.profilePhotoURL}" style="width: 200px; height: 200px" class="center">
        <br>
        <h3 class="user-username pomo-text-color-dark">${user.username}</h3>`;
    
    // if user bio, display
    if(user.userBio != "") {
        html += `<p>${user.userBio}</p>`;
    } 

    html += `</div>`;

    html += `<div class="equipped-pomopet">
        <img src="${user.pomopet.petPhotoURL}" style="width: 200px; height: 200px; margin-bottom: -16px;" class="center">
        <hr class="pomopet-bar">
        <h4 class="pomo-text-color-dark" style="font-size: 20px;" >${user.pomopet.name}</h4>
        </div>`;
    
    Elements.root.innerHTML = html;
}