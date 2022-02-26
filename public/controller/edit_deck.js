import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
import { Deck } from '../model/Deck.js'
import { study_decks_page } from '../view/study_decks_page.js'

export function addEventListeners(){
    Elements.formEditDeck.form.addEventListener('submit', async e=>{
        e.preventDefault();

        //Reading Information from the Edit
        const d = new Deck({
            name:           e.target.name.value,
            subject:        e.target.subject.value,
            dateCreated:    e.target.dateCreated.value,
            category:       e.target.selectCategory.value,
            isFavorited:    e.target.isFavorited.value,
        });
        d.set_docID(e.target.docId.value);

        if(d.isFavorited=="false"){
            console.log(`Trying comparison false`);
            d.isFavorited=false;
        } else {
            console.log(`Trying comparison true`);
            d.isFavorited=true;
        }

        // const isFavorited = Elements.formEditDeck.checkboxIsFavorited
        console.log(`Check 1:${d.isFavorited}`)
        //Firestore
        try{
            await FirebaseController.updateDeck(Auth.currentUser.uid, d ,d.docID)
            console.log(`Check 2:${d.isFavorited}`)

        } catch(e){
            if(Constant.DEV) console.log(e);
            Utilities.info('Update Deck Error', JSON.stringify(e));
        }
        await study_decks_page();
        Utilities.info('Success!', `Deck: ${d.name} has been updated!`, "modal-edit-a-deck");
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

export async function delete_deck(docId){
        
    try{
        console.log(`docId=${docId}`);
        await FirebaseController.deleteDeck(Auth.currentUser.uid, docId);
        // const deckTag =document.getElementById('deck.docId');
        // deckTag.remove();
        Utilities.info(`Success`, `The desired deck as successfully deleted.`);

    } catch(e){
    if(Constant.DEV)console.log(e);
    Utilities.info(`Delete Deck Error`, JSON.stringify(e));
    }
}