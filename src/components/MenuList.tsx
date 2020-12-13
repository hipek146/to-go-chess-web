import React, {useEffect, useState} from 'react';
import './MenuList.css'
import {bindActionCreators} from "redux";
import { connect } from 'react-redux'
import {openDialog, closeDialog, createGame, createAnalysis} from "../actions";
import Input from './Input';
import ContextMenu from './ContextMenu';
import firebase from "firebase/app";

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
    const gameAnalysis = () => {
        props.createAnalysis();
        props.back();
    }
    const onImport = () => {
        if (props.game) {
            const db = firebase.firestore();
            const List = () => {
                const [list, setList] = useState([])
                const [isLoading, setIsLoading] = useState(true)
                useEffect(() => {
                    const array = [];
                    db.collection('users').doc(props.user.uid).collection('games').get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            const {name, pgn} = doc.data();
                            array.push(
                                <div key={name} style={{display: 'flex', alignItems: 'center', borderBottom: '1px solid #707070'}}>
                                    <div style={{flexGrow: 1}}><b>{name}</b></div>
                                    <button onClick={() => onClick(pgn)}>Wczytaj</button>
                                </div>
                            );
                        })
                        setList(array);
                        setIsLoading(false);
                    });
                }, []);
                return <>{isLoading ? 'Ładowanie...' : <div style={{overflow: 'auto', maxHeight: '500px', maxWidth: '300px'}}>{list}</div>}</>
            };
            const onClick = (moves) => {
                if (moves !== '') {
                    props.createAnalysis(moves);
                } 
                props.closeDialog();
            }
            props.openDialog(
                <>
                {props.user ?
                    <>
                        <List />
                    </>
                    : 'Zaloguj się aby wczytać zapisane partie'
                }
                <Input 
                    title="Wprowadź grę w postaci PGN:" 
                    buttonValue="Importuj" 
                    onClick={onClick}
                />
                </>
            );
            props.back();
        }
    }
    const onExport = () => {
        if (props.game) {
            const moves = props.game.getTree().toPGN();
            if (moves !== '') {
                let refInput;
                const placeholder = 'Brak nazwy';
                const db = firebase.firestore();
                props.openDialog(
                    <>
                        {props.user ?
                            <>
                            <input placeholder={placeholder} ref={(ref) => refInput = ref}/>
                            <button onClick={() => {
                                db.collection('users').doc(props.user.uid).collection('games').add({
                                    name: refInput.value ? refInput.value : placeholder,
                                    pgn: moves
                                }).then(() => {
                                    props.openDialog(<>Pomyślnie zapisaono partię</>);
                                }).catch(() => {
                                    props.openDialog(<>Błąd, nie udało się zapisać partii</>);
                                });
                                props.openDialog(<>Zapisywanie...</>);
                            }}>
                                Zapisz na koncie
                            </button>
                            </>
                            : 'Zaloguj się aby zapisać dane na koncie'
                        }
                        <div style={{padding: 10, maxWidth: 300}}>
                            {moves}
                        </div>
                    </>
                )
            } else {
                props.openDialog(
                    <div style={{padding: 10}}>
                        Brak danych do eksportowania.
                    </div>
                )
            }
            props.back();
        }
    }
    return (
        <div className="MenuList">
            <ContextMenu />
            <div className="MenuList-header">Nowa gra</div>
            <div className="MenuList-button" onClick={singleGame}>Gra z komputerem</div>
            <div className="MenuList-button" onClick={onlineGame}>Gra online</div>
            <div className="MenuList-button" onClick={twoPlayers}>Dwoje graczy</div>
            <div className="MenuList-header"/>
            <div className="MenuList-button MenuList-button-settings" onClick={gameAnalysis}>Analiza partii</div>
            <div className="MenuList-button MenuList-button-settings"onClick={onImport}>Importuj</div>
            <div className="MenuList-button MenuList-button-settings" onClick={onExport}>Eksportuj</div>
            <div className="MenuList-button MenuList-button-settings">Ustawienia</div>
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            openDialog,
            closeDialog,
            createGame,
            createAnalysis,
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {game, user} = state.app;
    return {
      game, user,
    };
};

const MenuListComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MenuList);

export default MenuListComponent;