import React, {useState} from 'react';
import {connect} from "react-redux";
import { ReactComponent as Settings } from "../images/settings-24px.svg"
import './AccountComponent.css'
import SignInPanelContainer from "./SignInPanel";

const AccountComponent = (props) => {
    const [settingHover, setSettingHover] = useState(false);
    const [isDialog, setIsDialog] = useState(false);
    return (
        <div className="AccountComponent">
            <div className="AccountComponent-avatar" />
            <div className="AccountComponent-name">{props.user ? props.user.email : 'Gość'}</div>
            <div className="AccountComponent-rank">1000</div>
            <div className="AccountComponent-settings">
                <Settings
                    fill={settingHover ? '#202020' : '#505050'}
                    onMouseEnter={() => setSettingHover(true)}
                    onMouseLeave={() => setSettingHover(false)}
                    onClick={() => setIsDialog(true)}
                />
            </div>
            {isDialog &&
                <div className="AccountComponent-dialog">
                    <div className="AccountComponent-closeDialog" onClick={() => setIsDialog(false)}>x</div>
                    <SignInPanelContainer/>
                </div>
            }
        </div>
    );
}


const mapStateToProps = (state: any) => {
    const {user} = state.app;
    return {
        user
    };
};

const mapDispatchToProps = (dispatch: any) => ({
});

const AccountComponentContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AccountComponent);

export default AccountComponentContainer;
