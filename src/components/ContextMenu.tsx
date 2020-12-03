import React from 'react';
import {connect} from 'react-redux';
import './ContextMenu.css'
import {bindActionCreators} from "redux";
import {closeDialog} from "../actions";
import { ReactComponent as Draw } from "../images/draw.svg"
import { ReactComponent as Surrender } from "../images/king_black.svg"
import {drawOffer, surrender} from "../actions";

const ContextMenu = (props) => {
    if (!props.config || props.config.mode !== 'onlineGame') {
        return <></>;
    }
    return (
        <div className="ContextMenu">
            <div className={
                "ContextMenu-button"
                + (props.status === 'drawOffered' ? ' ContextMenu-button_disabled' : '')
            } onClick={() => props.drawOffer()}>
                <div className="ContextMenu-icon">
                    <Draw className="ContextMenu-draw"/>
                </div>
                <div className="ContextMenu-title">
                    {props.status === 'drawOffered' ? 'Wysłaono propozycję' : 'Zaproponuj remis'}
                </div>
            </div>
            <div className="ContextMenu-button" onClick={() => props.surrender()}>
                <div className="ContextMenu-icon">
                    <Surrender className="ContextMenu-surrender"/>
                </div>
                <div className="ContextMenu-title">Poddaj się</div>
            </div>
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            drawOffer,
            surrender,
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {config, status} = state.app;
    return {
        config,
        status
    };
};

const ContextMenuComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ContextMenu);

export default ContextMenuComponent;
