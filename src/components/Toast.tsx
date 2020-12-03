import React from 'react';
import {connect} from 'react-redux';
import './Toast.css'
import {bindActionCreators} from "redux";
import {closeToast} from "../actions";

const Toast = (props) => {
    return (
        <div className="Toast">
                {props.toast.content}
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            closeToast,
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {toast} = state.app;
    return {
        toast,
    };
};

const ToastComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Toast);

export default ToastComponent;
