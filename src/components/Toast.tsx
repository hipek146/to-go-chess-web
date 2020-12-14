import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import './Toast.css'
import {bindActionCreators} from "redux";
import {closeToast} from "../actions";

let timeOut;
let interval;

const Toast = (props) => {
    const [opacity, setOpacity] = useState(1);
    useEffect(() => {
        if (timeOut) {
            clearTimeout(timeOut);
        }
        if (interval) {
            clearInterval(interval);
        }
        const options = props.toast.options;
        if (options) {
            if (options.fade) {
                setOpacity(1);
                timeOut = setTimeout(() => {
                    const ms = 16;
                    const fadeTime = 500;
                    let value = 1;
                    interval = setInterval(() => {
                        if (value - ms / fadeTime < 0) {
                            clearInterval(interval);
                            props.closeToast();
                        } else {
                            value = value - ms / fadeTime;
                            setOpacity(value);
                        }
                    }, ms);
                }, 2500);
            }
        }
    }, [props.toast]);
    return (
        <div className="Toast" style={{opacity}}>
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
