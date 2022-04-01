export class Pomoshop {
    constructor(data) {
        this.name = data.name;
        this.cost = data.cost;
        this.photoURL = data.photoURL;
        this.photoName = data.photoName;
        this.skinType = data.skinType;
        this.rarity = data.rarity;
    }

    /**************************************************
     *      Setter for the Document ID
    **************************************************/
    set_docID(ID) {
        this.docID = ID;
    }

    // to store in Firestore
    serialize() {
        return {
            name: this.name,
            cost: this.cost,
            photoURL: this.photoURL,
            photoName: this.photoName,
            skinType: this.skinType,
            rarity: this.rarity,
        };
    }
}