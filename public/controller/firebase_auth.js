import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js';
import * as FirebaseController from './firebase_controller.js';

import { User } from '../model/user.js'
import * as Elements from '../view/elements.js'
import * as Utilities from '../view/utilities.js'
import * as Constants from '../model/constant.js'
import * as HomePage from '../view/home_page.js'
import { routing, routePathname } from './routes.js';



const auth = getAuth();

export let currentUser = null;


export function addEventListeners() {

    Elements.formSignIn.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            let uid;
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
                .then( cred => {
                    // Getting UID for localStorage!
                    uid = cred.user.uid;
                });
            //grab user data
            var userdata = await FirebaseController.getUser(uid);
            localStorage.setItem("usercoins", userdata.coins);
            // Saving UID in local storage for referencing user's Firestore data
            localStorage.setItem("uid", uid); // Retrievable with localStorage.getItem("uid")
            Utilities.info('Welcome', `You're now signed in as ${email}`);
            
            Elements.modalSignIn.hide();
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            Utilities.info('Sign in Error', JSON.stringify(error), Elements.modalSignIn.id);
            if (Constants.DEV)
                console.log(`error:  ${errorCode} | ${errorMessage}`);
        }
    });

    Elements.formCreateAccount.addEventListener('submit', async e => {
        e.preventDefault();
        const emailAddress = e.target.email.value;
        const password = e.target.password.value;
        const passwordConfirm = e.target.passwordConfirm.value;

        if (password !== passwordConfirm) {
            alert('password and its confirm are not a match.');
            return;
        }

        try {
            let uid;
            const email = emailAddress;
            const decksStudying = [];
            const coins = 0;
            const deckNumber = 0;
            const flashcardNumber = 0;
            const userBio = "";
            const itemsOwned = [];

            const pomopet = {
                type: "bunny",
                name: "bunny",
                petPhotoURL: "https://firebasestorage.googleapis.com/v0/b/pomobyte.appspot.com/o/pomopets%2Fbunny.png?alt=media&token=c7f2df72-dbe3-4ca1-bdf0-6c9d85404a7f",
            }

            let nowInMs = Date.now();
            const pomopetData = {
                lastWashed: nowInMs,
                lastFed: nowInMs,
                lastPet: nowInMs,
                lastPoopPickUp: nowInMs,
            }

            const user_mail = email.split('@');
            const username = user_mail[0]; // get first portion of user's email as default username

            const profilePhotoName = "defaultPfp.png";
            const profilePhotoURL = "https://firebasestorage.googleapis.com/v0/b/pomobyte.appspot.com/o/profile_pictures%2FdefaultPfp.png?alt=media&token=7960cf4e-37b9-45eb-b6b6-ebec5e4978d6";

            const newUserModel = new User({
                email,
                username,
                decksStudying,
                coins,
                deckNumber,
                flashcardNumber,
                profilePhotoName,
                profilePhotoURL,
                userBio,
                pomopet,
                pomopetData,
                itemsOwned,
            });
            localStorage.setItem("usercoins", newUserModel.coins);
            // Creates user Auth Account AND adds user account to users collections
            //  * uid of the Auth account matches the Doc ID of the user document!
            await createUserWithEmailAndPassword(auth, emailAddress, password)
                .then(cred => {
                    uid = cred.user.uid;
            });

            console.log("ADDING USER TO FIRESTORE");
            /*  This was missing await, making me 
                thing that it wasn't being added fast enough for the user to be browsing.*/
            await firebase.firestore().collection(Constants.collectionName.USERS).doc(uid).set(newUserModel.serialize());
            console.log("ADDED USER TO FIRESTORE");
      
            // Account successfully created from here
            e.target.reset();            

            Utilities.info('Account created', `You're signed in as ${emailAddress}`, Constants.htmlIDs.createAccountModal); //last param dismisses previous modal 
            Elements.modalCreateAccount.hide();
        } catch (e) {
            if (Constants.DEV) console.log(e);
            Utilities.info('Failed to create account', JSON.stringify(e), Constants.htmlIDs.createAccountModal);
        }
    });

    Elements.menuSignOut.addEventListener('click', async () => {
        try {
            await signOut(auth);
            Utilities.info('Notice', `You're securely signed out!`); //last param dismisses previous modal 
            await HomePage.home_page();

        } catch (e) {
            Utilities.info('Sign Out Error', JSON.stringify(e));
            if (Constants.DEV)
                console.log('Sign out error' + e);
        }
    });

    Elements.modalMenuResetPassword.addEventListener('click', async () => {
        //This just opens the reset password modal within the sign in modal and closes out the sign in modal --Blake
        try {
            Elements.modalSignIn.hide();
            Elements.modalResetPassword.show();
        } catch (e) {
            Utilities.info('Reset password menu error ', JSON.stringify(e));
            if (Constants.DEV)
                console.log('Reset password menu error ' + e);
        }
    })

    Elements.formResetPassword.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;

        try {
            firebase.auth().sendPasswordResetEmail(email);

            Elements.modalResetPassword.hide();
            Utilities.info('Notice', `If the email exists, a password reset email has been sent`);

        } catch (e) {
            Utilities.info('Password reset error ', JSON.stringify(e));
            if (Constants.DEV)
                console.log('Password reset error ' + e);
        }
    })


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
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        routing(pathname, hash);
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

        history.pushState(null, null, routePathname.HOME);

       //Elements.root.innerHTML = HomePage.html;
    }
}

