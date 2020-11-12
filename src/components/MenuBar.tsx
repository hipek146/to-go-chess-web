import React from 'react';
import './MenuBar.css'
import { ReactComponent as Menu } from "../images/menu-24px.svg"
import { ReactComponent as Before } from "../images/navigate_before-24px.svg"
import { ReactComponent as Next } from "../images/navigate_next-24px.svg"
import { ReactComponent as Swap } from "../images/cached-24px.svg"
import { ReactComponent as Emote } from "../images/tag_faces-24px.svg"

const MenuBar = (props) => {
    return (
        <div className="MenuBar">
            <div onClick={() => props.press('menu')} className="MenuBar-button">
                <Menu
                    height="100%"
                    style={{transform: 'scale(1.2)'}}
                    fill={'#efe788'}
                />
            </div>
            <div className="MenuBar-button">
                <Before
                    height="100%"
                    style={{transform: 'scale(1.4)'}}
                    fill={'#efe788'}
                />
            </div>
            <div className="MenuBar-button">
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

export default MenuBar;