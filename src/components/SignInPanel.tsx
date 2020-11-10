import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import firebase from "firebase";
import logout from "../utils/logout";

const authentication = (email: string, password: string) => {
    if(!email || !password) return;

    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log('User signed in!');
        })
        .catch(error => {
            console.log(error.message);
        });
}

const signUp = (email: string, password: string) => {
    firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
            console.log('User account created & signed in!');
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                console.log('That email address is already in use!');
            }
            if (error.code === 'auth/invalid-email') {
                console.log('That email address is invalid!');
            }
            console.log(error);
        });
}

const SignInPanel = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        props.user ?
        <>
            {props.user.email}
            <br />
            <button onClick={logout}>Wyloguj się</button><br/>
        </>
            :
        <>
            {'Niezalogowany'}
            <br/>
            <input
                placeholder="E-mail"
                onChange={event => setEmail(event.target.value)}
                value={email}
            />
            <br/>
            <input
                type="password"
                placeholder="Hasło"
                onChange={event => setPassword(event.target.value)}
                value={password}
            />
            <br/>
            <button onClick={() => authentication(email, password)}>Zaloguj się</button><br/>
            <button onClick={() => {
                const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
                facebookAuthProvider.setCustomParameters({
                    auth_type: 'reauthenticate'
                });
                firebase.auth().signInWithPopup(facebookAuthProvider);
            }}>Facebook SignIn</button><br/>
            <button onClick={() => {
                const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
                googleAuthProvider.setCustomParameters({
                    prompt: 'select_account'
                });
                firebase.auth().signInWithPopup(googleAuthProvider);
            }}>Google SignIn</button><br/>
            <button onClick={() => signUp(email, password)}>Zarejestruj się</button><br/>
        </>
    )
}

const mapStateToProps = (state: any) => {
    const {user} = state.app;
    return {
        user
    };
};

const mapDispatchToProps = (dispatch: any) => ({
});

const SignInPanelContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SignInPanel);

export default SignInPanelContainer;