 export class Pomoshop {
    constructor(data) {
        this.name = data.name;
        this.cost = data.cost;
        this.photoURL = data.photoURL;
        this.skinType = data.skinType;
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
            skinType: this.skinType,
        };
    }
}