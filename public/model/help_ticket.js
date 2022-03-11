export class HelpTicket {
    constructor(data) {
        this.submittedBy = data.submittedBy;
        this.timestamp = data.timestamp;
        this.category = data.category;
        this.title = data.title;
        this.description = data.description;
        this.feedback = []; // wird mit feedback in form einer nachrichtenklasse gefuellt
        this.helpTicketImageName = data.helpTicketImageName;
        this.helpTicketImageURL = data.helpTicketImageURL;
        this.status = data.status;
    }

    /**************************************************
     *      Setter for the Document ID
    **************************************************/
    set_docID(ID) {
        this.docID = ID;
    }

    /******************************
     * Firestore method
     ******************************/
    serialize() {
        return {
            submittedBy: this.submittedBy,
            timestamp: this.timestamp,
            title: this.title,
            category: this.category,
            description: this.description,
            feedback: this.feedback,
            helpTicketImageName: this.helpTicketImageName,
            helpTicketImageURL: this.helpTicketImageURL,
            status: this.status,
        }
    }
}