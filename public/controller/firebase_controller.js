import * as Constant from '../model/constant.js'
import * as Utilites from '../view/utilities.js'
import * as Element from '../view/elements.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js';
import { FlashcardData } from '../model/flashcard_data.js';
import { User } from '../model/user.js';
import { Classroom } from '../model/classroom.js';
import { Backend } from '../model/backend.js';
import { Message } from '../model/message.js';
import { HelpTicket } from '../model/help_ticket.js';
import { Pomoshop } from '../model/pomoshop.js';

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
// CREATE A DECK FOR A CLASSROOM
//============================================================================//
export async function createClassDeck(docID, deck) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(docID)
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

export async function createClassFlashcard(classDocID, deckDocID, flashcardModel) {

    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
        .collection(Constant.collectionName.OWNED_DECKS)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS)
        .add(flashcardModel.serialize());

    return ref.id;
}

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
//
// This new update flashcard date will check if there exists a flashcard date
//  set for today. If there does not exist one, then we will create one for today.
//  If there is one for today, will we that as the data set that we pull/update
//  from.
//============================================================================//
export async function updateFlashcardData(uid, deckDocID, flashcardDocID, userAnsweredCorrectly) {
    // -- ENSURING WE HAVE A DATA SET FOR TODAY TO UPDATE TO -- 
    let todaysFlashcardDataExists = false;
    let todaysDate = Utilites.getCurrentDate();
    // Check if the flashcard_data for today exists.
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(todaysDate + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .limit(1)
        .get()
        .then(collection => {
            todaysFlashcardDataExists = collection.docs.length > 0;
        });

    // Today's flashcard data does NOT exist. Copy last used collection 
    console.log("Today's flashcard data exist?", todaysFlashcardDataExists)
    if (!todaysFlashcardDataExists) {
        await copyLastAccessedFlashcardDataToToday(uid, deckDocID, todaysDate);
    }

    // Update lastSRSAccess for deck data document
    const deckDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .update({
            lastSRSAccess: todaysDate
        });


    // Making the reference to the flashcard data
    const flashcardDataExistsRef = firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(todaysDate + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
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
        if (doc.exists && userAnsweredCorrectly) // only use old streak if user answered correctly
            flashcardData.streak = doc.data().streak; // Flashcard data exists, get streak on flashcard
    });

    if (userAnsweredCorrectly)
        flashcardData.streak++;  // Answered correctly, increment streak.

    // Update flashcardData result on Firebase
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(todaysDate + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .doc(flashcardDocID)
        .set(flashcardData.serialize());

    console.log("flashcardDataStreak", flashcardData.streak);
    return flashcardData;
}



// Helper function for updateFlashcardData
async function copyLastAccessedFlashcardDataToToday(uid, deckDocID, todaysDate) {
    console.log("Starting new date copy for flaschard");

    // Grab deck data document to get the last accessed date
    const deckDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .get();

    let lastSRSAccess = deckDataRef.data().lastSRSAccess;
    console.log("last studied: ", lastSRSAccess);

    const cachedFlashcardData = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(lastSRSAccess + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .get();

    // iterate through the lastSRSAccess flashcard data and add each flashcard data
    //  document to todays flaschard data
    cachedFlashcardData.forEach(async doc => {
        console.log("Flashcard received! ", doc.id);
        await firebase.firestore()
            .collection(Constant.collectionName.USERS)
            .doc(uid)
            .collection(Constant.collectionName.DECK_DATA)
            .doc(deckDocID)
            .collection(todaysDate + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
            .doc(doc.id)
            .set(doc.data())
    });

    // add cached date to array list for the deck data
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .update({
            cachedDates: firebase.firestore.FieldValue.arrayUnion(todaysDate)
        });
}




//same as above but for classrooms

export async function updateClassFlashcardData(classDocID, deckDocID, flashcardDocID, userAnsweredCorrectly) {
    // Making the reference to the flashcard data
    const flashcardDataExistsRef = firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
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
        if (doc.exists && userAnsweredCorrectly) // only use old streak if user answered correctly
            flashcardData.streak = doc.data().streak; // Flashcard data exists, get streak on flashcard
    });

    if (userAnsweredCorrectly)
        flashcardData.streak++;  // Answered correctly, increment streak.

    // Update flashcardData result on Firebase
    await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .doc(flashcardDocID)
        .set(flashcardData.serialize());

    console.log("flashcardDataStreak", flashcardData.streak);
    return flashcardData
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
    await deckDataExistsRef.get().then((doc) => {
        console.log("doc exists?", doc.exists);
        deckDataExists = doc.exists;
    });

    if (deckDataExists) // Deck exists, no need to create a deck data document
        return;

    //Deck doesn't exist, create a deck data document
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .set({
            lastSRSAccess: Utilites.getCurrentDate(),
            dateCreated: Utilites.getCurrentDate(),
            lastStudied: Utilites.getCurrentDate(),
            cachedDates: [],
            timeStudiedByDay: {
            },
        });
}
//===========================================================================//

//============================================================================//
// Returns the cached dates of the dates studied with Smart Study on.
//============================================================================//
export async function getDeckDataCachedFlashcardDataDates(uid, deckDocID) {
    let deckDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .get();

    return deckDataRef.data().cachedDates;
}
//===========================================================================//

//============================================================================//
// Returns the Map (JS object) that contains the amount of time spent studying
//  a deck on a specific day. As of 03/18/2022, it only tracks time studying a
//  deck on the study_page
//============================================================================//
export async function getDeckDataTimeStudiedByDay(uid, deckDocID) {
    let deckDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .get();

    return deckDataRef.data().timeStudiedByDay;
}
//===========================================================================//

//============================================================================//
// Returns the number of flaschard within a streak group for a given flashcard
//  data cache
//============================================================================//
export async function getStreakGroupCountForFlashcardDataCache(uid, deckDocID, date, streak) {
    let flashcardDataCacheRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(date + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .where('streak', '==', streak)
        .get()

    return flashcardDataCacheRef.docs.length;
}
//===========================================================================//

//============================================================================//
// Returns the number of flaschard within a streak group for a given flashcard
//  data cache
//============================================================================//
export async function getDeckData(uid, deckDocID) {
    let deckDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .get();

    return deckDataRef.data();
}
//===========================================================================//

//============================================================================//
// Updates the lastStudied field for a given deck data
//============================================================================//
export async function updateDeckDataLastStudied(uid, deckDocID) {
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .update({
            lastStudied: Utilites.getCurrentDate(),
        });
}
//===========================================================================//


//============================================================================//
// Returns the number of flaschard within a streak group for a given flashcard
//  data cache
//============================================================================//
export async function getStreakGroupCountAndAboveForFlashcardDataCache(uid, deckDocID, date, streak) {
    let flashcardDataCacheRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(date + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .where('streak', '>=', streak)
        .get();

    return flashcardDataCacheRef.docs.length;
}


export async function createClassDeckDataIfNeeded(classDocID, deckDocID) {
    let deckDataExists = false;

    // Making the reference to the deck data
    const deckDataExistsRef = firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
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
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
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
        .collection(Utilites.getCurrentDate() + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .get();

    flashcardsDataRef.forEach(doc => {
        const flashcardData = new FlashcardData(doc.data());
        flashcardData.set_docID(doc.id);
        flashcardsDataList.push(flashcardData);
    })

    return flashcardsDataList;
}

export async function getClassFlashcardsDataFromDeck(classDocID, deckDocID) {
    let flashcardsDataList = [];

    const flashcardsDataRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
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
// Gets the next flashcardModel for SmartStudying
//============================================================================//
export async function getNextSmartStudyFlashcard(uid, deckDocID, flashcardsCurrentlyStudying) {

    let targetedStreakGroup = 0;
    let randomNumber = Math.random();

    // console.log("Random Number Chosen: ", randomNumber);

    if (randomNumber >= 0.46875) { // Streak 0 OR New Card
        randomNumber = Math.random();

        if (randomNumber >= 0.75) { // New card Odds
            // Getting new card...
            let newFlashcard = await getFlashcardNotInFlashcardData(uid, deckDocID, flashcardsCurrentlyStudying);

            if (newFlashcard == null) {
                targetedStreakGroup = 0; // There are no new flashcards, so default to showing streak 0
            }
            else {
                return newFlashcard; // There was a new flashcard!
            }
        }
        else { // Streak 0 Odds 
            targetedStreakGroup = 0
        }
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

    let streakGroupHasFlashcards = true;
    // Grabs oldest interacted with flashcard from the targeted streak group
    let nextFlashcardDocID;
    let nextFlashcard = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Utilites.getCurrentDate() + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
        .where("streak", "==", targetedStreakGroup)
        .get();

    let flashcardsReceived = 0;
    let lastLowest = Number.MAX_SAFE_INTEGER;
    nextFlashcard.forEach((doc) => {
        streakGroupHasFlashcards = doc.exists;
        flashcardsReceived++;

        if (streakGroupHasFlashcards && doc.data().lastAccessed < lastLowest) {
            nextFlashcardDocID = doc.id;
            lastLowest = doc.data().lastAccessed;
        }
    });

    if (flashcardsReceived == 0) {
        streakGroupHasFlashcards = false
    }

    // Since it is possible for user to have no cards in a streak group, take precautions to 
    //  always get a flashcard
    if (!streakGroupHasFlashcards) { // if streak group contained no flashcard data


        // First, try and get new flashcard
        let newFlashcard = await getFlashcardNotInFlashcardData(uid, deckDocID, flashcardsCurrentlyStudying);

        if (newFlashcard != null) { // newFlashcard == null means there are no new flashcards
            return newFlashcard; // Returning the new flashcard
        }

        // No new flashcards exists. Pulling the oldest lastAccessed flashcard from all Streak Categories
        nextFlashcard = await firebase.firestore()
            .collection(Constant.collectionName.USERS)
            .doc(uid)
            .collection(Constant.collectionName.DECK_DATA)
            .doc(deckDocID)
            .collection(Utilites.getCurrentDate() + Constant.collectionName.FLASHCARDS_DATA_SUFFIX)
            .orderBy("lastAccessed", "asc")
            .limit(1)
            .get();

        nextFlashcard.forEach((doc) => {
            if (doc.exists)
                nextFlashcardDocID = doc.id;
        });
    }


    let nextFlashcardModel;
    for (let i = 0; i < flashcardsCurrentlyStudying.length; i++) {
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
//same as above for classrooms
//===========================================================================//

export async function getNextClassSmartStudyFlashcard(classDocID, deckDocID, flashcardsCurrentlyStudying) {

    let targetedStreakGroup = 0;
    let randomNumber = Math.random();

    // console.log("Random Number Chosen: ", randomNumber);

    if (randomNumber >= 0.46875) { // Streak 0 OR New Card
        randomNumber = Math.random();

        if (randomNumber >= 0.75) { // New card Odds
            // Getting new card...
            let newFlashcard = await getClassFlashcardNotInFlashcardData(classDocID, deckDocID, flashcardsCurrentlyStudying);

            if (newFlashcard == null) {
                targetedStreakGroup = 0; // There are no new flashcards, so default to showing streak 0
            }
            else {
                return newFlashcard; // There was a new flashcard!
            }
        }
        else { // Streak 0 Odds 
            targetedStreakGroup = 0
        }
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

    let streakGroupHasFlashcards = true;
    // Grabs oldest interacted with flashcard from the targeted streak group
    let nextFlashcardDocID;
    let nextFlashcard = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS_DATA)
        .where("streak", "==", targetedStreakGroup)
        .orderBy("lastAccessed", "asc")
        .limit(1)
        .get();

    let flashcardsReceived = 0;
    nextFlashcard.forEach((doc) => {
        streakGroupHasFlashcards = doc.exists;
        flashcardsReceived++;

        if (streakGroupHasFlashcards)
            nextFlashcardDocID = doc.id;
    });

    if (flashcardsReceived == 0) {
        streakGroupHasFlashcards = false
    }

    // Since it is possible for user to have no cards in a streak group, take precautions to 
    //  always get a flashcard
    if (!streakGroupHasFlashcards) { // if streak group contained no flashcard data


        // First, try and get new flashcard
        let newFlashcard = await getClassFlashcardNotInFlashcardData(classDocID, deckDocID, flashcardsCurrentlyStudying);

        if (newFlashcard != null) { // newFlashcard == null means there are no new flashcards
            return newFlashcard; // Returning the new flashcard
        }

        // No new flashcards exists. Pulling the oldest lastAccessed flashcard from all Streak Categories
        nextFlashcard = await firebase.firestore()
            .collection(Constant.collectionName.CLASSROOMS)
            .doc(classDocID)
            .collection(Constant.collectionName.DECK_DATA)
            .doc(deckDocID)
            .collection(Constant.collectionName.FLASHCARDS_DATA)
            .orderBy("lastAccessed", "asc")
            .limit(1)
            .get();

        nextFlashcard.forEach((doc) => {
            if (doc.exists)
                nextFlashcardDocID = doc.id;
        });
    }


    let nextFlashcardModel;
    for (let i = 0; i < flashcardsCurrentlyStudying.length; i++) {
        if (flashcardsCurrentlyStudying[i].docID == nextFlashcardDocID) {
            nextFlashcardModel = flashcardsCurrentlyStudying[i];
            break;
        }
    }

    return nextFlashcardModel;
}

// Helper function for getNextSmartStudyFlashcard(uid, deckDocID, flashcardsCurrentlyStudying)
//  Returns new if there are no new flashcards
async function getClassFlashcardNotInFlashcardData(classDocID, deckDocID, flashcardsCurrentlyStudying) {
    let flashcardsDataList = await getClassFlashcardsDataFromDeck(classDocID, deckDocID);

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
// This function pulls all decks from the highest level owned_decks collection
// in firestore. This is purely for testing for the time being and will later be
// modified to accomodate users / classrooms
//============================================================================//
export async function getClassDecks(classDocID) {
    let deckList = [];
    const classOwnedDecks = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
        .collection(Constant.collectionName.OWNED_DECKS)
        .orderBy('isFavorited', 'desc')
        .orderBy('name', 'asc')
        .get();


    classOwnedDecks.forEach(doc => {
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

//============================================================================//
// This function will pull the data for a single deck by its dock id
//  Note: this does not grab the cached flashcard data, only the deck data info
//  (i.e. last accessed and date created)
//============================================================================//
export async function getUserDataDeckById(uid, deckDocID) {
    const deckDataRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .get();

    if (!deckDataRef.exists) {
        if (Constant.DEV)
            console.log("! Deck Data reference does not exist");
        return null;
    }

    return deckDataRef.data();
}

//============================================================================//
// This function will pull in a single CLASS deck from it's docId
//============================================================================//
export async function getClassDeckByDocID(classDocID, deckDocID) {
    const deckRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
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
//============================================================================//
// This function will pull in a single CLASSROOM from it's docId
//============================================================================//
export async function getClassroomByDocID(classDocID) {
    const classRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID)
        .get();

    if (!classRef.exists) {
        if (Constant.DEV)
            console.log("! Deck reference does not exist");
        return null;
    }

    const classModel = new Classroom(classRef.data());
    classModel.set_docID(classDocID);
    return classModel;
}




//============================================================================//
// Favorite a deck
//============================================================================//
export async function favoriteDeck(uid, deckDocID, favorited) {
    await firebase.firestore().collection(Constant.collectionName.USERS)
        .doc(uid).collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .update({ 'isFavorited': favorited });
}


//============================================================================//
// Favorite a class deck
//============================================================================//
export async function favoriteClassDeck(classDocID, deckDocID, favorited) {
    await firebase.firestore().collection(Constant.collectionName.CLASSROOMS)
        .doc(classDocID).collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .update({ 'isFavorited': favorited });
}

//============================================================================//
// Get flashcards for a specific deck
//============================================================================//
//USERS
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
//CLASSROOMS
export async function getClassroomFlashcards(isClassDeck, docId) {
    let flashcards = [];
    const snapshot = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(isClassDeck)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docId)
        .collection(Constant.collectionName.FLASHCARDS).get();
    snapshot.forEach(doc => {
        const f = new Flashcard(doc.data());
        f.set_docID(doc.id);
        flashcards.push(f);
    })

    return flashcards;
}

//============================================================================//
// Get flashcards for a specific CLASS deck
//============================================================================//
export async function getClassDeckFlashcards(classDocID, docId) {
    let flashcards = [];
    const snapshot = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classDocID)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docId)
        .collection(Constant.collectionName.FLASHCARDS).get();
    snapshot.forEach(doc => {
        const f = new Flashcard(doc.data());
        f.set_docID(doc.id);
        flashcards.push(f);
    })

    return flashcards;
}



//============================================================================//
// Delete flashcards
//============================================================================//
export async function deleteFlashcard(uid, docID, flashcardId) {
    //Flashcard Reference
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .collection(Constant.collectionName.FLASHCARDS).doc(flashcardId)
        .get();
    //Creating a quick Flashcard so I can delete the Image

    const flashcard = new Flashcard(ref.data());
    flashcard.set_docID(docID);
    //Image Name Capture
    const questionImageName = flashcard.questionImageName;
    const answerImageName = flashcard.answerImageName;

    //Deletion
    try {
        await firebase.firestore().collection(Constant.collectionName.USERS).doc(uid)
            .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
            .collection(Constant.collectionName.FLASHCARDS).doc(flashcardId)
            .delete();
    } catch (e) { console.log(e); }

    //Deleting Question Image
    if (questionImageName != null && questionImageName != 'N/A') {
        const refQuestion = firebase.storage().ref()
            .child(Constant.storageFolderName.FLASHCARD_IMAGES + questionImageName);
        await refQuestion.delete();
    }
    //Deleting Answer Image
    if (answerImageName != null && answerImageName != 'N/A') {
        const refAnswer = firebase.storage().ref()
            .child(Constant.storageFolderName.FLASHCARD_IMAGES + answerImageName);
        await refAnswer.delete();
    }
}

export async function deleteClassFlashcard(classDocId, docID, flashcardId) {
    //Flashcard Reference
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classDocId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .collection(Constant.collectionName.FLASHCARDS).doc(flashcardId)
        .get();
    //Creating a quick Flashcard so I can delete the Image

    const flashcard = new Flashcard(ref.data());
    flashcard.set_docID(docID);
    //Image Name Capture
    const questionImageName = flashcard.questionImageName;
    const answerImageName = flashcard.answerImageName;

    //Deletion
    try {
        await firebase.firestore().collection(Constant.collectionName.CLASSROOMS).doc(classDocId)
            .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
            .collection(Constant.collectionName.FLASHCARDS).doc(flashcardId)
            .delete();
    } catch (e) { console.log(e); }

    //Deleting Question Image
    if (questionImageName != null && questionImageName != 'N/A') {
        const refQuestion = firebase.storage().ref()
            .child(Constant.storageFolderName.FLASHCARD_IMAGES + questionImageName);
        await refQuestion.delete();
    }
    //Deleting Answer Image
    if (answerImageName != null && answerImageName != 'N/A') {
        const refAnswer = firebase.storage().ref()
            .child(Constant.storageFolderName.FLASHCARD_IMAGES + answerImageName);
        await refAnswer.delete();
    }
}


//============================================================================//
// DELETE DECK
//============================================================================//
export async function deleteDeck(uid, docID) {
    //Get All flashcards
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .collection(Constant.collectionName.FLASHCARDS)
        .get();
    //Deletes each flashcard as it is pulled
    ref.forEach(doc => {
        const f = new Flashcard(doc.data());
        f.set_docID(doc.id);
        deleteFlashcard(uid, docID, f.docID);
    });

    //Delete Deck
    await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .delete();
}

//============================================================================//
// DELETE CLASS DECK
//============================================================================//
export async function deleteClassDeck(classDocId, docID) {
    //Get All flashcards
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classDocId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .collection(Constant.collectionName.FLASHCARDS)
        .get();
    //Deletes each flashcard as it is pulled
    ref.forEach(doc => {
        const f = new Flashcard(doc.data());
        f.set_docID(doc.id);
        deleteFlashcard(uid, docID, f.docID);
    });

    //Delete Deck
    await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classDocId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(docID)
        .delete();
}


//============================================================================//
// DELETE CLASSROOM
//============================================================================//

export async function deleteClassroom(classroomDocID) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classroomDocID)
        .delete();
}
//===========================================================================//

//===========================================================================//
//UPDATE DECK 
//===========================================================================//
/*  This will retrieve the deck as it is a nested subcollection, requiring
    to go through user to make the update.  I found that when updating
    both doc.data().'field' like doc.data().name and data.name work the
    same.  As I have given a declaration of data for data.question below.
============================================================================*/
export async function updateDeck(uid, deck, deckDocID) {

    //trying to put logic here with if statement to check if deck belongs to a class causes issues
    //therefore im building a separate function for class decks :[ -- blake
    const data = deck.serializeForUpdate();
    const deckRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .get().then((doc) => {
            if (doc.exists) {
                deck.name = data.name;
                deck.subject = data.subject;
                deck.dateCreated = data.dateCreated;
                deck.category = data.category;
                deck.keywords = data.keywords;
                deck.isClassroom = data.isClassroom;
            }//Error Code
            else if (Constant.DEV) {
                console.log(e);
                Utilites.info('Update Error Firebase', JSON.stringify(e));
            }

        });


    firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .update(deck.serialize());

}
export async function updateClassDeck(deck, deckDocID, classDocId) {
    //trying to put logic here with if statement to check if deck belongs to a class causes issues
    //therefore im building a separate function for class decks :[ -- blake
    const data = deck.serializeForUpdate();
    const deckRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classDocId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .get().then((doc) => {
            if (doc.exists) {
                deck.name = data.name;
                deck.subject = data.subject;
                deck.dateCreated = data.dateCreated;
                deck.category = data.category;
                deck.keywords = data.keywords;
                deck.isClassroom = data.isClassroom;
            }//Error Code
            else if (Constant.DEV) {
                console.log(e);
                Utilites.info('Update Error Firebase', JSON.stringify(e));
            }

        });


    firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classDocId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .update(deck.serialize());

}


//===========================================================================//
//EDIT FLASHCARD 
//===========================================================================//
//USER
//======
export async function getFlashCardById(uid, deckDocID, docID) {
    const flashRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS).doc(docID).get();
    if (flashRef.exists) {
        const flashcard = new Flashcard(flashRef.data());
        flashcard.set_docID(docID);
        return flashcard;
    } else {
        return null;
    }
}
//CLASSROOM
//==========
export async function getClassroomFlashCardById(isClassDeck, deckDocID, docID) {
    const flashRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(isClassDeck)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS).doc(docID).get();
    if (flashRef.exists) {
        const flashcard = new Flashcard(flashRef.data());
        flashcard.set_docID(docID);
        return flashcard;
    } else {
        return null;
    }
}


//===========================================================================//
//UPDATE FLASHCARD 
//===========================================================================//
/*  This will retrieve the flashcard as it is a nested subcollection, requiring
    to go through user and deck to make the update.  I found that when updating
    both doc.data().'field' like doc.data().question and data.question work the
    same.  As I have given a declaration of data for data.question below.
============================================================================*/
//USER
//=======
export async function updateFlashcard(uid, deckDocID, flashcard, docID) {
    const data = flashcard.serializeForUpdate();
    const flashRef = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS).doc(docID)
        .get().then((doc) => {
            if (doc.exists) {
                flashcard.question = data.question;
                flashcard.answer = data.answer;
                //flashcard.isMultipleChoice = data.isMultipleChoice;
                flashcard.incorrectAnswers = data.incorrectAnswers;
                flashcard.questionImageName = data.questionImageName;
                flashcard.questionImageURL = data.questionImageURL;
                flashcard.answerImageName = data.answerImageName;
                flashcard.answerImageURL = data.answerImageURL;
                console.log("UPDATED");
            }//Error Code
            else if (Constant.DEV) {
                console.log(e);
                Utilites.info('Update Error Firebase', JSON.stringify(e));
            }
        });

    firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS).doc(docID)
        .set(flashcard.serialize());
}
//CLASSROOM
//==========
export async function updateClassroomFlashcard(isClassDeck, deckDocID, flashcard, docID) {
    const data = flashcard.serializeForUpdate();
    const flashRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(isClassDeck)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS).doc(docID)
        .get().then((doc) => {
            if (doc.exists) {
                flashcard.question = data.question;
                flashcard.answer = data.answer;
                //flashcard.isMultipleChoice = data.isMultipleChoice;
                flashcard.incorrectAnswers = data.incorrectAnswers;
                flashcard.questionImageName = data.questionImageName;
                flashcard.questionImageURL = data.questionImageURL;
                flashcard.answerImageName = data.answerImageName;
                flashcard.answerImageURL = data.answerImageURL;
                console.log("UPDATED");
            }//Error Code
            else if (Constant.DEV) {
                console.log(e);
                Utilites.info('Update Error Firebase', JSON.stringify(e));
            }
        });

    firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(isClassDeck)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckDocID)
        .collection(Constant.collectionName.FLASHCARDS).doc(docID)
        .set(flashcard.serialize());
}
//============================================================================//
// EXISTING IMAGE FOR UPDATE
//============================================================================//
//  This will retrieve an image already existing from the storage
//  reference link : https://firebase.google.com/docs/storage/web/download-files#web-version-9_2
export async function existingImageForUpdate(imageNamePassed) {

    const storageRef = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + imageNamePassed);
    // console.log(`Check 1`);
    try {
        // console.log(`Check 2`);
        const imageURL = await storageRef.getDownloadURL();
        // console.log(`imageURL = ${imageURL}`);

        // console.log(`check 3`)
        //const imageName = imageName;
        return { imageNamePassed, imageURL };
        // console.log(`check 3`)

    } catch (e) {
        if (Constant.DEV) console.log(e);
        Utilites.info('Error Updating w/ Exisiting Image', JSON.stringify(e), "modal-edit-a-flashcard");
    }
}
//Uploaded Image ! (Since the target image is the original image)
export async function uploadImageToFlashcardAnswerEdit(answerImageFile) {
    //Generic Naming
    const answerImageName = Date.now() + answerImageFile.name + 'answer';

    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + answerImageName);

    const taskSnapShot = await ref.put(answerImageFile);
    const answerImageURL = await taskSnapShot.ref.getDownloadURL();
    return { answerImageName, answerImageURL };
}
//Uploaded Image ? (Since the target image is the original image)
export async function uploadImageToFlashcardQuestionEdit(questionImageFile) {
    //Generic Naming
    const questionImageName = Date.now() + questionImageFile.name + 'question';
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.FLASHCARD_IMAGES + questionImageName);
    const taskSnapShot = await ref.put(questionImageFile);
    const questionImageURL = await taskSnapShot.ref.getDownloadURL();
    return { questionImageName, questionImageURL };
}
//============================================================================//
// create default timer 
//============================================================================//


export async function updateUserInfo(uid, updateInfo) {
    await firebase.firestore().collection(Constant.collectionName.USERS)
        .doc(uid).update(updateInfo);
}
//============================================================================//
//Update Classroom
//============================================================================//
export async function updateClassroom(classroom) {
    await firebase.firestore().collection(Constant.collectionName.CLASSROOMS).doc(classroom.docID)
        .update({ 'name': classroom.name, 'subject': classroom.subject, 'category': classroom.category, 'keywords': classroom.keywords });
}
//============================================================================//
//Ban Members
//============================================================================//
export async function banMember(docID, member) {
    await firebase.firestore().collection(Constant.collectionName.CLASSROOMS).doc(docID)
        .update({
            banlist: firebase.firestore.FieldValue.arrayUnion(member)
        });

}

export async function unbanMember(docID, member) {
    await firebase.firestore().collection(Constant.collectionName.CLASSROOMS).doc(docID)
        .update({
            banlist: firebase.firestore.FieldValue.arrayRemove(member)
        });
}


export async function getUserTimerDefault(uid) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid);
    let defaultTimerSetting;
    await ref.get()
        .then((doc) => {
            const user = User.deserialize(doc.data());
            defaultTimerSetting = user.defaultTimerSetting;
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    return defaultTimerSetting;

}


//============================================================================//
// update user coins
//============================================================================//

export async function updateCoins(uid, coins) {
    await firebase.firestore().collection(Constant.collectionName.USERS).doc(uid)
        .update({ 'coins': coins });

    Element.coinCount.innerHTML = coins;
    localStorage.setItem('usercoins', coins);
}

//============================================================================//
// Gets all available classrooms
//============================================================================//
export async function getAvailableClassrooms() {
    let classroomList = [];
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .get();

    ref.forEach(doc => {
        const cr = new Classroom(doc.data());
        cr.set_docID(doc.id);
        classroomList.push(cr);
    });

    return classroomList;
}

//============================================================================//
// Gets one classroom
//============================================================================//
export async function getOneClassroom(classroomDocID) {
    const classroomRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .doc(classroomDocID)
        .get();

    if (!classroomRef.exists) return null;

    const classroom = new Classroom(classroomRef.data());
    classroom.set_docID(classroomDocID);
    return classroom;
}

//============================================================================//
// CREATE A Classroom
//============================================================================//
export async function createClassroom(classroom) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .add(classroom.serialize());

    return ref.id;
}
//============================================================================//

//============================================================================//
// Retrieve CATEGORIES
//============================================================================//
export async function getCategories() {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.BACKEND)
        .doc('Categories')
        .get();

    const backend = new Backend(ref.data());
    return backend.categories;
}
//============================================================================//
//============================================================================//
//JOIN Classroom
//============================================================================//
export async function joinClassroom(classId, userEmail) {
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    await firebase.firestore().collection(Constant.collectionName.CLASSROOMS).doc(classId)
        .update({ members: arrayUnion(userEmail) });
}
//============================================================================//
//LEAVE Classroom
//============================================================================//
export async function leaveClassroom(classId, userEmail) {
    const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
    await firebase.firestore().collection(Constant.collectionName.CLASSROOMS).doc(classId)
        .update({ members: arrayRemove(userEmail) });
}
//============================================================================//

//============================================================================//
// get user COINS
//============================================================================//
export async function getCoins(uid) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .get();

    const user = new User(ref.data());
    return user.coins;
}
//============================================================================//

//============================================================================//
// Functions for class chat
//============================================================================//
export async function addNewMessage(classroomDocID, message) {
    const docRef = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOM_CHATS)
        .doc(classroomDocID)
        .collection(Constant.collectionName.MESSAGES)
        .add(message.serialize());
    return docRef.id;
}

export async function getMessages(classroomDocID) {
    let messages = [];
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOM_CHATS)
        .doc(classroomDocID)
        .collection(Constant.collectionName.MESSAGES)
        .orderBy('timestamp')
        .get();

    ref.forEach(doc => {
        let m = new Message(doc.data());
        m.set_docID(doc.id);
        messages.push(m);
    })

    return messages;
}

//============================================================================//
// SEARCH FUNCTIONS
//============================================================================//

// === DECKS==================================================================//
export async function searchDecks(uid, keywordsArray) {
    const deckList = []
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(uid)
        .collection(Constant.collectionName.OWNED_DECKS)
        .where('keywords', 'array-contains-any', keywordsArray)
        .orderBy('dateCreated', 'desc')
        .get();
    snapShot.forEach(doc => {
        const t = new Deck(doc.data());
        //t.set_docID(doc.id);
        t.docId = doc.id; //changed this to be consistent with all the other deck stuff
        deckList.push(t)
    });
    return deckList;
}

// === CLASSROOMS ============================================================//
export async function searchAllClassrooms(keywordsArray) {
    const classroomList = []
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .where('keywords', 'array-contains-any', keywordsArray)
        .get();
    snapShot.forEach(doc => {
        const t = new Classroom(doc.data());
        t.set_docID(doc.id);
        classroomList.push(t);
    });
    return classroomList;
}

export async function returnMyClassroomsDocId(email) {
    const myClassroomDocIdList = []
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .where('members', 'array-contains', email)
        .get();
    snapShot.forEach(doc => {
        myClassroomDocIdList.push(doc.id);
    });
    return myClassroomDocIdList;
}

export async function searchMyClassrooms(email, keywordsArray) {
    let myClassroomList = []
    const classroomDocIds = await returnMyClassroomsDocId(email);

    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .where('keywords', 'array-contains-any', keywordsArray)
        .get();

    for (const docId of classroomDocIds) {
        snapShot.forEach(doc => {
            if (doc.id == docId) {
                const t = new Classroom(doc.data());
                t.set_docID(doc.id);
                myClassroomList.push(t);
            };
        });
    }
    return myClassroomList;
}

export async function searchNotMyClassrooms(email, keywordsArray) {

    let classroomList = []
    const classroomDocIds = await returnMyClassroomsDocId(email);

    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS)
        .where('keywords', 'array-contains-any', keywordsArray)
        .get();



    snapShot.forEach(doc => {
        for (const docId of classroomDocIds) {
            if (doc.id != docId) {
                const t = new Classroom(doc.data());
                t.set_docID(doc.id);
                classroomList.push(t)
            };
            break //moves to next snapshot doc after pushing to classroomList
        }
    });

    return classroomList;
}

//============================================================================//

//============================================================================//
// LEADERBOARDS
//============================================================================//
export async function leaderboardByCoins(members) {
    let classroomLeadersByCoins = [];

    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .where('email', 'in', members)
        .orderBy('coins', 'desc')
        .get();


    ref.forEach(doc => {
        let cm = new User(doc.data());
        cm.set_docID(doc.id);
        classroomLeadersByCoins.push(cm);
    })

    return classroomLeadersByCoins;
}
//Gets the count of the decks and updates it to a new field in user
export async function leaderboardByDecks(members) {
    let classroomLeadersByDecks = [];

    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .where('email', 'in', members)
        .orderBy('deckNumber', 'desc')
        .get();

    ref.forEach(doc => {
        let cm = new User(doc.data());
        cm.set_docID(doc.id);
        classroomLeadersByDecks.push(cm);
    })

    return classroomLeadersByDecks;

}
//Gets the count of the decks and updates it to a new field in user
export async function leaderboardByFlashcards(members) {
    let classroomLeadersByFlashcards = [];

    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .where('email', 'in', members)
        .orderBy('flashcardNumber', 'desc')
        .get()

    ref.forEach(doc => {
        let cm = new User(doc.data());
        cm.set_docID(doc.id);
        classroomLeadersByFlashcards.push(cm);
    })
    return classroomLeadersByFlashcards;
}

//============================================================================//
// UPDATE COUNTS
//============================================================================//
/*  This is used to maintain the data needed for the leaderboards query.
 *  These functions were based of an initialy query, but found it easier to add
 *  them as fields to the parent document of each subcollection. This should make
 *  Producing the leaderboards data much faster and less taxing, as it initially
 *  had nested upon nest querries.                                            */
/*  PREVIOUSLY USED QUERY:
    export async function updateFlashcardCount(currentUser, deckId){
    const ref = await firebase.firestore()
    .collection(Constant.collectionName.USERS)
    .where('email', 'in', members)
    .get().then((querySnapshot)=>{
        querySnapshot.forEach(async (doc)=>{
            const userdocId = doc.id ;
            const countDeck = await firebase.firestore()
            .collection(Constant.collectionName.USERS).doc(userdocId)
            .collection(Constant.collectionName.OWNED_DECKS)
            .get().then((querySnapshot2)=>{
                querySnapshot2.forEach(async (doc) =>{
                    const countFlash = await firebase.firestore()
                    .collection(Constant.collectionName.USERS).doc(userdocId)
                    .collection(Constant.collectionName.OWNED_DECKS).doc(doc.id)
                    .collection(Constant.collectionName.FLASHCARDS)
                    .get()
                    console.log(`Doc ID:${doc.id} Size:${countFlash.size}`);
                    await firebase.firestore()
                    .collection(Constant.collectionName.USERS).doc(userdocId)
                    .collection(Constant.collectionName.OWNED_DECKS).doc(doc.id)
                    .update({'flashcardNumber': countFlash.size});
                });
            });
        });
    });
}                                                                             */
//============================================================================//
//FLASHCARD COUNT
//===============
//For DECKS
export async function updateFlashcardCount(currentUser, deckId) {
    //This grabs all flashcards within the deck, so we can get a count on them
    const countFlash = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(currentUser)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckId)
        .collection(Constant.collectionName.FLASHCARDS)
        .get()

    //This updates the flashcard number by counting the previous get() reference
    await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(currentUser)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckId)
        .update({ 'flashcardNumber': countFlash.size });
    //This updates the flashcard number by counting the previous get() reference
    await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(currentUser)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckId)
        .update({ 'flashcardNumber': countFlash.size });
    //Used in Edit Deck when updating to retain the flashcardNumber 
    return countFlash.size;

}
//For USER
export async function updateFlashcardCountForUser(currentUser) {
    let deckList = [];
    let flashcardCount = 0;
    //This grabs all the decks owned by a user, so we can get a count on them
    const countDeck = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(currentUser)
        .collection(Constant.collectionName.OWNED_DECKS)
        .get()
    //This collects all decks into an array so I may count up the the flashcards
    countDeck.forEach(doc => {
        let deck = new Deck(doc.data());
        deck.set_docID(doc.id);
        deckList.push(deck);
    });
    for (let i = 0; i < deckList.length; i++) {
        flashcardCount += deckList[i].flashcardNumber;
    }
    //This updates the flashcard number by counting the previous get() reference
    await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(currentUser)
        .update({ 'flashcardNumber': flashcardCount });

    return flashcardCount;

}

export async function updateClassFlashcardCount(classroomId, deckId) {
    //This grabs all flashcards within the deck, so we can get a count on them
    const countFlash = await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classroomId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckId)
        .collection(Constant.collectionName.FLASHCARDS)
        .get()

    //This updates the flashcard number by counting the previous get() reference
    await firebase.firestore()
        .collection(Constant.collectionName.CLASSROOMS).doc(classroomId)
        .collection(Constant.collectionName.OWNED_DECKS).doc(deckId)
        .update({ 'flashcardNumber': countFlash.size });

    //Used in Edit Deck when updating to retain the flashcardNumber 
    return countFlash.size;

}
//DECK COUNT
export async function updateDeckCount(currentUser) {
    //This grabs all the decks owned by a user, so we can get a count on them
    const countDeck = await firebase.firestore()
        .collection(Constant.collectionName.USERS).doc(currentUser)
        .collection(Constant.collectionName.OWNED_DECKS)
        .get()
    //This updates the deck number by counting the previous get() reference
    await firebase.firestore().collection(Constant.collectionName.USERS).doc(currentUser)
        .update({ 'deckNumber': countDeck.size });
    //Used when deleting a deck
    return countDeck;
}
//============================================================================//

//============================================================================//
// Submit a help ticket
//============================================================================//
export async function submitHelpTicket(helpTicket) {
    const helpTicketRef = await firebase.firestore()
        .collection(Constant.collectionName.HELPTICKETS).add(helpTicket.serialize());
    return helpTicketRef;
}

export async function uploadHelpTicketImage(imageFile, imageName) {
    if (!imageName) {
        imageName = Date.now() + imageFile.name;
    }
    const ref = firebase.storage().ref().child(Constant.storageFolderName.HELPTICKET_IMAGES + imageName);
    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();
    return { imageName, imageURL };
}

export async function updateHelpTicket(helpTicketDocId, update) {
    await firebase.firestore().collection(Constant.collectionName.HELPTICKETS).doc(helpTicketDocId).update(update);
}

//============================================================================//
// User help ticket functions
//============================================================================//
export async function getUserHelpTickets(email) {
    let helpTickets = [];
    const helpTicketSnapshot = await firebase.firestore()
        .collection(Constant.collectionName.HELPTICKETS)
        .where('submittedBy', '==', email)
        .orderBy('timestamp', 'desc')
        .get();
    helpTicketSnapshot.forEach(doc => {
        const ht = new HelpTicket(doc.data());
        ht.set_docID(doc.id);
        helpTickets.push(ht);
    })

    return helpTickets;
}

export async function getOneHelpTicket(helpTicketDocId) {
    const helpTicketRef = await firebase.firestore()
        .collection(Constant.collectionName.HELPTICKETS)
        .doc(helpTicketDocId)
        .get();

    if (!helpTicketRef.exists) return null;

    const helpTicket = new HelpTicket(helpTicketRef.data());
    helpTicket.set_docID(helpTicketDocId);
    return helpTicket;
}

export async function closeHelpTicket(helpTicketDocId, imageName) {
    await firebase.firestore().collection(Constant.collectionName.HELPTICKETS).doc(helpTicketDocId).delete();
    if (imageName != '') {
        await firebase.storage().ref().child(Constant.storageFolderName.HELPTICKET_IMAGES + imageName).delete();
    }
}
//============================================================================//
// Help ticket functions for admin
//============================================================================//
export async function getHelpTickets() {
    let helpTickets = [];
    const helpTicketSnapshot = await firebase.firestore()
        .collection(Constant.collectionName.HELPTICKETS)
        .orderBy('timestamp', 'desc')
        .get();
    helpTicketSnapshot.forEach(doc => {
        const ht = new HelpTicket(doc.data());
        ht.set_docID(doc.id);
        helpTickets.push(ht);
    })

    return helpTickets;
}

//============================================================================//
// Get USER
//============================================================================//
export async function getUser(uid) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .get();

    const user = new User(ref.data());
    return user;
}
//============================================================================//

//============================================================================//
//UPDATE USER PROFILE
//============================================================================//
export async function updateUserProfile(uid, username, userBio, profilePhotoName, profilePhotoURL) {
    if ((profilePhotoURL != null) && (profilePhotoName != null)) {
        await firebase.firestore().collection(Constant.collectionName.USERS)
            .doc(uid)
            .update({ 'username': username, 'userBio': userBio, 'profilePhotoName': profilePhotoName, 'profilePhotoURL': profilePhotoURL });
    } else {
        await firebase.firestore().collection(Constant.collectionName.USERS)
            .doc(uid)
            .update({ 'username': username, 'userBio': userBio });
    }
}

// UPLOAD PROFILE PICTURE
export async function uploadProfilePicture(profilePicturerFile, profilePictureName) {
    //image doesn't have a name
    if (!profilePictureName) {
        profilePictureName = Date.now() + profilePicturerFile.name + 'pfp';
    }
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.PROFILE_PICTURES + profilePictureName);
    const taskSnapShot = await ref.put(profilePicturerFile);
    const profilePictureURL = await taskSnapShot.ref.getDownloadURL();
    return { profilePictureName, profilePictureURL };
}

//============================================================================//
// UPDATE POMOPET
//============================================================================//
export async function updatePomopet(uid, pomopet) {
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .update({ 'pomopet': pomopet });
}
//============================================================================//


//============================================================================//
// LOG TIME SPENT STUDYING.
//  Use in any instance when the user nagivagtes away from the study_page.
//  It grabs the time saved in the local storage "studyStartTime", gets the 
//  difference, and uploads it to the respective decks data document. It saves
//  it to that days cached time spent studying.
//============================================================================//
export async function logTimeSpentStudying(uid, deckDocID) {
    localStorage.setItem("studyTimeTracked", "true");
    console.log('logging time spent');

    let deckData = await getDeckData(uid, deckDocID);
    let timeStudiedByDayMap = deckData.timeStudiedByDay; // getting this so we can get total time spent studying today

    let timeSpentStudyingNow = new Date().getTime() - localStorage.getItem("studyStartTime"); // (Current time - time started studying) = total time spent studying this session
    let timeSpentStudyingEarlierToday = timeStudiedByDayMap[Utilites.getCurrentDate()]; // total time spent studying today on this deck
    if (timeSpentStudyingEarlierToday == undefined)
        timeSpentStudyingEarlierToday = 0; // If it is the first time studying this deck today
    let timeSpentStudyingTotalTodayMs = timeSpentStudyingNow + timeSpentStudyingEarlierToday;

    console.log(timeSpentStudyingTotalTodayMs);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("This session: [ms] ", timeSpentStudyingNow);
    console.log("This session: [s] ", (timeSpentStudyingNow / 1000));
    console.log("Last session: [ms] ", timeSpentStudyingEarlierToday);
    console.log("Last session: [s] ", (timeSpentStudyingEarlierToday / 1000));
    console.log("Total: [ms] ", timeSpentStudyingTotalTodayMs);
    console.log("Total: [s] ", (timeSpentStudyingTotalTodayMs / 1000));
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    timeStudiedByDayMap[Utilites.getCurrentDate()] = timeSpentStudyingTotalTodayMs; // update today's total study time in the map

    await firebase.firestore() // update today's total study time in cloud firestore
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .collection(Constant.collectionName.DECK_DATA)
        .doc(deckDocID)
        .update({
            timeStudiedByDay: timeStudiedByDayMap
        });
}
//============================================================================//


//============================================================================//
// POMOSHOP 
//============================================================================//
export async function getPomoshopItems() {
    let items = [];
    const pomoshop = await firebase.firestore()
        .collection(Constant.collectionName.POMOSHOP)
        .get();

    pomoshop.forEach(doc => {
        const item = new Pomoshop(doc.data());
        item.set_docID(doc.id);
        items.push(item);
    });

    return items;
}

export async function uploadItemImage(imageFile, imageName) {
    if (!imageName)
        imageName = Date.now() + imageFile.name;

    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.POMOSHOP_IMAGES + imageName);
    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();
    return { imageName, imageURL };
}

export async function addItemtoShop(item) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.POMOSHOP)
        .add(item);
    return ref.id;
}

//============================================================================//

//============================================================================//
// UPDATE USER ITEMS OWNED
//============================================================================//
export async function updateItemsOwned(uid, itemsOwned) {
    await firebase.firestore()
        .collection(Constant.collectionName.USERS)
        .doc(uid)
        .update({ 'itemsOwned': itemsOwned });
}
//============================================================================//