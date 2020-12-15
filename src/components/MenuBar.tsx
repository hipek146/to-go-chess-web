import React, {useEffect, useState} from 'react';
import './MenuBar.css'
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import {gameTreeUpdated, openToast, sendEmote, rotateChessboard} from "../actions";
import { ReactComponent as Menu } from "../images/menu-24px.svg"
import { ReactComponent as Before } from "../images/navigate_before-24px.svg"
import { ReactComponent as Next } from "../images/navigate_next-24px.svg"
import { ReactComponent as Swap } from "../images/cached-24px.svg"
import { ReactComponent as Emote } from "../images/tag_faces-24px.svg"
import emotes from "../utils/emotes";


interface Props {press, game, gameTreeUpdated, isTreeEnabled, openToast, sendEmote, rotateChessboard}

const MenuBar = (props: Props) => {
    const [emotesDialog, setEmotesDialog] = useState(false);
    const onPreviousMovePress = () => {
        let node = props.game.getTree().getParent();
        if (node !== undefined) {
            props.game.getTree().setLeaf(node);
            props.game.update(node.positionFEN);
            props.gameTreeUpdated(props.game.getTree().toSerializable());
        }
    }

    const onNextMovePress = () => {
        let node = props.game.getTree().getChild();
        if (node !== undefined) {
            props.game.getTree().setLeaf(node);
            props.game.update(node.positionFEN);
            props.gameTreeUpdated(props.game.getTree().toSerializable());
        }
    }

    const onEmoteClick = () => {
        setEmotesDialog(false);
        window.removeEventListener('click', onEmoteClick);
    }

    const onRotateClick = () => {
        props.rotateChessboard(false);
    }

    useEffect(() => {
        if (emotesDialog) {
            window.addEventListener('click', onEmoteClick);
        }
    }, [emotesDialog]);

    return (
        <div className="MenuBar">
            <div onClick={() => props.press('menu')} className="MenuBar-button">
                <Menu
                    height="100%"
                    style={{transform: 'scale(1.2)'}}
                    fill={'#efe788'}
                />
            </div>
            <div onClick={props.isTreeEnabled ? () => onPreviousMovePress() : undefined} className="MenuBar-button">
                <Before
                    height="100%"
                    style={{transform: 'scale(1.4)'}}
                    fill={'#efe788'}
                />
            </div>
            <div onClick={props.isTreeEnabled ? () => onNextMovePress() : undefined} className="MenuBar-button">
                <Next
                    height="100%"
                    style={{transform: 'scale(1.4)'}}
                    fill={'#efe788'}
                />
            </div>
            <div className="MenuBar-button" onClick={onRotateClick}>
                <Swap
                    height="100%"
                    style={{transform: 'scale(1.1)'}}
                    fill={'#efe788'}
                />
            </div>
            <div className="MenuBar-button" onClick={() => {
                setEmotesDialog(true);
            }}>
                <Emote
                    height="100%"
                    fill={'#efe788'}
                />
            </div>
            {emotesDialog && <div className="MenuBar-emotesDialog">
                {emotes.map(emote => <img key={emote.res} src={emote.res} className='MenuBar-emote' onClick={() => props.sendEmote(emote.index)} />)}
            </div>}
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            gameTreeUpdated,
            openToast,
            sendEmote,
            rotateChessboard
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {game, gameTreeUpdated, isTreeEnabled} = state.app;
    return {
      game,
      gameTreeUpdated,
      isTreeEnabled,
    };
};
  
const WrappedMenuBar = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MenuBar);
  
export default WrappedMenuBar;