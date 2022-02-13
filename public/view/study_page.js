import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'

export function addEventListeners() {
    /*Elements.btnStudyDeck.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.STUDY);
        await study_page();
    });*/
}

export async function study_page() {
    Elements.root.innerHTML = `Studyyy`;

  
}