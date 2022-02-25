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
    <select name="sort-classrooms" id="sort-classrooms" style="width: 200px">
        <option selected disabled>Sort classrooms by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="category">Category</option>
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

    html += ` <table id="available-classrooms-table" class="table sortable">
        <thread>
         <tr>
            <th scope="col">View</th>
            <th scope="col">Classroom</th>
            <th scope="col">Subject</th>
            <th scope="col">Category</th>
        </tr>
        </thread>
    <tbody>
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

    html += `<table id="my-classrooms-table" class="table sortable">
         <thread>
          <tr>
             <th scope="col">View</th>
             <th scope="col">Classroom</th>
             <th scope="col">Subject</th>
             <th scope="col">Category</th>
         </tr>
         </thread>
    <tbody>
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
    });

    const sortClassSelect = document.getElementById("sort-classrooms");
    sortClassSelect.addEventListener('change', async e => {
        e.preventDefault();
        // get value from select menu and check if available classroom tab is hiddne
        var opt = e.target.options[e.target.selectedIndex].value;
        var swap, rows, shouldSwap;
        var checkHidden = document.getElementById("Available Classrooms");
        // for later use
        var i;
        if (checkHidden.style.display === "none") {
            // sorting my classrooms
            // first grab the table
            var table = document.getElementById("my-classrooms-table");
            // set swap to true
            swap = true;
            if (opt == "name") {
                // create a while loop to iterate through the table rows
                while (swap) {
                    // base of saying we're done swapping
                    swap = false;
                    rows = table.rows;
                    // iterate through rows, first row is headers so we ignore that
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwap = false;
                        // getting classroom.docId from first row
                        var a = rows[i].getElementsByTagName("td")[1];
                        // getting classroom.docId from second row
                        var b = rows[i + 1].getElementsByTagName("td")[1];
                        // check if they should switch, if yes then break the loop
                        if (a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase()) {
                            shouldSwap = true;
                            break;
                        }
                    }
                    if (shouldSwap) {
                        // swap the rows
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        swap = true;
                    }
                }
            } else if (opt == "subject") {
                while (swap) {
                    // base of saying we're done swapping
                    swap = false;
                    rows = table.rows;
                    // iterate through rows, first row is headers so we ignore that
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwap = false;
                        // getting classroom.docId from first row
                        var a = rows[i].getElementsByTagName("td")[2];
                        // getting classroom.docId from second row
                        var b = rows[i + 1].getElementsByTagName("td")[2];
                        // check if they should switch, if yes then break the loop
                        if (a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase()) {
                            shouldSwap = true;
                            break;
                        }
                    }
                    if (shouldSwap) {
                        // swap the rows
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        swap = true;
                    }
                }
            } else if (opt == "category") {
                while (swap) {
                    // base of saying we're done swapping
                    swap = false;
                    rows = table.rows;
                    // iterate through rows, first row is headers so we ignore that
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwap = false;
                        // getting classroom.docId from first row
                        var a = rows[i].getElementsByTagName("td")[3];
                        // getting classroom.docId from second row
                        var b = rows[i + 1].getElementsByTagName("td")[3];
                        // check if they should switch, if yes then break the loop
                        if (a.innerHTML > b.innerHTML) {
                            shouldSwap = true;
                            break;
                        }
                    }
                    if (shouldSwap) {
                        // swap the rows
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        swap = true;
                    }
                }
            }
        } else {
            // sorting available classrooms
            // first grab the table
            var table = document.getElementById("available-classrooms-table");
            // set swap to true
            swap = true;
            if (opt == "name") {
                // create a while loop to iterate through the table rows
                while (swap) {
                    // base of saying we're done swapping
                    swap = false;
                    rows = table.rows;
                    // iterate through rows, first row is headers so we ignore that
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwap = false;
                        // getting classroom.docId from first row
                        var a = rows[i].getElementsByTagName("td")[1];
                        // getting classroom.docId from second row
                        var b = rows[i + 1].getElementsByTagName("td")[1];
                        // check if they should switch, if yes then break the loop
                        if (a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase()) {
                            shouldSwap = true;
                            break;
                        }
                    }
                    if (shouldSwap) {
                        // swap the rows
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        swap = true;
                    }
                }
            } else if (opt == "subject") {
                while (swap) {
                    // base of saying we're done swapping
                    swap = false;
                    rows = table.rows;
                    // iterate through rows, first row is headers so we ignore that
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwap = false;
                        // getting classroom.docId from first row
                        var a = rows[i].getElementsByTagName("td")[2];
                        // getting classroom.docId from second row
                        var b = rows[i + 1].getElementsByTagName("td")[2];
                        // check if they should switch, if yes then break the loop
                        if (a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase()) {
                            shouldSwap = true;
                            break;
                        }
                    }
                    if (shouldSwap) {
                        // swap the rows
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        swap = true;
                    }
                }
            } else if (opt == "category") {
                while (swap) {
                    // base of saying we're done swapping
                    swap = false;
                    rows = table.rows;
                    // iterate through rows, first row is headers so we ignore that
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwap = false;
                        // getting classroom.docId from first row
                        var a = rows[i].getElementsByTagName("td")[3];
                        // getting classroom.docId from second row
                        var b = rows[i + 1].getElementsByTagName("td")[3];
                        // check if they should switch, if yes then break the loop
                        if (a.innerHTML > b.innerHTML) {
                            shouldSwap = true;
                            break;
                        }
                    }
                    if (shouldSwap) {
                        // swap the rows
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        swap = true;
                    }
                }
            }
        }
    });
}

function buildClassroom(classroom) {
    return `
    <td value="${classroom.docId}">
    <form class="form-view-classroom" method="post">
            <input type="hidden" name="docId" value="${classroom.docId}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;">View</button>
        </form></td>
    <td>${classroom.name}</td>
    <td>${classroom.subject}</td>
    <td>${classroom.category}</td>
    `;
}