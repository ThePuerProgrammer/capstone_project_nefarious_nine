import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from '../controller/firebase_controller.js'

export function addEventListeners() {
  /*Elements.btnStudyDeck.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.STUDY);
        await study_page();
    });*/
}

export function studyFormSubmitEvent(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = e.target.docId.value;
    history.pushState(null, null, Routes.routePathname.DECK + "#" + docId);
    await study_page(docId);
  });
}

export async function study_page(docId) {
  let html = '';
  html += "<h1> Study Page </h1>";
  let deck;
  try {
    deck = await FirebaseController.getDeckById(docId);
    if (!deck) {
      html += "<h5>Deck not found!</h5>";
    } else {
      html += `<h2 style="align: center">${deck.name}</h2>`;
    }
  } catch (e) {
    console.log(e);
  }
  Elements.root.innerHTML += html;
}
