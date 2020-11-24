import React from 'react';
import './MenuBar.css'
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { gameTreeUpdated } from "../actions";
import { ReactComponent as Menu } from "../images/menu-24px.svg"
import { ReactComponent as Before } from "../images/navigate_before-24px.svg"
import { ReactComponent as Next } from "../images/navigate_next-24px.svg"
import { ReactComponent as Swap } from "../images/cached-24px.svg"
import { ReactComponent as Emote } from "../images/tag_faces-24px.svg"


interface Props {press, game, gameTreeUpdated}

const MenuBar = (props: Props) => {
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

    return (
        <div className="MenuBar">
            <div onClick={() => props.press('menu')} className="MenuBar-button">
                <Menu
                    height="100%"
                    style={{transform: 'scale(1.2)'}}
                    fill={'#efe788'}
                />
            </div>
            <div onClick={() => onPreviousMovePress()} className="MenuBar-button">
                <Before
                    height="100%"
                    style={{transform: 'scale(1.4)'}}
                    fill={'#efe788'}
                />
            </div>
            <div onClick={() => onNextMovePress()} className="MenuBar-button">
                <Next
                    height="100%"
                    style={{transform: 'scale(1.4)'}}
                    fill={'#efe788'}
                />
            </div>
            <div className="MenuBar-button">
                <Swap
                    height="100%"
                    style={{transform: 'scale(1.1)'}}
                    fill={'#efe788'}
                />
            </div>
            <div className="MenuBar-button">
                <Emote
                    height="100%"
                    fill={'#efe788'}
                />
            </div>
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            gameTreeUpdated
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {game, gameTreeUpdated} = state.app;
    return {
      game,
      gameTreeUpdated
    };
};
  
const WrappedMenuBar = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MenuBar);
  
export default WrappedMenuBar;