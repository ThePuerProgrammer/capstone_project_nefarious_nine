import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import { Classroom } from '../model/classroom.js';

export function addEventListeners() {
    Elements.menuClassrooms.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.CLASSROOMS);
        await classrooms_page();
    });

    // CREATE A CLASSROOM Submit button event listener
    Elements.formCreateClassroom.addEventListener('submit', async e => {
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;
        //const isFavorited = false;
        const category = e.target.selectClassCategory.value;

        // add current user as a moderator
        const moderatorList = [];
        moderatorList.push(Auth.currentUser.email);

        // add current user to members list
        const members = [];
        members.push(Auth.currentUser.email);


        const classroom = new Classroom({
            name,
            subject,
            //dateCreated,
            category,
            moderatorList,
            members
        });

        try {
            const docId = await FirebaseController.createClassroom(classroom);
            classroom.docId = docId;
            localStorage.setItem("classroomPageClassroomDocID", classroom.docId);
            Elements.modalCreateClassroom.hide();
            //history.pushState(null, null, Routes.routePathname.CLASSROOM + "#" + classroom.docId);
            // await DeckPage.deck_page(deck.docId);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }
        await classrooms_page();
    });

    // Clears CREATE CLASSROOM input fields when user closes modal
    $(`#create-classroom-modal`).on('hidden.bs.modal', function (e) {
        Elements.formCreateClassroom.reset();
    });
}

export async function classrooms_page() {
    Elements.root.innerHTML = '';
    let html = '';

    html += `<div class="classroom-page-tab"><button id="my-classroom-button" class="classroom-tab">My Classrooms</button>
    <button id="available-classroom-button" class="classroom-tab">Available Classrooms</button>`;

    html += `<div style="float:right">
    <label for="sort-classrooms">Order by:</label>
    <select name="sort-classrooms" id="sort-decks" style="width: 200px">
        <option selected disabled>Sort classrooms by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="date">Category</option>
    </select>
    </div>
    </div><div id="Available Classrooms" class="classroom-tab-content">`;

    let availableClassroomList = [];
    try {
        availableClassroomList = await FirebaseController.getAvailableClassrooms();
    } catch (e) {
        Utilities.info('Error getting available classrooms', JSON.stringify(e));
        console.log(e);
    }

    html += ` <table class="table">
        <thread>
         <tr>
            <th scope="col">View</th>
            <th scope="col">Classroom</th>
            <th scope="col">Subject</th>
            <th scope="col">Category</th>
        </tr>
        </thread>
    <tbody id="available-classroom-table-body">
    `;

    if (availableClassroomList.length == 0) {
        html += '<p>No classrooms found!</p>';
    }

    availableClassroomList.forEach(c => {
        html += `
                <tr>${buildClassroom(c)}</tr>`;
    })
    html += `</tbody></table></div>`;

    // My Classrooms tab with create classroom buton
    html += `<div id="My Classrooms" class="classroom-tab-content">
        <button id="${Constant.htmlIDs.createClassroom}" type="button" class="btn btn-secondary pomo-bg-color-dark">
        Create Classroom</button>`;

    let myClassroomList = [];
    try {
        myClassroomList = await FirebaseController.getMyClassrooms(Auth.currentUser.email);
    } catch (e) {
        Utilities.info('Error getting your classrooms', JSON.stringify(e));
        console.log(e);
    }

    html += `<table class="table">
         <thread>
          <tr>
             <th scope="col">View</th>
             <th scope="col">Classroom</th>
             <th scope="col">Subject</th>
             <th scope="col">Category</th>
         </tr>
         </thread>
    <tbody id="available-classroom-table-body">
     `;

    if (myClassroomList.length == 0) {
        html += '<p>No classrooms found!</p>';
    }
    myClassroomList.forEach(c => {
        html += `
                <tr>${buildClassroom(c)}</tr>`;
    })

    html += `</tbody></table></div>`;

    Elements.root.innerHTML += html;


    // get available class tab and show it as visible
    const availableClassroomButton = document.getElementById('available-classroom-button');
    availableClassroomButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Available Classrooms').style.display = "block";
        e.target.style.backgroundColor = `#A7ADC6`;
        e.target.style.color = `#2C1320`;
        e.target.style.borderBottom = `#A7ADC6`;
        document.getElementById('my-classroom-button').style.backgroundColor = `#2C1320`;
        document.getElementById('my-classroom-button').style.color = '#A7ADC6';
    })

    // get my classroom tab and show it as visible
    const myClassroomButton = document.getElementById('my-classroom-button');
    myClassroomButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('My Classrooms').style.display = "block";
        e.target.style.backgroundColor = `#A7ADC6`;
        e.target.style.color = `#2C1320`;
        e.target.style.borderBottom = `#A7ADC6`;
        document.getElementById('available-classroom-button').style.backgroundColor = `#2C1320`;
        document.getElementById('available-classroom-button').style.color = '#A7ADC6';
    })
    // sets myclassrooms as default
    myClassroomButton.click();

    const createClassroomButton = document.getElementById(Constant.htmlIDs.createClassroom);

    // create classroom open modal button listener 
    createClassroomButton.addEventListener('click', async e => {

        const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

        // add firebase func. to retrieve categories list

        // clear innerHTML to prevent duplicates
        Elements.formClassCategorySelect.innerHTML = '';

        categories.forEach(category => {
            Elements.formClassCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>
                  `;
        });

        // opens create Classroom modal
        $(`#${Constant.htmlIDs.createClassroomModal}`).modal('show');
    })
}

function buildClassroom(classroom) {
    return `
    <td><button type="submit" class="btn btn-secondary pomo-bg-color-dark" id="${classroom.docId}">View</button></td>
    <td>${classroom.name}</td>
    <td>${classroom.subject}</td>
    <td>${classroom.category}</td>
    `;
}