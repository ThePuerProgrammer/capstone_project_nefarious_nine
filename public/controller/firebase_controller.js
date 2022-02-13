import * as Constant from '../model/constant.js'
import { Deck } from '../model/Deck.js';

export async function createDeck(deck) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS)
        .add(deck.serialize());
    return ref.id;
}

// CREATE A Flashcard
//============================================================================//
export async function createFlashcard(deckDocID, flashcardModel) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS)
        .add(flashcardModel.serialize());
    return ref.id;
}
//============================================================================//
//CREATE FLASHCARD IMAGE
//============================================================================//
export async function uploadImageToFlashcard(imageFile, imageName){
    //image doesn't have a name
    if(!imageName){
        imageName = Date.now() + imageFile.name;
    }
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + imageName);
    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();
    return{imageName,imageURL};
}
//===========================================================================//

// This function pulls all decks from the highest level owned_decks collection
// in firestore. This is purely for testing for the time being and will later be
// modified to accomodate users / classrooms
//============================================================================//
export async function getAllTestingDecks() {
    let deckList = [];
    
    const testCollectionRef = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const deck = new Deck(doc.data());
                deck.set_docID(doc.id);
                deckList.push(deck);
            });
        })
        .catch((error) => {
            if (Constant.DEV)
                console.log("Error fetching documents from the test deck");
        });

    return deckList;
}
//============================================================================//


/* when the function for creating a deck is written
    uncomment the following line to allow for a timestamp
    of when the deck was created to be retained in Firestore.
    This can also be utilized for the entire deck or specific flashcards.
    Whatever utility we need it for. - Cody
*/
    // const data = flashcard.toFirestore(Date.now());

// Function to allow for deletion of deck
// TODO: write Firebase side rules to set permissions for deck deletion
export async function deleteDeck(docID) {
    await firebase.firestore().collection(Constant.collectionName.FLASHCARDS).doc(docID).delete();
}