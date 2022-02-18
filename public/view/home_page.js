import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Auth from "../controller/firebase_auth.js";

export function addEventListeners() {
    Elements.menuHome.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.HOME);
        await home_page();
    });

}

export async function home_page() {
    Elements.root.innerHTML = `Home page`;

    Elements.formPomodoption.addEventListener('click', async () => {
      
        const ele = document.getElementsByName('pet');
        document.getElementById('pet-selected').innerHTML = 'Adopt The Bunny?';
        var petSelected = 'Bunny';
      
        for(var i = 0; i < ele.length; i++) {
            if(ele[i].checked) {
                console.log(ele[i].value);
                petSelected = ele[i].value;
                document.getElementById('pet-selected').innerHTML = 'Adopt The ' + petSelected + '?';
            }
        }

        await FirebaseController.updatePet(Auth.currentUser.uid, petSelected);

    });
}