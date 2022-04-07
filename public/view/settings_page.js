import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as Constant from '../model/constant.js';
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Coins from '../controller/coins.js'

var selectedPet;
var petPhoto;

export function addEventListeners() {
  Elements.menuSettings.addEventListener("click", async () => {
    history.pushState(null, null, Routes.routePathname.SETTINGS);
    await settings_page();
  });

  // SUBMIT POMOPET MODAL event listener
  Elements.formPomodoption.form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pomopet = {
      type: selectedPet,
      name: selectedPet,
      petPhotoURL: petPhoto,
      petSkin: "",
    }

    try {
      await FirebaseController.updatePomopet(Auth.currentUser.uid, pomopet);
      Elements.modalPomodoption.hide();
    } catch (e) {
      if (Constant.DEV) console.log(e);
    }

  });

  // Event listener for BUNNY POMOPET button on pomopet modal
  Elements.formPomodoption.bunnyButton.addEventListener('change', e => {
    e.preventDefault();
    selectedPet = "bunny";
    petPhoto = "https://firebasestorage.googleapis.com/v0/b/pomobyte.appspot.com/o/pomopets%2Fbunny.png?alt=media&token=86f0a974-0b55-412a-a04a-b7ac479ecbba";


    document.getElementById("pet-selected").innerHTML =
    "Adopt the " + selectedPet + "?";
  });

  // Event listener for DOG POMOPET button on pomopet modal
  Elements.formPomodoption.dogButton.addEventListener('change', e => {
    e.preventDefault();
    selectedPet = "dog";
    petPhoto = "https://firebasestorage.googleapis.com/v0/b/pomobyte.appspot.com/o/pomopets%2Fdog.png?alt=media&token=bc1c6a5e-a462-4c70-a171-21882eb5c7da";

    document.getElementById("pet-selected").innerHTML =
    "Adopt the " + selectedPet + "?";
  });

  // Event listener for CAT POMOPET button on pomopet modal
  Elements.formPomodoption.catButton.addEventListener('change', e => {
    e.preventDefault();
    selectedPet = "cat";
    petPhoto = "https://firebasestorage.googleapis.com/v0/b/pomobyte.appspot.com/o/pomopets%2Fcat.png?alt=media&token=579fad12-2062-4b3c-9b23-08e3e2986d04";

    document.getElementById("pet-selected").innerHTML =
    "Adopt the " + selectedPet + "?";
  });

}

export async function settings_page() {
  try{
    await Coins.get_coins(Auth.currentUser.uid);
} catch(e) {if(Constant.DEV)console.log(e);}

  Elements.root.innerHTML = "";
  let html = "";
  html += "<h1> Settings </h1>";

  // SELECT POMOPET button 
  html += `
      <button type="button" class="btn btn-secondary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#modal-pomodoption">
          Select Pomopet
      </button>
  `;

  Elements.root.innerHTML += html;
}
