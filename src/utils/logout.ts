import firebase from "firebase";
// import {GoogleSignin} from '@react-native-community/google-signin';

export default async function logout() {
    console.log('coo')
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log(e);
    }
}
