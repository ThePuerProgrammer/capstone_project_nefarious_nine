import * as Constant from '../model/constant.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js';

//============================================================================//
// CREATE A Deck
//============================================================================//
export async function createDeck(uid, deck) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS)
        .add(deck.serialize());
    return ref.id;
}
//============================================================================//

//============================================================================//
// CREATE A Flashcard
//============================================================================//
export async function createFlashcard(uid, deckDocID, flashcardModel) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS)
        .add(flashcardModel.serialize());
    return ref.id;
}
//============================================================================//


//============================================================================//
//CREATE FLASHCARD IMAGE
//============================================================================//
export async function uploadImageToFlashcard(imageFile, imageName) {
    //image doesn't have a name
    if (!imageName) {
        imageName = Date.now() + imageFile.name;
    }
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + imageName);
    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();
    return { imageName, imageURL };
}
//===========================================================================//

//============================================================================//
// Update Flashcard Data
//============================================================================//
export async function updateFlashcardData(deckDocID, flashcardDocID,  userAnswerCorrectly){
    // use window.localStorage to store needed local information
    let loggedInUserDocID = localStorage.getItem("uid")

    // 

    const ref = firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(loggedInUserDocID)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .doc(flashcardDocID)
        .set();

}
//===========================================================================//

//============================================================================//
// This function pulls all decks from the highest level owned_decks collection
// in firestore. This is purely for testing for the time being and will later be
// modified to accomodate users / classrooms
//============================================================================//
export async function getAllTestingDecks() {
    let deckList = [];

    const testCollectionRef = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS)
        .orderBy('name')
        .get();
    testCollectionRef.forEach(doc => {
        const d = new Deck(doc.data());
        d.docId = doc.id;
        deckList.push(d);
    })

    return deckList;
}
//============================================================================//

//============================================================================//
// This function will pull in a single deck from it's docId
//============================================================================//
export async function getDeckById(docId) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS).doc(docId).get();
    if (!ref.exists) return null;
    const d = new Deck(ref.data());
    d.docId = docId;
    return d;
}

export async function getFlashcards(docId) {
    let flashcards = [];
    const snapshot = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS).doc(docId)
        .collection(Constant.collectionName.FLASHCARDS).get();
    snapshot.forEach(doc => {
        const f = new Flashcard(doc.data());
        f.docId = doc.id;
        flashcards.push(f);
    })

    return flashcards;
}


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