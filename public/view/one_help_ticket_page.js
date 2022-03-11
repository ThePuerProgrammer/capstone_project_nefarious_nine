import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import * as HelpTicketPage from './help_tickets_page.js'

export async function one_help_ticket_page(helpTicketDocId) {
    const adminPage = Auth.currentUser.email == Constant.ADMIN;
    Elements.root.innerHTML = '';
    let html = '';

    // getting one help ticket
    let helpTicket;
    try {
        helpTicket = await FirebaseController.getOneHelpTicket(helpTicketDocId);
    } catch (e) {
        console.log(e);
        Utilities.info('Failed to get help ticket', JSON.stringify(e));
    }

    // buttons fur close und open tickets
    html += `<button id="button-close-ticket" type="click" class="btn btn-danger pomo-bg-color-md pomo-text-color-dark pomo-font-weight-bold">
    <i class="material-icons">delete</i>Close ticket</button>`

    if (helpTicket.status == 'Closed' && !adminPage) {
        html += `<button id="button-reopen-ticket" type="click" class="btn btn-danger pomo-bg-color-md pomo-text-color-dark pomo-font-weight-bold">
        <i class="material-icons">add</i>Reopen ticket</button>`
    }
    // styling for help ticket
    html += `
        <div class="border" style="border-color: #2C1320; width: 40%; margin: auto; text-align: center;">
            <div style="background-color: #2C1320; color: #A7ADC6;">
                <h4>${helpTicket.title}</h4>
                Description: ${helpTicket.description}
                <p>Category: ${helpTicket.category}</p>
                <p>Date: ${new Date(helpTicket.timestamp).toString()}</p>`
    if (helpTicket.helpTicketImageName != '') {
        html += `<img src="${helpTicket.helpTicketImageURL}" style="width: 100px; height: auto;"}`
    }
    html += `</div></div>`

    // feedback on help ticket
    html += `<div id="feedback-area" style="width: 40%; margin: auto;">`

    let feedback = [];
    if (helpTicket.feedback.length > 0) {
        for (let i = 0; i < helpTicket.feedback.length; i++) {
            feedback.push(helpTicket[i]);
            html += buildFeedbackView(feedback[i]);
        }
    }
    html += `</div>
        <div style="width: 40%; height: 15%; margin: auto;">
            <textarea id="textarea-add-new-feedback" placeholder="Type a message..." style="border: 1px solid #2C1320; width: 100%; height: 150px; background-color: #2C1320; color: #A7ADC6;"></textarea>
            <br>
            <button id="button-add-new-feedback" style="background-color: #2C1320; color: #A7ADC6;"><i class="small material-icons">send</i> Send</button>
        </div>`


    Elements.root.innerHTML += html;

    const closeTicketButton = document.getElementById('button-close-ticket');
    closeTicketButton.addEventListener('click', async e => {
        if (adminPage) {
            if (!window.confirm('Press ok to close this ticket')) return;
            await FirebaseController.updateHelpTicket(helpTicketDocId, { status: 'Closed' });
            await HelpTicketPage.help_tickets_page();
        } else {
            if (!window.confirm('Press ok to close your ticket')) return;
            await FirebaseController.closeHelpTicket(helpTicketDocId, helpTicket.helpTicketImageName);
            await HelpTicketPage.help_tickets_page();
        }
    })

    const submitFeedbackButton = document.getElementById('button-add-new-feedback');
    submitFeedbackButton.addEventListener('click', async e => {
        e.preventDefault();
        const feedbackElement = document.getElementById('textarea-add-new-feedback');
        const content = feedbackElement.value;
        const sender = Auth.currentUser.email;
        const timestamp = Date.now();
        const message = sender + ',' + content + ',' + timestamp;
        feedback.push(message);
        await FirebaseController.updateHelpTicket(helpTicketDocId, ({ feedback: feedback }));
        const feedbackTag = document.createElement('div');
        feedbackTag.innerHTML = buildFeedbackView(message);
        document.getElementById('feedback-area').appendChild(feedbackTag);
        document.getElementById('textarea-add-new-feedback').value = '';
    })

    const reopenTicketButton = document.getElementById('button-reopen-ticket');
    if (reopenTicketButton) {
        reopenTicketButton.addEventListener('click', async e => {
            if (!window.confirm('Press ok to reopen your ticket')) return;
            await FirebaseController.updateHelpTicket(helpTicketDocId, { status: 'Open' });
            await HelpTicketPage.help_tickets_page();
        })
    }
}

function buildFeedbackView(message) {
    let messageArray = message.split(',');
    return `
    <div class="border" style="border-color: #2C1320; width: 100%; margin: auto;">
        <div style="background-color: #2C1320; color: #A7ADC6;">
            Posted by ${messageArray[0]} at ${new Date(parseInt(messageArray[2])).toString()}
        </div>
        ${messageArray[1]};
    </div>
    <hr>`;
}