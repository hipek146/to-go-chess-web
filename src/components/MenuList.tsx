import React from 'react';
import './MenuList.css'
import {bindActionCreators} from "redux";
import {openDialog, closeDialog, createGame} from "../actions";
import {connect} from 'react-redux';

const ChooseColor = (props) => {
    return (
        <div>
            <button onClick={() => props.callback('white')}>Białe</button>
            <button onClick={() => props.callback('random')}>Losowo</button>
            <button onClick={() => props.callback('black')}>Czarne</button>
        </div>
    );
}


const MenuList = (props) => {
    const singleGame = () => {
        props.openDialog(
            <div>
                Wybierz kolor:
                <ChooseColor callback={color => {
                    props.createGame({mode: 'singleGame', color})
                    props.back();
                    props.closeDialog();
                }}/>
            </div>
        );
    }
    const onlineGame = () => {
        props.openDialog(
            <div>
                Wybierz kolor:
                <ChooseColor callback={color => {
                    props.createGame({mode: 'onlineGame', color})
                    props.back();
                    props.closeDialog();
                }}/>
            </div>
        );
    }
    const twoPlayers = () => {
        props.createGame({mode: 'twoPlayers'});
        props.back();
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