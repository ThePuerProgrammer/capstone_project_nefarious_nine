import * as Elements from './elements.js'

export function addEventListeners() {
    Elements.menuHome.addEventListener('click', async() => {
        await home_page();
    });
}

export async function home_page() {
    Elements.root.innerHTML =
        `<button type="button" class="btn btn-primary btn-lg">Large button</button>`;
}