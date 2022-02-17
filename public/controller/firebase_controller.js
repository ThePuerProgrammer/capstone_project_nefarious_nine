import * as Constant from '../model/constant.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js';
import { FlashcardData } from '../model/flashcard_data.js';


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
//CREATE FLASHCARD IMAGE Question
//============================================================================//
export async function uploadImageToFlashcardQuestion(questionImageFile, questionImageName) {
    //image doesn't have a name
    if (!questionImageName) {
        questionImageName = Date.now() + questionImageFile.name + 'question';
    }
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + questionImageName);
    const taskSnapShot = await ref.put(questionImageFile);
    const questionImageURL = await taskSnapShot.ref.getDownloadURL();
    return { questionImageName, questionImageURL };
}
//===========================================================================//
//===========================================================================//
//CREATE FLASHCARD IMAGE Answer
//===========================================================================//
export async function uploadImageToFlashcardAnswer(answerImageFile, answerImageName) {
    //image doesn't have a name
    if (!answerImageName) {
        answerImageName = Date.now() + answerImageFile.name + 'answer';
    }
    
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + answerImageName);
    const taskSnapShot = await ref.put(answerImageFile);
    const answerImageURL = await taskSnapShot.ref.getDownloadURL();
    return { answerImageName, answerImageURL };
}
//==========================================================================//

//============================================================================//
// Update Flashcard Data
// 
// 1. Check if data exists
//   [Data Exists] Grab the data
//   [Data doesn't exist]  
//============================================================================//
export async function updateFlashcardData(uid, deckDocID, flashcardDocID, userAnsweredCorrectly) {
    // Making the reference to the flashcard data
    const flashcardDataExistsRef = firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .doc(flashcardDocID);

    // FlashcardData Model
    //  If flashcard does't not exist, this model will be used to create 
    //  flashcard data as-is.
    //  If flashcard does exist, streak will be updated.
    //  If user answered incorrectly, this streak will be used
    let flashcardData = new FlashcardData({
        streak: 0,
        lastAccessed: Date.now()
    });

    // Using the flashcard data reference to check if it exists
    await flashcardDataExistsRef.get().then((doc) => {
        if (doc.exists && userAnsweredCorrectly) { 
            flashcardData.streak = doc.data().streak + 1; // Answered correctly, increment streak.
        }
    });

    // Update flashcardData result on Firebase
    firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .doc(flashcardDocID)
        .set(flashcardData.serialize());
}
//===========================================================================//

//============================================================================//
// Creates deck data if the user doesn't have a deck data for the deck they
//  are going to study
//============================================================================//
export async function createDeckDataIfNeeded(uid, deckDocID) {
    let deckDataExists = false;

    // Making the reference to the deck data
    const deckDataExistsRef = firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID);

    // Using the deck data exists reference to check if it exists
    deckDataExistsRef.get().then((doc) => {
        deckDataExists = doc.exists;
    });

    if (deckDataExists) // Deck exists, no need to create a deck data document
        return;

    //Deck doesn't exist, create a deck data document
    firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .set({});
}
//===========================================================================//

//============================================================================//
// Returns an array of doc ID's 
//============================================================================//
export async function getFlashcardsDataFromDeck(uid, deckDocID) {
    let flashcardsDataList = [];

    const flashcardsDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .get();

    flashcardsDataRef.forEach(doc => {
        const flashcardData = new FlashcardData(doc.data());
        flashcardData.set_docID(doc.id);
        flashcardsDataList.push(flashcardData);
    })

    return flashcardsDataList;
}
//===========================================================================//

//============================================================================//
// Gets the next flashcard for SmartStudying
//============================================================================//
export async function getNextSmartStudyFlashcard(uid, deckDocID, flashcardsCurrentlyStudying) {

    let targetedStreakGroup = 0;
    let randomNumber = Math.random();
    
    console.log(randomNumber);
    
    if (randomNumber >= 0.46875) { // Streak 0 OR New Card
        randomNumber = Math.random();       

        if (randomNumber >= 0.75) { // New card Odds
            console.log("Getting new card...");
            let newFlashcard = await getFlashcardNotInFlashcardData(uid, deckDocID, flashcardsCurrentlyStudying);

            if (newFlashcard == null) {
                console.log("No new flashcards. Switching to Streak 0 category");
                targetedStreakGroup = 0; // There are no new flashcards, so default to showing streak 0
            }
        }
        else // Streak 0 Odds 
            targetedStreakGroup = 0
    }
    else if (randomNumber >= 0.21875) { // Streak 1 Odds
        targetedStreakGroup = 1
    }
    else if (randomNumber >= 0.09375) { // Streak 2 Odds
        targetedStreakGroup = 2
    }
    else if (randomNumber >= 0.06125) { // Streak 3 Odds
        targetedStreakGroup = 3
    }
    else if (randomNumber >= 0) { // Streak 2 Odds
        targetedStreakGroup = 4
    }

    console.log("Streak Group Chosen: ", targetedStreakGroup);

    let streakGroupHasFlashcards = true;
    // Grabs oldest interacted with flashcard from the targeted streak group
    let nextFlashcardDocID;
    let nextFlashcard = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .where("streak", "==", targetedStreakGroup)
        .orderBy("lastAccessed", "desc")
        .limit(1)
        .get();

    let flashcardsReceived = 0;
    nextFlashcard.forEach((doc) => {
        streakGroupHasFlashcards = doc.exists;
        count++;

        if (streakGroupHasFlashcards)
            nextFlashcardDocID = doc.id;
    });
    
    if (flashcardsReceived == 0) {
        streakGroupHasFlashcards = false
    }

    // Since it is possible for user to have no cards in a streak group, take precautions to 
    //  always get a flashcard
    if (!streakGroupHasFlashcards) {
        console.log("Streak group contained no flashcard data");

        // First, try and get new flashcard
        console.log("Getting new card...");
        let newFlashcard = await getFlashcardNotInFlashcardData(uid, deckDocID, flashcardsCurrentlyStudying);

        if (newFlashcard != null) { // newFlashcard == null means there are no new flashcards
            return newFlashcard; // Returning the new flashcard
        }

        console.log("No new flashcards exists. Pulling the oldest flashcard data from all Streak Categories");
        // No new flashcards exists. Pulling the oldest lastAccessed flashcard from all Streak Categories
        nextFlashcard = await firebase.firestore()
            .collection(Constant.collectionName.USERS)
            .doc(uid)
            .collection(Constant.collectionName.DECK_DATA)
            .doc(deckDocID)
            .collection(Constant.collectionName.FLASHCARDS_DATA)
            .orderBy("lastAccessed", "desc")
            .limit(1)
            .get(); 

        nextFlashcard.forEach((doc) => {
            if (streakGroupHasFlashcards)
                nextFlashcardDocID = doc.id;
        });
    }


    let nextFlashcardModel;
    for (let i = 0; i < flashcardsCurrentlyStudying.length; i++) {
        console.log("fc docID", flashcardsCurrentlyStudying[i].docID);
        console.log("target", nextFlashcardDocID);
        if (flashcardsCurrentlyStudying[i].docID == nextFlashcardDocID) {
            nextFlashcardModel = flashcardsCurrentlyStudying[i];
            break;
        }
    }

    return nextFlashcardModel;
}

// Helper function for getNextSmartStudyFlashcard(uid, deckDocID, flashcardsCurrentlyStudying)
//  Returns new if there are no new flashcards
async function getFlashcardNotInFlashcardData(uid, deckDocID, flashcardsCurrentlyStudying) {
    let flashcardsDataList = await getFlashcardsDataFromDeck(uid, deckDocID);
            
    // Find first occurence of a flashcard that isn't in our flashcards data list
    for (let i = 0; i < flashcardsCurrentlyStudying.length; i++) {

        let flashcardInDataList = false;
        for (let j = 0; j < flashcardsDataList.length; j++) {
            if (flashcardsDataList[j].docID == flashcardsCurrentlyStudying[i].docID) {
                flashcardInDataList = true;
                break;
            }
        }

        if (!flashcardInDataList) {
            return flashcardsCurrentlyStudying[i];
        }
    }

    return null;
}
//===========================================================================//




//============================================================================//
// This function pulls all decks from the highest level owned_decks collection
// in firestore. This is purely for testing for the time being and will later be
// modified to accomodate users / classrooms
//============================================================================//
export async function getUserDecks(uid) {
    let deckList = [];
    const userOwnedDecks = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS)
        .orderBy('isFavorited', 'desc')
        .orderBy('name', 'asc')
        .get();

    userOwnedDecks.forEach(doc => {
        const d = new Deck(doc.data());
        d.docId = doc.id;
        deckList.push(d);
    });

    // localStorage.set(Constant.collectionName.OWNED_DECKS, deckList);

    return deckList;
}
//============================================================================//

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
export async function getUserDeckById(uid, deckDocID) {
    const deckRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS)
        .doc(deckDocID)
        .get();

    if (!deckRef.exists) {
        if (Constant.DEV)
            console.log("! Deck reference does not exist");
        return null;
    }

    const deckModel = new Deck(deckRef.data());
    deckModel.set_docID(deckDocID);
    return deckModel;
}

export async function favoriteDeck(uid, deckDocID, favorited) {
    await firebase.firestore().collection(Constant.collectionName.USERS)
        .doc(uid).collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .update({ 'isFavorited': favorited });
}

export async function getFlashcards(uid, docId) {
    let flashcards = [];
    const snapshot = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docId)
        .collection(Constant.collectionName.FLASHCARDS).get();
    snapshot.forEach(doc => {
        const f = new Flashcard(doc.data());
        f.set_docID(doc.id);
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
export async function deleteFlashcard(uid, docID, flashcardId) {
    await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .collection(Constant.collectionName.FLASHCARDS).doc(flashcardId)
        .delete();
}