import React, {useEffect} from 'react';

import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware, bindActionCreators} from 'redux';
import thunk from 'redux-thunk';

import firebase from "firebase/app";
import "firebase/auth";
import {FirebaseAuthProvider} from "@react-firebase/auth";

import TestGame from './components/testGame';
import './App.css';

import reducer from './reducers';
import {restoreUser} from "./actions";
import SignInPanelContainer from "./components/SignInPanel";

const store = createStore(reducer, applyMiddleware(thunk));

const config = {
    apiKey: "AIzaSyC5SsPEXkPngxPbXoN3FIspOKwufLSOWQA",
    authDomain: "togochess-833a5.firebaseapp.com",
    databaseURL: "https://togochess-833a5.firebaseio.com",
    projectId: "togochess-833a5",
    storageBucket: "togochess-833a5.appspot.com",
    messagingSenderId: "100252322773",
    appId: "1:100252322773:web:4259dbe7e6c061ca038b5c",
    measurementId: "G-S7X45BRF44"
};

function App(props) {

    function onAuthStateChanged(user: any) {
        props.restoreUser(user);
    }

    useEffect(() => {
        const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    }, []);

    return (
        <FirebaseAuthProvider firebase={firebase} {...config}>
            <div className="App">
                <div className="chessBoard">
                    <TestGame/>
                </div>
                <div className="rightSide">
                    <SignInPanelContainer />
                </div>
            </div>
        </FirebaseAuthProvider>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            restoreUser,
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {user, isLoading, isSignout, stackLoading} = state.app;
    return {
        user,
        isLoading,
        isSignout,
        stackLoading,
    };
};

const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(App);

export default (() => (
    <Provider store={store}>
        <AppContainer />
    </Provider>
));

