import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';

export function addEventListeners() {}

export async function deck_page() {
    //Going to make the cards populate here so we can show in the testing them physically
    //being pulled and added to the page.
    //Clears all HTML so it doesn't double
    let html = '';
    html += '<h1> Study Decks </h1>';
    //Allows for the create a flashcard button
    html += `
        <button class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modal-create-a-flashcard"> + Create Flashcard</button>
    `;

    Elements.root.innerHTML = html;
}