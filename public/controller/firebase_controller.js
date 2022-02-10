import * as Constant from '../model/constant.js'

export async function createDeck(deck) {
    const ref = await firebase.firestore()
        .collection(Constant.collectionName.OWNED_DECKS)
        .add(deck.serialize());
    return ref.id;
}