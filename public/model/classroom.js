/**************************************************
 *               Create Classroom Class
 **************************************************/
 export class Classroom {
    constructor(data) {
        this.name = data.name;
        this.subject = data.subject;
        this.dateCreated = data.dateCreated;
        //this.isFavorited = data.isFavorited;
        this.category = data.category;
        this.moderatorList = data.moderatorList;
        this.members = data.members;
        // FOR FUTURE USE AND EXPANSION
        //this.isPublic = data.isPublic

    }

    /**************************************************
     *      Setter for the Document ID
    **************************************************/
    set_docID(ID){
        this.docID = ID;
    }


    /************************************************************************
     *                          toFirestore Method
     ********************************************************************
     *      This method will serialize the data so 
     *      that it will be compatible with the 
     *      Firestore. A link to supported types:
     *      https://cloud.google.com/firestore/docs/concepts/data-types
     *      Acceptable types:
     *      -boolean
     *      -array
     *      -string
     *      -map
     *      -timestamp
     *      -floating-point & integer
     **************************************************************************/

    // to store in Firestore
    serialize() {
        return {
            name: this.name,
            subject: this.subject,
            //dateCreated: this.dateCreated,
            //isFavorited: this.isFavorited,
            category: this.category,
            moderatorList: this.moderatorList,
            members: this.members,
            // FOR FUTURE USE AND EXPANSION
            //isPublic: this.isPublic,

        };
    }
}