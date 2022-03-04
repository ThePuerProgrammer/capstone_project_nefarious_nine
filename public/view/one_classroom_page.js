import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import { Message } from '../model/message.js'
import { Classroom } from '../model/classroom.js'
import { classrooms_page } from './classrooms_page.js'


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
        <button id="classroom-gen-button" class="classroom-tab">Classroom</button>
        <button id="classroom-members-button" class="classroom-tab">Members</button>
        <button id="classroom-leaderboard-button" class="classroom-tab">Leaderboard</button>
        <button id="classroom-chat-button" class="classroom-tab">Chat</button>
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
                Delete Classroom
            </button>`
            ;
    }

    html += `</div>`;

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

    let messages = [];
    messages = await FirebaseController.getMessages(classroomDocID);

    html += `</div>
        </div>
        </div>`;

    // future LEADERBOARD tab content
    html += `<div id="Leaderboard" class="one-classroom-tab-content">
        <h2>Leaderboard</h2>
        </div>`;

    html += `<div id="Chat" class="one-classroom-tab-content">
        <div id="message-reply-body">`
    if (messages.length > 0) {
        messages.forEach(m => {
            html += buildMessageView(m);
        })
    } else {
        html += '<p id="temp">No messages have been posted yet...be the first!</p>';
    }
    html += `</div>`;

    // CHAT tab content
    html += `<div>
    <textarea id="add-new-message" placeholder="Send a message..." style="border: 1px solid #2C1320; width: 700px; height: 150px; background-color: #2C1320; color: #A7ADC6;"></textarea>
    <br>
    <button id="classroom-message-button" style="background-color: #2C1320; color: #A7ADC6;">Send</button>
    </div>
    </div>`;

    Elements.root.innerHTML = html;

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

