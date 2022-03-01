 /**************************************************
 *               Create Backend document
 **************************************************/
export class Backend {
    constructor(data) {
        this.categories = data.categories;
    }

    // to store in Firestore
    serialize() {
        return {
            categories: this.categories,
        };
    }
}