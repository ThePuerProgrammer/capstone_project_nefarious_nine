import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import { Classroom } from '../model/classroom.js'

let classroomDocID;

export function addClassroomViewButtonListeners() {
    const viewButtons = document.getElementsByClassName('form-view-classroom');
    for (let i = 0; i < viewButtons.length; ++i) {
        addClassroomViewFormSubmitEvent(viewButtons[i]);
    }
}

export function addClassroomViewFormSubmitEvent(form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();
        classroomDocID = e.target.docId.value;
        history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' + classroomDocID);
        await one_classroom_page(classroomDocID);
    })
}

export async function one_classroom_page(classroomDocID) {
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
    for (let k = 0; k < classroom.members.length; k++) {
        members.push(classroom.members[k]);
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
        </div>`;
    // could possibly add a new tab for classroom chat?


    // CLASSROOM tab contents
    html += `<div id="Classroom" class="one-classroom-tab-content">
        <h1>${classroom.name}</h1>
        <h4>${classroom.subject}, ${classroom.category}</h4>
        <br>`;
    
    //if current user is a mod, populate the edit classroom button
    //causes null edit button error
    if (mod == true) {
        //removed doc id from page view -- Blake
        html += `<button id="button-edit-class" type="click" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"
            >Edit Classroom</button>`;
    }

    html += `</div>`;

    // MEMBERS tab contents
    html+= `<div id="Members" class="one-classroom-tab-content">
        <div class="row">
        <div class="column">
        <h2>Members</h2>`;

    // If mod, show members w BAN option
    if (mod == true) {
        members.forEach(member => {
            html += `<tr>${buildButtons(member, classroom.banlist)}</tr>`;
        })
    } else {
        members.forEach(member => {
            html += `<p>${member}</p>`;
        })
    }

    html += `</div>
        <div class="column">
        <h2>Mods</h2>`;

        // display mods list
        let mods = classroom.moderatorList
        mods.forEach(mod => {
            html += `<p>${mod}</p>`;
        })

        html += `</div>
        </div>
        </div>`; 

    // future LEADERBOARD tab content
    html += `<div id="Leaderboard" class="one-classroom-tab-content">
        <h2>Leaderboard</h2>
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
        e.target.style.backgroundColor = `#A7ADC6`;
        e.target.style.color = `#2C1320`;
        e.target.style.borderBottom = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-gen-button').style.color = '#A7ADC6';
         
    })

    // get MEMBERS tab and show it as visible
    const classroomMembersButton = document.getElementById('classroom-members-button');
    classroomMembersButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Members').style.display = "block";
        e.target.style.backgroundColor = `#A7ADC6`;
        e.target.style.color = `#2C1320`;
        e.target.style.borderBottom = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-members-button').style.color = '#A7ADC6';
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
         e.target.style.backgroundColor = `#A7ADC6`;
         e.target.style.color = `#2C1320`;
         e.target.style.borderBottom = `#A7ADC6`;
         document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#2C1320`;
         document.getElementById('classroom-leaderboard-button').style.color = '#A7ADC6';
     })

    // sets CLASSROOM as default
    classroomGenButton.click();

    //following Pipers create classroom functionality
    if (mod == true) { //if owner of classroom, add listener. This avoids null editButton errors.
        const editButton = document.getElementById('button-edit-class');
        editButton.addEventListener('click', async e => {

            const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

            Elements.formEditClassCategorySelect.innerHTML = '';
            categories.forEach(category => {
                Elements.formEditClassCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>
                  `;
            });
            Elements.modalEditClassroom.show();
        })
    }

    Elements.formEditClassroom.addEventListener('submit', async e => {
        e.preventDefault();

        const cr = new Classroom({
            name: e.target.name.value,
            subject: e.target.subject.value,
            category: e.target.editClassCategory.value,
        });
        cr.set_docID(classroomDocID);

        await FirebaseController.updateClassroom(cr);
        Elements.modalEditClassroom.hide();
        Elements.root.innerHTML += ''; //Prevents old html from stacking/duplicate class on page
        await one_classroom_page(classroomDocID);

    })
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

