import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'
import * as Auth from '../controller/firebase_auth.js'

export function addEventListeners() {
    Elements.menuClassrooms.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.CLASSROOMS);
        await classrooms_page();
    });
}

export async function classrooms_page() {
    Elements.root.innerHTML = '';

    let html = `<div class="tab"><button id="my-classroom-button" class="classroom-tab">My Classrooms</button>
    <button id="available-classroom-button" class="classroom-tab">Available Classrooms</button>`

    // sort select menu
    html += `
    <div style="float:right">
    <label for="sort-decks">Order by:</label>
    <select name="sort-decks" id="sort-decks" style="width: 200px">
        <option selected>Sort classrooms by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="date">Category</option>
    </select>
    </div>
    </div>`

    // placeholder for classrooms until they're done so you get to see how cool they look
    html += `<div id="Available Classrooms" class="classroom-tab-content">
    <table class="table">
         <thread>
          <tr>
             <th scope="col">View</th>
             <th scope="col">Classroom</th>
             <th scope="col">Subject</th>
             <th scope="col">Category</th>
         </tr>
         </thread>
     <tbody id="available-classroom-table-body">
     <tr>
        <td><button id="available-classroom-view">View</button></td>
        <td>Classname</td>
        <td>Subject</td>
        <td>Category</td>
     </tr>
     </tbody></table></div>
     `

    html += `<div id="My Classrooms" class="classroom-tab-content">
    <table class="table">
         <thread>
          <tr>
             <th scope="col">View</th>
             <th scope="col">Classroom</th>
             <th scope="col">Subject</th>
             <th scope="col">Category</th>
         </tr>
         </thread>
     <tbody id="my-classroom-table-body">
     <tr>
        <td><button id="my-classroom-view">View</button></td>
        <td>Classname</td>
        <td>Subject</td>
        <td>Category</td>
     </tr>
     </tbody></table></div>
     `

    // once we have classrooms built in firebase and as a model, this'll probably work :)
    // html += `<div id="Available Classrooms" class="classroom-tab-content">
    // <table class="table">
    //     <thread>
    //      <tr>
    //         <th scope="col">View</th>
    //         <th scope="col">Classroom</th>
    //         <th scope="col">Subject</th>
    //         <th scope="col">Category</th>
    //     </tr>
    //     </thread>
    // <tbody id="available-classroom-table-body">
    // `

    // let availableClassroomList = [];
    // try {
    //     availableClassroomList = await FirebaseController.getAvailableClassrooms();
    // } catch (e) {
    //     Utilities.info('Error getting available classrooms', JSON.stringify(e));
    //     console.log(e);
    // }

    // availableClassroomList.forEach(c => {
    //     html += `
    //     <tr>${buildClassroom(c)}</tr>`
    // })

    // if (availableClassroomList.length == 0) {
    //     html += '<p>No classrooms found!</p>'
    // }
    // html += `</tbody></table></div>`

    // html += `<div id="My Classrooms" class="classroom-tab-content">
    // <table class="table">
    //     <thread>
    //      <tr>
    //         <th scope="col">View</th>
    //         <th scope="col">Classroom</th>
    //         <th scope="col">Subject</th>
    //         <th scope="col">Category</th>
    //     </tr>
    //     </thread>
    // <tbody id="available-classroom-table-body">
    // `

    // let myClassroomList = [];
    // try {
    //     myClassroomList = await FirebaseController.getMyClassrooms(Auth.currentUser.uid);
    // } catch (e) {
    //     Utilities.info('Error getting your classrooms', JSON.stringify(e));
    //     console.log(e);
    // }

    // myClassroomList.forEach(c => {
    //     html += `
    //     <tr>${buildClassroom(c)}</tr>`
    // })

    // if (myClassroomList.length == 0) {
    //     html += '<p>No classrooms found!</p>'
    // }
    // html += `</tbody></table></div>`

    Elements.root.innerHTML += html;

    const availableClassroomViewButton = document.getElementById('available-classroom-view');
    availableClassroomViewButton.addEventListener('click', e => {
        Utilities.info("", 'why');
    })

    const myClassroomViewButton = document.getElementById('my-classroom-view');
    myClassroomViewButton.addEventListener('click', e => {
        Utilities.info("", 'pls');
    })


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
    myClassroomButton.click();

}

function buildClassroom(classroom) {
    // TODO
}