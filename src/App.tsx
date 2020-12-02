import React, {useEffect, useRef, useState} from 'react';

import {Provider, connect} from 'react-redux';
import {createStore, applyMiddleware, bindActionCreators} from 'redux';
import thunk from 'redux-thunk';

import firebase from "firebase/app";
import "firebase/auth";
import {FirebaseAuthProvider} from "@react-firebase/auth";

import GameComponent from './components/GameComponent';
import GameAnalysis from './components/GameAnalysis';
import GameTree from "./components/GameTree";
import './App.css';

import reducer from './reducers';
import {restoreUser} from "./actions";
import AccountComponent from "./components/AccountComponent";
import MenuBar from "./components/MenuBar";
import MenuList from "./components/MenuList";
import Dialog from "./components/Dialog";

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
    const [size, setSize] = useState(0);
    const [openedMenu, setOpenedMenu] = useState(false);
    const ref = useRef(null)

    function onAuthStateChanged(user: any) {
        props.restoreUser(user);
    }

    const updateSize = () => {
        const height = ref.current.clientHeight - 80;
        const width = ref.current.clientWidth - 580;
        setSize(Math.min(height, width));
    }

    const onMenuPress = (option: string) => {
        switch (option) {
            case 'menu':
                setOpenedMenu(!openedMenu);
                break;
        }
    }

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', () => {
            updateSize();
        })
        const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    }, []);

    return (
        <FirebaseAuthProvider firebase={firebase} {...config}>
            <div className="App" ref={ref}>
                <div className="chessBoard">
                    { 
                        props.componentType === 'analysis' ? (
                            <GameAnalysis size={size}/>
                        ) : (
                            <GameComponent size={size}/>
                        )
                    }
                </div>
                <div className="rightSide">
                    <AccountComponent />
                    <MenuBar press={(option: string) => onMenuPress(option)} />
                    {openedMenu ? <MenuList back={() => setOpenedMenu(false)}/> : <GameTree/>}
                </div>
                {props.dialog.content && <Dialog />}
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
    const {user, dialog, isLoading, isSignout, stackLoading, componentType} = state.app;
    return {
        user,
        dialog,
        isLoading,
        isSignout,
        stackLoading,
        componentType
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

