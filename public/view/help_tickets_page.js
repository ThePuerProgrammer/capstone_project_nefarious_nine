import * as Elements from './elements.js';
import * as Routes from '../controller/routes.js';
import * as Constant from '../model/constant.js';
import * as Auth from '../controller/firebase_auth.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Utilities from './utilities.js';
import { HelpTicket } from '../model/help_ticket.js';
import * as OneHelpTicket from './one_help_ticket_page.js';
import * as Coins from '../controller/coins.js'

let imageFile2UploadHelpTicket;

export function addEventListeners() {
    Elements.menuHelpTickets.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.HELPTICKETSPAGE);
        await help_tickets_page();
    })

    Elements.formSubmitHelpTicket.form.addEventListener('submit', async e => {
        e.preventDefault();
        await createNewHelpTicket(e.target);
        await help_tickets_page();
    })

    Elements.formSubmitHelpTicket.imageButton.addEventListener('change', e => {
        imageFile2UploadHelpTicket = e.target.files[0];
        if (!imageFile2UploadHelpTicket) {
            Elements.formSubmitHelpTicket.imageTag.src = null;
            return;
        }
        const reader = new FileReader();
        reader.onload = () => Elements.formSubmitHelpTicket.imageTag.src = reader.result;
        reader.readAsDataURL(imageFile2UploadHelpTicket);
    })

}

export async function help_tickets_page() {
    Elements.root.innerHTML = "";
    let html = "";
    let helpTickets = [];
    // if else anweisung um festzustellen, ob der benutzer ist admin oder nicht
    if (Auth.currentUser.email == Constant.ADMIN) {
        html += '<h1>Help tickets</h1>';
        try {
            helpTickets = await FirebaseController.getHelpTickets();
        } catch (e) {
            console.log(e);
            Utilities.info('Failed to get help tickets', JSON.stringify(e));
        }

        if (helpTickets.length === 0) {
            html += '<p id="temp-help">No help tickets have been submitted</p>';
        } else {
            html += `<div style="overflow-x: auto;"><table id="help-tickets-table" class="table">
                <thread>
                    <tr>
                        <th scope="col">View</th>
                        
                        <th scope="col">Ticket</th>
                        <th scope="col">Submitted By</th>
                        <th scope="col">Category</th>
                        <th scope="col">Feedback</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                    </tr>
                </thread>
                <tbody>`;

            helpTickets.forEach(helpticket => {
                html += `<tr>${buildHelpTicket(helpticket)}</tr>`;
            })
            html += `</tbody>
            </table></div>`;
        }
    } else {
        html += '<h1>Help tickets</h1>'
        try {
            helpTickets = await FirebaseController.getUserHelpTickets(Auth.currentUser.email);
        } catch (e) {
            console.log(e);
            Utilities.info('Failed to get help tickets', JSON.stringify(e));
        }

        html += `<button id="submit-help-ticket" data-bs-toggle="modal" data-bs-target="#modal-submit-help-ticket" class="btn btn-secondary pomo-bg-color-dark"><i class="material-icons text-white">add</i>Submit help ticket</button>`

        if (helpTickets.length === 0) {
            html += '<p id="temp-help">No help tickets have been submitted</p>';
        } else {
            html += `<div style="overflow-x: auto;"><table id="help-tickets-table" class="table">
                <thread>
                    <tr>
                        <th scope="col">View</th>
                        <th scope="col">Ticket</th>
                        <th scope="col">Submitted By</th>
                        <th scope="col">Category</th>
                        <th scope="col">Feedback</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                    </tr>
                </thread>
                <tbody>`;

            helpTickets.forEach(helpticket => {
                html += `<tr>${buildHelpTicket(helpticket)}</tr>`;
            })
            html += `</tbody>
            </table></div>`;

        }
    }

    Elements.root.innerHTML += html;

    const helpTicketViewButtons = document.getElementsByClassName('form-view-help-ticket');
    for (let i = 0; i < helpTicketViewButtons.length; i++) {
        helpTicketViewButtons[i].addEventListener('submit', async e => {
            e.preventDefault();
            let helpTicketDocId = e.target.docId.value;
            history.pushState(null, null, Routes.routePathname.ONEHELPTICKET + '#' + helpTicketDocId);
            await OneHelpTicket.one_help_ticket_page(helpTicketDocId);
        })
    }


    const submitNewHelpTicket = document.getElementById('submit-help-ticket');
    if (submitNewHelpTicket) {
        submitNewHelpTicket.addEventListener('click', () => {
            Elements.formSubmitHelpTicket.form.reset();
            Elements.formSubmitHelpTicket.imageTag.src = '';
            imageFile2UploadHelpTicket = null;
            Elements.modalSubmitHelpTicket.show();
        });
    }
}

async function createNewHelpTicket(form) {
    const title = form.helpTicketTitle.value.trim();
    const description = form.helpTicketDescription.value.trim();
    var helpTicketSelect = document.getElementById('help-ticket-category');
    const category = helpTicketSelect.options[helpTicketSelect.selectedIndex].innerHTML;
    const submittedBy = Auth.currentUser.email;
    const feedback = [];
    const timestamp = Date.now();
    let imageName = '';
    let imageURL = '';
    if (Elements.formSubmitHelpTicket.imageTag.src != null) {
        try {
            ({ imageName, imageURL } = await FirebaseController.uploadHelpTicketImage(imageFile2UploadHelpTicket));
        } catch (e) {
            Utilities.info('Failed to upload images', JSON.stringify(e), 'modal-submit-help-ticket');
        }
    }


    const helpTicket = new HelpTicket({
        submittedBy,
        timestamp,
        category,
        title,
        description,
        feedback,
        status: "Open",
    })

    helpTicket.helpTicketImageName = imageName;
    helpTicket.helpTicketImageURL = imageURL;

    const helpTicketRef = await FirebaseController.submitHelpTicket(helpTicket);
    helpTicket.set_docID(helpTicketRef.id);
    Utilities.info('Help ticket submitted', `${helpTicket.title} created`, 'modal-submit-help-ticket');

}


function buildHelpTicket(helpticket) {
    return `
    <td>
        <form class="form-view-help-ticket" method="post">
            <input type="hidden" name="docId" value="${helpticket.docID}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
        </form>
    </td>
    <td>${helpticket.title}</td>
    <td>${helpticket.submittedBy}</td>
    <td>${helpticket.category}</td>
    <td>${helpticket.feedback.length}</td>
    <td>${new Date(helpticket.timestamp).toString()}</td>
    <td>${helpticket.status}</td>
    `;
}