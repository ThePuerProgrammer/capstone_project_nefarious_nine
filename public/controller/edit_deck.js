import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
import { Deck } from '../model/Deck.js'
import { study_decks_page } from '../view/study_decks_page.js'
import { cleanDataToKeywords } from '../view/search_page.js'


export function addEventListeners(){
    Elements.formEditDeck.form.addEventListener('submit', async e=>{
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;
        const dateCreated = e.target.dateCreated.value;
        const isFavorited = e.target.isFavorited.value;
        const category = e.target.selectCategory.value;        

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
        });
        d.set_docID(e.target.docId.value);

        if(d.isFavorited=="false"){
            d.isFavorited=false;
        } else {
            d.isFavorited=true;
        }

        //Firestore
        try{
            await FirebaseController.updateDeck(Auth.currentUser.uid, d ,d.docID)
            //Added an additional load, as not all the updated was loading the first time.
            await study_decks_page();

        } catch(e){
            if(Constant.DEV) console.log(e);
            Utilities.info('Update Deck Error', JSON.stringify(e));
        }
        Utilities.info('Success!', `Deck: ${d.name} has been updated!`, "modal-edit-a-deck");
    });

    Elements.formDeleteDeckConfirmation.addEventListener('submit', async e=>{
        e.preventDefault();
        const yes = e.target.yes.value;        
        console.log(`${yes}`);
    })


}

export async function edit_deck(uid, deckId){
   // resetModal();
    let deck;

    try{
        deck = await FirebaseController.getUserDeckById(uid, deckId);

        if(!deck){
            Utilities.info('getDeckById Error', 'No deck found by the id');
            return;
        }
    } catch(e){
        if(Constant.DEV) console.log(e);
        Utilities.info('Error Firebase Controller', JSON.stringify(e));
    }

    //Getting Elements from Firebase to Edit
    Elements.formEditDeck.form.docId.value = deck.docID;//Changed Id to ID?
    Elements.formEditDeck.form.name.value = deck.name;
    Elements.formEditDeck.form.subject.value = deck.subject;
    Elements.formEditDeck.form.dateCreated.value = deck.dateCreated;
    //Checking type before loading
    if(deck.category){deck.category;}else if(typeof obj==='undefined'){deck.category='Misc'};
    Elements.formEditDeck.form.selectCategory.value = deck.category;
    Elements.formEditDeck.form.isFavorited.value = deck.isFavorited;

    //Adding the Categories...THINGS
    const categories =["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];
    
    categories.forEach(category => {
        Elements.formEditDeckCategorySelect.innerHTML +=`
        <option value="${category}">${category}</option>`;
    });
    //Showing the data loaded into the modal
    Elements.modalEditDeck.show();

}

export async function delete_deck(docId,confirmation){
    if(confirmation){
        try{
            await FirebaseController.deleteDeck(Auth.currentUser.uid, docId);
            Utilities.info(`Success`, `The desired deck as successfully deleted.`,);

        } catch(e){
            if(Constant.DEV)console.log(e);
            Utilities.info(`Delete Deck Error`, JSON.stringify(e));
        }
        await study_decks_page();
    }
}