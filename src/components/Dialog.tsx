import React from 'react';
import {connect} from 'react-redux';
import './Dialog.css'
import {bindActionCreators} from "redux";
import {closeDialog} from "../actions";

const Dialog = (props) => {
    return (
        <div className="Dialog">
            <div className="Dialog-frame Dialog-frameWithClose">
                <div className="Dialog-close" onClick={() => {
                    if (props.dialog.onClose) {
                        props.dialog.onClose();
                    }
                    props.closeDialog();
                }}>x</div>
                {props.dialog.content}
            </div>
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            closeDialog,
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {dialog} = state.app;
    return {
        dialog,
    };
};

const DialogComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Dialog);

export default DialogComponent;
