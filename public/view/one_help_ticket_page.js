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

    let helpTicket;
    try {
        helpTicket = await FirebaseController.getOneHelpTicket(helpTicketDocId);
    } catch (e) {
        console.log(e);
        Utilities.info('Failed to get help ticket', JSON.stringify(e));
    }

    html += `<button id="button-close-ticket" type="click" class="btn btn-danger pomo-bg-color-md pomo-text-color-dark pomo-font-weight-bold">
    <i class="material-icons">delete</i>Close ticket</button>`

    if (helpTicket.status == 'Closed' && !adminPage) {
        html += `<button id="button-reopen-ticket" type="click" class="btn btn-danger pomo-bg-color-md pomo-text-color-dark pomo-font-weight-bold">
        <i class="material-icons">add</i>Reopen ticket</button>`
    }

    if (adminPage) {
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
    } else {
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
    }
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

    const reopenTicketButton = document.getElementById('button-reopen-ticket');
    if (reopenTicketButton) {
        reopenTicketButton.addEventListener('click', async e => {
            if (!window.confirm('Press ok to reopen your ticket')) return;
            await FirebaseController.updateHelpTicket(helpTicketDocId, { status: 'Open' });
            await HelpTicketPage.help_tickets_page();
        })
    }
}