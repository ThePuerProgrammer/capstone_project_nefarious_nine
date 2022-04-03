import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
import { Deck } from '../model/Deck.js'
import { study_decks_page } from '../view/study_decks_page.js'
import { cleanDataToKeywords } from '../view/search_page.js'


export function addEventListeners() {
    Elements.formEditDeck.form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;
        const dateCreated = e.target.dateCreated.value;
        const isFavorited = e.target.isFavorited.value;
        const category = e.target.selectCategory.value;
        const flashcardNumber = e.target.flashcardNumber.value;
        const isClassDeck = e.target.classDocId.value;
        const created_by = e.target.created_by.value;

        const keywords = cleanDataToKeywords(name, subject, category)

        //const keywords = [name.toLowerCase(), subject.toLowerCase(), category.toLowerCase()];
        //Reading Information from the Edit
        const d = new Deck({
            name,
            subject,
            dateCreated,
            category,
            isFavorited,
            keywords,
            flashcardNumber,
            isClassDeck,
            created_by,
        });
        d.set_docID(e.target.docId.value);

        if (d.isFavorited == "false") {
            d.isFavorited = false;
        } else {
            d.isFavorited = true;
        }
        //Updates count as Deck is edited
        //d.flashcardNumber = await FirebaseController.updateFlashcardCount(Auth.currentUser.uid, d.docID);

        //Firestore
        if (d.isClassDeck == "false" || d.isClassDeck == false) { //if user deck
            try {
                //Updates count as Deck is edited
                d.flashcardNumber = await FirebaseController.updateFlashcardCount(Auth.currentUser.uid, d.docID);
                await FirebaseController.updateDeck(Auth.currentUser.uid, d, d.docID)
                //Added an additional load, as not all the updated was loading the first time.
                setTimeout(200);


            } catch (e) {
                if (Constant.DEV) console.log(e);
                Utilities.info('Update Deck Error', JSON.stringify(e));
            }
            Utilities.info('Success!', `Deck: ${d.name} has been updated!`, "modal-edit-a-deck");
            await study_decks_page();
        } else { //else is a class deck
            try {
                //Updates count as Deck is edited
                d.flashcardNumber = await FirebaseController.updateClassFlashcardCount(d.isClassDeck, d.docID);
                await FirebaseController.updateClassDeck(d, d.docID, d.isClassDeck);
                //Added an additional load, as not all the updated was loading the first time.
                setTimeout(200);

            } catch (e) {
                if (Constant.DEV) console.log(e);
                Utilities.info('Update Deck Error', JSON.stringify(e));
            }
            Utilities.info('Success!', `Deck: ${d.name} has been updated!`, "modal-edit-a-deck");
            await study_decks_page();

        }
    });


}

export async function edit_deck(uid, deckId) {
    // resetModal();
    let deck;

    try {
        deck = await FirebaseController.getUserDeckById(uid, deckId);

        if (!deck) {
            Utilities.info('getDeckById Error', 'No deck found by the id');
            return;
        }
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Utilities.info('Error Firebase Controller', JSON.stringify(e));
    }

    //Getting Elements from Firebase to Edit
    Elements.formEditDeck.form.docId.value = deck.docID;//Changed Id to ID?
    Elements.formEditDeck.form.name.value = deck.name;
    Elements.formEditDeck.form.subject.value = deck.subject;
    Elements.formEditDeck.form.dateCreated.value = deck.dateCreated;
    //Checking type before loading
    if (deck.category) { deck.category; } else if (typeof obj === 'undefined') { deck.category = 'Misc' };
    Elements.formEditDeck.form.selectCategory.value = deck.category;
    Elements.formEditDeck.form.isFavorited.value = deck.isFavorited;
    Elements.formEditDeck.form.flashcardNumber.value = deck.flashcardNumber;
    Elements.formEditDeck.form.classDocId.value = deck.isClassDeck;
    Elements.formEditDeck.form.created_by.value = deck.created_by;

    //Adding the Categories...THINGS
    const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

    categories.forEach(category => {
        Elements.formEditDeckCategorySelect.innerHTML += `
        <option value="${category}">${category}</option>`;
    });




    //Showing the data loaded into the modal
    Elements.modalEditDeck.show();

}

export async function edit_class_deck(classDocId, deckId) {

    let deck;

    try {
        deck = await FirebaseController.getClassDeckByDocID(classDocId, deckId);

        if (!deck) {
            Utilities.info('getDeckById Error', 'No deck found by the id');
            return;
        }
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Utilities.info('Error Firebase Controller', JSON.stringify(e));
    }

    //Getting Elements from Firebase to Edit
    Elements.formEditDeck.form.docId.value = deck.docID;//Changed Id to ID?
    Elements.formEditDeck.form.name.value = deck.name;
    Elements.formEditDeck.form.subject.value = deck.subject;
    Elements.formEditDeck.form.dateCreated.value = deck.dateCreated;
    //Checking type before loading
    if (deck.category) { deck.category; } else if (typeof obj === 'undefined') { deck.category = 'Misc' };
    Elements.formEditDeck.form.selectCategory.value = deck.category;
    Elements.formEditDeck.form.isFavorited.value = deck.isFavorited;
    Elements.formEditDeck.form.classDocId.value = deck.isClassDeck;
    Elements.formEditDeck.form.created_by.value = deck.created_by;

    //Adding the Categories...THINGS
    const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

    categories.forEach(category => {
        Elements.formEditDeckCategorySelect.innerHTML += `
         <option value="${category}">${category}</option>`;
    });
    //Showing the data loaded into the modal
    Elements.modalEditDeck.show();

}

export async function delete_deck(docId, confirmation) {
    if (confirmation) {
        try {
            await FirebaseController.deleteDeck(Auth.currentUser.uid, docId);
            Utilities.info(`Success`, `The desired deck as successfully deleted.`,);
            //This is called twice before page load, due to it not registering the change
            await FirebaseController.updateDeckCount(Auth.currentUser.uid);
            await FirebaseController.updateFlashcardCountForUser(Auth.currentUser.uid);


        } catch (e) {
            if (Constant.DEV) console.log(e);
            Utilities.info(`Delete Deck Error`, JSON.stringify(e));
        }
        await study_decks_page();
    }
}

export async function delete_class_deck(docId, confirmation, classDocId) {
    if (confirmation) {
        try {
            await FirebaseController.deleteClassDeck(classDocId, docId);
            //await FirebaseController.updateClassFlashcardCount(classDocId, docId);
            //await FirebaseController.updateDeckCount(Auth.currentUser.uid);
            Utilities.info(`Success`, `The desired deck as successfully deleted.`,);

        } catch (e) {
            if (Constant.DEV) console.log(e);
            Utilities.info(`Delete Deck Error`, JSON.stringify(e));
        }
        //This is called twice before page load, due to it not registering the change
        //auth.currentuser.uid is not passing
        await study_decks_page();
    }
}