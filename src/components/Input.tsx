import React from 'react';
import {useState} from 'react';
import './GameTree.css';

interface Props {
    title: string;
    onClick: (text) => void;
    buttonValue: string;
}

const Input = (props: Props) => {
    const [text, setText] = useState('');

    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
            <div style={{padding: 5, marginBottom: 10}}>{props.title}</div>
            <textarea onChange={(event) => setText(event.target.value)}/>
            <button onClick={() => props.onClick(text)} style={{display: 'block', marginTop: 10}}>
                {props.buttonValue}
            </button>
        </div>
    );
}

export default Input;