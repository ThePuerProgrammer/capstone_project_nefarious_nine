import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js';

import * as Elements from '../view/elements.js'
import * as Utilities from '../view/utilities.js'
import * as Constants from '../model/constant.js'
import * as CreatePage from '../view/create_account_page.js'

const auth = getAuth();

export let currentUser = null;


export function addEventListeners() {

    Elements.formSignIn.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            Elements.modalSignIn.hide();
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            Utilities.info('Sign in Error', JSON.stringify(error), Elements.modalSignIn);
            if (Constants.DEV)
                console.log(`error:  ${errorCode} | ${errorMessage}`);
        }
    });

    Elements.formCreateAccount.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const passwordConfirm = e.target.passwordConfirm.value;

        if (password !== passwordConfirm) {
            alert('password and its confirm are not a match.');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            e.target.reset();
            Utilities.info('Account created', `You're signed in as ${email}`, Elements.modalCreateAccount); //last param dismisses previous modal 
        } catch (e) {
            if (Constants.DEV) console.log(e);
            Utilities.info('Failed to create account', JSON.stringify(e), Elements.modalCreateAccount);
        }
    })

    Elements.menuSignOut.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('Sign out success');
        } catch (e) {
            Utilities.info('Sign Out Error', JSON.stringify(e));
            if (Constants.DEV)
            console.log('Sign out error' + e);
        }
    });

    onAuthStateChanged(auth, authStateChangeObserver);

}

function authStateChangeObserver(user) {
    if (user) {
        currentUser = user;
        // for signing in
        let elements = document.getElementsByClassName('modal-preauth'); 
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none'; //buttons hidden before state change
        }
        elements = document.getElementsByClassName('modal-postauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'block'; //buttons appear after state change
        }
    } else {
        currentUser = null;
        // for signing out
        let elements = document.getElementsByClassName('modal-preauth'); 
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'block'; //showing before state change
        }
        elements = document.getElementsByClassName('modal-postauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none'; //buttons hidden after state change
        }

        Elements.root.innerHTML = CreatePage.html;
    }
}

