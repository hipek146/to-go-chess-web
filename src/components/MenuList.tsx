import React from 'react';
import './MenuList.css'
import {bindActionCreators} from "redux";
import {openDialog, closeDialog, createGame} from "../actions";
import {connect} from 'react-redux';

const ChooseColor = (props) => {
    return (
        <div>
            Wybierz kolor:
            <div>
                <button onClick={() => props.openDialog(ChooseClockType({...props, color: 'white'}))}>Białe</button>
                <button onClick={() => props.openDialog(ChooseClockType({...props, color: 'random'}))}>Losowo</button>
                <button onClick={() => props.openDialog(ChooseClockType({...props, color: 'black'}))}>Czarne</button>
            </div>
        </div>
    );
}

const ChooseClockType = (props) => {
    return (
        <div>
            Wybierz tryb czasowy:
            <div>
                <button onClick={() => props.callback(props.color, 'standard')}>Standard</button>
                <button onClick={() => props.callback(props.color, 'fischer')}>Fischer</button>
            </div>
        </div>
    );
}

const MenuList = (props) => {
    const singleGame = () => {
        props.openDialog(
            <ChooseColor openDialog={props.openDialog} callback={(color: string, clockType: string) => {
                props.createGame({mode: 'singleGame', color, clockType})
                props.back();
                props.closeDialog();
            }}/>
        );
    }
    const onlineGame = () => {
        props.openDialog(
            <ChooseColor openDialog={props.openDialog} callback={(color: string, clockType: string) => {
                props.createGame({mode: 'onlineGame', color, clockType})
                props.back();
                props.closeDialog();
            }}/>
        );
    }
    const twoPlayers = () => {
        props.openDialog(
            <ChooseClockType color='white' openDialog={props.openDiaog} callback={(color: string, clockType: string) => {
                props.createGame({mode: 'twoPlayers', color, clockType})
                props.back();
                props.closeDialog();
            }}/>
        );
    }
    return (
        <div className="MenuList">
            <div className="MenuList-header">Nowa gra</div>
            <div className="MenuList-button" onClick={singleGame}>Gra z komputerem</div>
            <div className="MenuList-button" onClick={onlineGame}>Gra online</div>
            <div className="MenuList-button" onClick={twoPlayers}>Dwoje graczy</div>
            <div className="MenuList-header"/>
            <div className="MenuList-button MenuList-button-settings">Analiza partii</div>
            <div className="MenuList-button MenuList-button-settings">Importuj / Eksportuj</div>
            <div className="MenuList-button MenuList-button-settings">Ustawienia</div>
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            openDialog,
            closeDialog,
            createGame
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => ({});

const MenuListComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MenuList);

export default MenuListComponent;