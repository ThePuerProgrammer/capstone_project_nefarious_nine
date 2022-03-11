import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import { Message } from '../model/message.js'
import { Classroom } from '../model/classroom.js'
import { classrooms_page } from './classrooms_page.js'
import { buildStudyDecksPage } from './study_decks_page.js'


export async function one_classroom_page(classroomDocID) {
    console.log(classroomDocID);
    Elements.root.innerHTML = '';
    let html = '';

    let classroom;
    try {
        classroom = await FirebaseController.getOneClassroom(classroomDocID);
    } catch (e) {
        console.log(e);
        Utilities.info('Failed to retrieve classroom', JSON.stringify(e));
    }

    let members = [];
    //get members list
    if (classroom.members != null) {
        for (let k = 0; k < classroom.members.length; k++) {
            members.push(classroom.members[k]);
        }
    }

    let mod = false;
    for (let i = 0; i < classroom.moderatorList.length; i++) { //check if current user is a mod
        if (Auth.currentUser.email == classroom.moderatorList[i]) {
            mod = true;
        }
    }

    // adding classroom, members, and leaderboard tabs
    html += `<div class="classroom-page-tab">
        <button id="classroom-gen-button" class="classroom-tab"><i class="small material-icons">school</i>Classroom</button>
        <button id="classroom-members-button" class="classroom-tab"><i class="small material-icons">group</i>Members</button>
        <button id="classroom-leaderboard-button" class="classroom-tab"><i class="small material-icons">insert_chart</i>Leaderboard</button>
        <button id="classroom-chat-button" class="classroom-tab"><i class="small material-icons">chat</i>Chat</button>
        </div>`;

    // CLASSROOM tab contents
    html += `<div id="Classroom" class="one-classroom-tab-content">
        <h1>${classroom.name}</h1>
        <h4>${classroom.subject}, ${classroom.category}</h4>
        <br>`;

    //if current user is a mod, populate delete button
    //prevents null button error
    if (mod == true) {
        //removed doc id from page view -- Blake
        html += `
            <button id="button-delete-classroom" type="click" class="btn btn-danger pomo-bg-color-md pomo-text-color-dark pomo-font-weight-bold" data-bs-toggle="modal" data-bs-target="#modal-delete-classroom">
            <i class="material-icons">delete</i>Delete Classroom
            </button>`
            ;
    }
    //Building Decks
    let deckList = [];
    try {
        deckList = await FirebaseController.getClassDecks(classroom.docID);

    } catch (e) {
        console.log(e);
    }
    buildStudyDecksPage(deckList);

    html += `</div>`;
    //CLASSROOM TAB END-----------------------------------------------------

    // MEMBERS tab contents
    html += `<div id="Members" class="one-classroom-tab-content">
        <div class="row">
        <div class="column">
        <h2>Members</h2>`;

    // If mod, show members w BAN option
    if (mod == true && members != null) {
        members.forEach(member => {
            html += `<tr>${buildButtons(member, classroom.banlist)}</tr>`;
        })
    } else {
        if (members != null) {
            members.forEach(member => {
                html += `<p>${member}</p>`;
            })
        }
    }

    html += `</div>
        <div class="column">
        <h2>Mods</h2>`;

    // display mods list
    let mods = classroom.moderatorList
    mods.forEach(mod => {
        html += `<p>${mod}</p>`;
    })
    //MEMEMBERS TAB END------------------------------------------------------

    
    //let leaderboardCoins = [];
    //leaderboardCoins = await FirebaseController.leaderboardByCoins(members);
    let leaderboardDecks = [];
    leaderboardDecks = await FirebaseController.leaderboardByDecks(members);
    //let leaderboardFlashcards = [];
    //leaderboardFlashcards = await FirebaseController.leaderboardByFlashcards(members);
    html += `</div>
        </div>
        </div>`;

    // LEADERBOARD tab content
    html += `<div id="Leaderboard" class="one-classroom-tab-content">
    <center>
    <div class="leaderboard-main-row"><h2>Leaderboard</h2><div class="leaderboard-button-category"><button id="button-leaderboard-select-modal" type="button" class="btn btn-secondary pomo-bg-color-dark" style="float:right;"> <i class="material-icons text-white">star</i>Select Category</button>
    </div></div>

        <br/>
        <table class="leaderboard-table">
            <tr>
                <th class="leaderboard-th">Rank</th>
                <th class="leaderboard-th">User</th>
                <th class="leaderboard-th">Coins</th>
                <th class="leaderboard-th">Decks</th>
            </tr>`;

    if(leaderboardDecks.length >0 ){
        let index = 1;
        leaderboardDecks.forEach(e =>{
            html+= buildLeaderBoard(e, index);
            index++;
        });
    }
    html+=`</table></center></div>`;
       
    let messages = [];
    messages = await FirebaseController.getMessages(classroomDocID);

    html += `<div id="Chat" class="one-classroom-tab-content">
        <div id="message-reply-body">`;
    if (messages.length > 0) {
        messages.forEach(m => {
            html += buildMessageView(m);
        })
    } else {
        html += '<p id="temp">No messages have been posted yet...be the first!</p>';
    }
    html += `</div>`;
    //LEADERBOARD TAB END----------------------------------------------------------

    // CHAT tab content
    html += `<div>
    <textarea id="add-new-message" placeholder="Send a message..." style="border: 1px solid #2C1320; width: 700px; height: 150px; background-color: #2C1320; color: #A7ADC6;"></textarea>
    <br>
    <button id="classroom-message-button" style="background-color: #2C1320; color: #A7ADC6;"><i class="small material-icons">send</i> Send</button>
    </div>
    </div>`;

    Elements.root.innerHTML = html;

        let availableClassroomList = [];
        let classDecks = [];
        try {
            availableClassroomList = await FirebaseController.getAvailableClassrooms();
        } catch (e) {
            Utilities.info('Error getting available classrooms', JSON.stringify(e));
            console.log(e);
        }
    
    
        // get my classrooms
        let myClassroomList = [];
        for (let i = 0; i < availableClassroomList.length; i++) {
            if (availableClassroomList[i].moderatorList.includes(Auth.currentUser.email)) {
                myClassroomList.push(availableClassroomList[i]);
                let tempDeck = await FirebaseController.getClassDecks(availableClassroomList[i].docID);
                if (tempDeck.length < 1) {
                    continue;
                }
                classDecks.push(tempDeck);
                tempDeck = [];
            } else {
                //keep looping to fill myclassroom list
                continue;
            }
    
        }
        //push our class decks onto the deckList for build view, 
        //might want to distinguish which are class decks or not for the view
        for (let i = 0; i < classDecks.length; i++) {
            deckList.push(...classDecks[i]);
        }
    
    
    
    

        //Clears all HTML so it doesn't double
        html += '<h1> Study Decks <button id="search-decks-button" class="btn search-btn search-btn-hover rounded-pill ms-n3" type="click" style="float:right;"><i class="material-icons">search</i>Search Decks</button></h1> '
            ;
    
        //create deck button
        html += `<button id="${Constant.htmlIDs.createDeck}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">
        <i class="material-icons pomo-text-color-light">add</i> Create A Deck</button>
         `;
    
        // sort select menu
        html += `
        <div style="float:right; padding-right:50px;">
        <label for="sort-decks">Order by:</label>
        <select name="sort-decks" id="sort-decks" style="width: 200px">
            <option selected disabled>Sort decks by...</option>
            <option value="name">Name</option>
            <option value="subject">Subject</option>
            <option value="date">Date</option>
            <option value="category">Category</option>
        </select>
        </div>    
        <br><br>
        `
    
    
        html += `<div id="deck-container">`
        for (let i = 0; i < deckList.length; i++) {
            let flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, deckList[i].docId);
            html += buildDeckView(deckList[i], flashcards);
        }
        // for (let i = 0; i < deckList.length; i++) {
        //     let flashcards = await FirebaseController.getClassDeckFlashcards(, deckList[i].docId);
        //     html += buildDeckView(deckList[i], flashcards);
        // }
    
        html += `</div>`
    
        if (deckList.length == 0) {
            html += '<h2> No decks found! Go create some and get to studying!</h2>'
        }
    
    
    
    
    
    
        // Elements.root.innerHTML += html;
        // adds an event listener to each of the view buttons
        const viewDeckButtons = document.getElementsByClassName('form-view-deck');
        for (let i = 0; i < viewDeckButtons.length; i++) {
            viewDeckButtons[i].addEventListener('submit', async e => {
                e.preventDefault();
                let deckId = e.target.docId.value;
                let isClassDeck = e.target.classdocId.value;
                console.log("check for form view deck submit event " + e.target.classdocId.value);
    
                window.sessionStorage;
                sessionStorage.setItem('deckId', deckId);
    
                history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
                await DeckPage.deck_page(deckId, isClassDeck);
            })
        }
    
        const editDeckForms = document.getElementsByClassName('form-edit-deck');
        for (let i = 0; i < editDeckForms.length; i++) {
            editDeckForms[i].addEventListener('submit', async e => {
                //prevents refresh on submit of form
    
                e.preventDefault();
                if (e.target.classdocId.value == "false") { //if not a class deck
                    await EditDeck.edit_deck(Auth.currentUser.uid, e.target.docId.value);
                } else {//else is a class deck
                    await EditDeck.edit_class_deck(e.target.classdocId.value, e.target.docId.value);
                }
    
                await study_decks_page();
            });
        }
        const deleteDeckForms = document.getElementsByClassName('form-delete-deck');
        for (let i = 0; i < deleteDeckForms.length; i++) {
            deleteDeckForms[i].addEventListener('submit', async e => {
                e.preventDefault();
                const button = e.target.getElementsByTagName('button')[0];
                const label = Utilities.disableButton(button);
                let deckId = e.target.docId.value;
                let classDocID = e.target.classdocId.value;
                Elements.modalDeleteDeckConfirmation.show();
                const button2 = document.getElementById('modal-confirmation-delete-deck-yes');
                button2.addEventListener("click", async e => {
                    if (classDocID == "false") {
                        confirmation = true;
                        await EditDeck.delete_deck(deckId, confirmation);
                    } else {
                        confirmation = true;
                        await EditDeck.delete_class_deck(deckId, confirmation, classDocID);
                    }
                });
                Utilities.enableButton(button, label);
            });
        }
        const favoritedCheckboxes = document.getElementsByClassName("favorite-checkbox");
        for (let i = 0; i < favoritedCheckboxes.length; ++i) {
            favoritedCheckboxes[i].addEventListener('change', async e => {
                const docId = e.target.value;
                console.log(docId);
                const favorited = deckList.find(deck => docId == deck.docId).isFavorited ? false : true;
                await FirebaseController.favoriteDeck(Auth.currentUser.uid, docId, favorited);
                await study_decks_page();
            });
        }
    
    
        const sortDeckSelect = document.getElementById("sort-decks");
        sortDeckSelect.addEventListener('change', async e => {
            e.preventDefault();
            // get the value from the sort deck list select item, the value === deckDocID
            var opt = e.target.options[e.target.selectedIndex].value;
            // grab the div wrapped around the deck cards
            var deckContainer = document.getElementById('deck-container');
            // grab the cards contained in the deck
            var decks = deckContainer.getElementsByClassName('deck-card');
            // store the decks inside of an array for sorting
            var list = [];
            for (let i = 0; i < decks.length; ++i) {
                list.push(decks.item(i));
            }
            /* Brief explanation of sorting in JS:
                By default, sort() sorts values as strings. As such, it doesn't work correctly when
                attempting to sort numbers. Hence, you can create a compare function to sort numbers corrently
                If the function returns a negative result, a is sorted before b. If the function returns a
                positive result, b is sorted before a. If the result is zero, no changes are done as the values
                are in the correct order.
                Since it isn't just sorting those items but actually variables of those items, we're using a compare
                function for each item in the list to sort it properly. Each compare function works in a similar manner
                but is using different variables
            */
            // First, we check what the value of the selected item from the sort deck list is
            if (opt == "name") {
                // next, we call the sort() function on the list and utilize a lambda function
                list.sort(function (a, b) {
                    // This gets the 'id' attribute from the card
                    var aId = a.getAttribute('id');
                    var bId = b.getAttribute('id');
                    // this will find the corresponding deck by the docId and then convert it to lowercase
                    // Note: .toLowerCase() does not transform the string itself, but creates a new string
                    var firstName = deckList.find(deck => deck.docId == aId).name.toLowerCase();
                    var secondName = deckList.find(deck => deck.docId == bId).name.toLowerCase();
                    /* Utilizing a nested ternary operator:
                        1. Check if a is less than b. If true, return -1 as explained above
                        2. If false, check if a is greater than b. If true, return 1 as explained above
                        3. If false, then the function returns 0 as the values are already in their proper place
                    */
                    return (firstName < secondName) ? -1 :
                        (firstName > secondName) ? 1 : 0;
                });
                // Each function will operate in a similar manner
            } else if (opt == "subject") {
                list.sort(function (a, b) {
                    var aId = a.getAttribute('id');
                    var bId = b.getAttribute('id');
                    var firstSubject = deckList.find(deck => deck.docId == aId).subject.toLowerCase();
                    var secondSubject = deckList.find(deck => deck.docId == bId).subject.toLowerCase();
                    return (firstSubject < secondSubject) ? -1 :
                        (firstSubject > secondSubject) ? 1 : 0;
                });
            } else if (opt == "date") {
                list.sort(function (a, b) {
                    /* DO NOT TOUCH THIS ONE 
                        A different method could probably be worked out for sorting by name and subject,
                        but dateCreated can ONLY be sorted using a compare function
                    */
                    var aId = a.getAttribute('id');
                    var bId = b.getAttribute('id');
                    var firstDate = deckList.find(deck => deck.docId == aId).dateCreated;
                    var secondDate = deckList.find(deck => deck.docId == bId).dateCreated;
                    // third date ( ͡° ͜ʖ ͡°)
                    return (firstDate < secondDate) ? -1 :
                        (firstDate > secondDate) ? 1 : 0;
                });
            } else if (opt == "category") {
                list.sort(function (a, b) {
                    var aId = a.getAttribute('id');
                    var bId = b.getAttribute('id');
                    var firstCategory = deckList.find(deck => deck.docId == aId).category;
                    var secondCategory = deckList.find(deck => deck.docId = bId).category;
                    return (firstCategory.category < secondCategory.category) ? -1 :
                        (firstCategory.category > secondCategory.category) ? 1 : 0;
                });
            }
            // Finally, append the decks to the div wrapped around them, replacing the original order with the new order
            for (let i = 0; i < list.length; ++i) {
                deckContainer.appendChild(list[i]);
            }
            // If you've made it this far, then thank you for for following along
        })
    
        const createDeckButton = document.getElementById(Constant.htmlIDs.createDeck);
    
        // restructured create deck button to add category dropdown menu
        createDeckButton.addEventListener('click', async e => {
    
            // const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];
    
            // call Firebase func. to retrieve categories list
            let categories;
            try {
                categories = await FirebaseController.getCategories();
                //console.log(cat);
            } catch (e) {
                if (Constant.DEV)
                    console.log(e);
            }
    
            // clear innerHTML to prevent duplicates
            Elements.formDeckCategorySelect.innerHTML = '';
    
            categories.forEach(category => {
                Elements.formDeckCategorySelect.innerHTML += `
                          <option value="${category}">${category}</option>
                      `;
            });
    
            Elements.formClassSelect.innerHTML = '';
            //logic for if the dropdown box selection on create deck is NONE or is a CLASSROOM
            Elements.formClassSelect.innerHTML += `
                        <option value="${noClassDeckSelected}">None</option>
                      `;
            myClassroomList.forEach(myclass => {
                console.log(myclass.docID);
                Elements.formClassSelect.innerHTML += `
                          <option value="${myclass.docID}">${myclass.name}</option>
                      `;
    
            });
    
    
    
    
            // opens create Deck modal
            $(`#${Constant.htmlIDs.createDeckModal}`).modal('show');
        })
    
        const searchDeckButton = document.getElementById('search-decks-button');
        searchDeckButton.addEventListener('click', async e => {
            const searchtype = 'deckSearch';
            Search.setSearchType(searchtype);
            Utilities.searchBox('Search Decks', 'input query');
        })
     
    
    const chooseCategory = document.getElementById('button-leaderboard-select-modal');
    chooseCategory.addEventListener('click', async e =>{
        e.preventDefault();
        const selectOption = document.getElementById('select-option');
        console.log('click');
        $(`#modal-leaderboard-select`).modal('show');
        Elements.formLeaderboardCategorySelect.addeventListener('submit', async e=>{
            e.preventDefault();
            const selection = e.target.option.value;
            console.log(`Selection submitted: ${selection}`);
            //await FirebaseController.
        });
    })
    // get CLASSROOM tab and show it as visible
    const classroomGenButton = document.getElementById('classroom-gen-button');
    classroomGenButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Classroom').style.display = "block";

        document.getElementById('classroom-gen-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-gen-button').style.color = '#A7ADC6';

        document.getElementById('classroom-chat-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-chat-button').style.color = '#2C1320';

        document.getElementById('classroom-members-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.color = '#2C1320';

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-leaderboard-button').style.color = '#2C1320';

    })

    // get MEMBERS tab and show it as visible
    const classroomMembersButton = document.getElementById('classroom-members-button');
    classroomMembersButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Members').style.display = "block";

        document.getElementById('classroom-members-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-members-button').style.color = '#A7ADC6';

        document.getElementById('classroom-gen-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.color = '#2C1320';

        document.getElementById('classroom-chat-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-chat-button').style.color = '#2C1320';

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-leaderboard-button').style.color = '#2C1320';
    })

    // get LEADERBOARD tab and show it as visible
    const classroomLeaderboardButton = document.getElementById('classroom-leaderboard-button');
    classroomLeaderboardButton.addEventListener('click', e => {
        // clear all tabs contents
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Leaderboard').style.display = "block";

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-leaderboard-button').style.color = '#A7ADC6';

        document.getElementById('classroom-gen-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.color = '#2C1320';

        document.getElementById('classroom-chat-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-chat-button').style.color = '#2C1320';

        document.getElementById('classroom-members-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.color = '#2C1320';
    })

    // get CHAT tab and show it as visible 
    const classroomChatButton = document.getElementById('classroom-chat-button');
    classroomChatButton.addEventListener('click', e => {
        // clear all tabs contents
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Chat').style.display = "block";

        document.getElementById('classroom-chat-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-chat-button').style.color = '#A7ADC6';

        document.getElementById('classroom-gen-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.color = '#2C1320';

        document.getElementById('classroom-members-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.color = '#2C1320';

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-leaderboard-button').style.color = '#2C1320';
    })

    // submitting a message
    const messageSubmitButton = document.getElementById("classroom-message-button");
    messageSubmitButton.addEventListener('click', async e => {
        e.preventDefault();
        const messageElement = document.getElementById('add-new-message');
        const content = messageElement.value;
        const sender = Auth.currentUser.email;
        const timestamp = Date.now();
        const message = new Message({
            sender, content, timestamp,
        })
        const docID = await FirebaseController.addNewMessage(classroomDocID, message);
        message.docId = docID;
        const messageTag = document.createElement('div');
        messageTag.innerHTML = buildMessageView(message);
        const tempEl = document.getElementById('temp');
        // delete temp if it's there
        if (tempEl) {
            tempEl.remove();
        }
        document.getElementById('message-reply-body').appendChild(messageTag);
        document.getElementById('add-new-message').value = '';
    });

    // sets CLASSROOM as default
    classroomGenButton.click();


    if (mod == true) { //if owner of classroom, add listener. This avoids null Button errors.
        const deleteButton = document.getElementById('button-delete-classroom'); //delete button on page

        deleteButton.addEventListener('click', async e => {
            Elements.modalDeleteClassroom.show();
        })

        const confirmDeleteClassroom = document.getElementById('yes-delete-classroom-button'); //delete button on modal
        confirmDeleteClassroom.addEventListener("click", async e => {
            e.preventDefault();
            await classrooms_page();
            const deletedClassName = classroom.name;
            
            await FirebaseController.deleteClassroom(classroomDocID);
            Utilities.info('Success', `Classroom: ${deletedClassName} deleted.`);
            await classrooms_page();

            
        })
    } //end of mod listeners



    const banButtons = document.getElementsByClassName('form-ban-members');
    //this will add ban functionality to each member button
    for (let i = 0; i < banButtons.length; ++i) {
        banButtons[i].addEventListener("submit", async e => {
            e.preventDefault();
            await FirebaseController.banMember(classroomDocID, e.target.membername.value);
            await one_classroom_page(classroomDocID);
        })
    }

    //this will add unban functionality to each member button
    const unbanButtons = document.getElementsByClassName('form-unban-members');
    for (let i = 0; i < unbanButtons.length; i++) {
        unbanButtons[i].addEventListener("submit", async e => {
            e.preventDefault();
            await FirebaseController.unbanMember(classroomDocID, e.target.membername.value);
            await one_classroom_page(classroomDocID);
        })
    }
}




function buildMessageView(message) {
    return `
    <div class="border" style="border-color: #2C1320">
        <div style="background-color: #2C1320; color: #A7ADC6;">
            Posted by ${message.sender} at ${new Date(message.timestamp).toString()}
        </div>
        ${message.content};
    </div>
    <hr>`;
}

function buildButtons(member, banlist) {
    let onlist = false;
    for (let i = 0; i < banlist.length; i++) {
        if (banlist[i] == member) {
            onlist = true;
        }
    }
    if (onlist == false) { //If user is not banned
        //span is used to change text values on hover using css. See here https://stackoverflow.com/questions/9913293/change-text-on-hover-then-return-to-the-previous-text
        return `
                <form class="form-ban-members" method="post">
                <input type="hidden" name="membername" value="${member}">
                <button id="ban-btn" type="submit" class="btn ban-btn-expand-width pomo-bg-color-dark pomo-text-color-light edit-btn-hover ban-btn-hover btn-sm"><span class="membas">${member}
                </span>
                <span class="byebye">BAN</span>
                </button>
                </form>
                <br>
                `;
    }
    else { //else user is on ban list
        return `
                <form class="form-unban-members" method="post">
                <input type="hidden" name="membername" value="${member}">
                <button id="ban-btn" type="submit" class="btn ban-btn-expand-width pomo-bg-color-dark pomo-text-color-light edit-btn-hover-blue ban-btn-hover btn-sm"><span class="membas">${member}
                </span>
                <span class="byebye">UNBAN</span>
                </button>
                </form>
                <br>
                `;
    }

}

function buildLeaderBoard(e,i){
   return `
    <tr>
        <td class="leaderboard-td">${i}</td>
        <td class="leaderboard-td">${e.email}</td>
        <td class="leaderboard-td">${e.coins}</td>
        <td class="leaderboard-td">${e.deckNumber}</td>
    </tr>`;
}

function buildDeckView(deck){
    window.sessionStorage;
    let html = `
    <div id="${deck.docId}" class="deck-card">
        <div class="deck-view-css">
        <div class="card-body">
            <h5 class="card-text">${deck.name}</h5>
            <h6 class="card-text" >Subject: ${deck.subject}</h6>
            <h6 class="card-text">Category: ${deck.category}</h6>
            <h7 class="card-text"># of flashcards: ${deck.flashcardNumber}</h7>
            <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
        </div>
        <div class="btn-group">
        <form class="form-view-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
        </form>
        <form class="form-edit-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">edit</i>Edit</button>
        </form>
        <form class="form-delete-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">delete</i>Delete</button>
        </form>
        </div>`;

    // ternary operator to check if a deck is favorited or not
    html += deck.isFavorited ? `<div class="form-check">
        <span class="favorite-deck">
        <input class="favorite-checkbox form-check-input" type="checkbox" value="${deck.docId}" id="favorited" checked>
        </span>

        <label class= "form-check-label pomo-text-color-light" for="favorited"><i class="material-icons pomo-text-color-light">favorite</i>Favorite deck</label>
        </div>
        </div>
        </div>
        ` : `<div class="form-check">
        <span class="unfavorite-deck">
        <input class="favorite-checkbox form-check-input" type="checkbox" value="${deck.docId}" id="favorited">
        </span>
        <label class="form-check-label pomo-text-color-light" for="favorited"><i class="material-icons pomo-text-color-light">favorite_border</i>Favorite deck</label>
        </div>
        </div>
        </div>`;
    return html;
}
