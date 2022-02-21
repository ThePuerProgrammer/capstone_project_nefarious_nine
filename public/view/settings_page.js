import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as Constant from '../model/constant.js';
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {
  Elements.menuSettings.addEventListener("click", async () => {
    history.pushState(null, null, Routes.routePathname.SETTINGS);
    await settings_page();
  });

  Elements.formPomodoption.addEventListener("click", async (e) => {
    //e.preventDefault();

    //console.log("SUBMIT POMOPET PRESSED")

    const pets = document.getElementsByName("pet");
    var petSelected = "Bunny";
    document.getElementById("pet-selected").innerHTML =
      "Adopt The " + petSelected + "?";

    for (var i = 0; i < pets.length; i++) {
      if (pets[i].checked) {
        petSelected = pets[i].value;
        document.getElementById("pet-selected").innerHTML =
          "Adopt The " + petSelected + "?";
      }
    }

    try {
      await FirebaseController.updatePet(Auth.currentUser.uid, petSelected);
      Elements.modalCreateDeck.hide();
    } catch (e) {
      if (Constant.DEV) console.log(e);
    }

    //console.log("POMOPET SELECTED: " + petSelected);

    //await FirebaseController.updatePet(Auth.currentUser.uid, petSelected);

    // Utilities.info('Adoption Successful.', `You now own a ${petSelected}!`, Constants.htmlIDs.modalPomodoption);
  });
}

export async function settings_page() {
  Elements.root.innerHTML = "";
  let html = "";
  html += "<h1> Settings </h1>";

  // Solution for merging Piper's 'create_deck_deck_title branch
  html += `
      <button type="button" class="btn btn-secondary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#modal-pomodoption">
          Select Pomopet
      </button>
  `;

  Elements.root.innerHTML += html;
}
