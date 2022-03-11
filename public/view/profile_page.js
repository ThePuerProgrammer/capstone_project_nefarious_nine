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
    html += '<h1> Profile Page </h1>';
    html += `<p> username: ${user.username}</p>`;
    html += `<p> pet: ${user.pet}</p>`;
    html += `<p> pfp: ${user.profilePhotoName}</p>`;
    
    Elements.root.innerHTML = html;
}