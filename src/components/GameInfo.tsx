import React, { useEffect } from 'react';
import {FunctionComponent} from 'react';
import {useState} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import './GameInfo.css';

interface Props {game}

export const GameInfo: FunctionComponent<Props> = (props: Props) => {
    const [time, setTime] = useState<any>();

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(props.game.getTimes());
        }, 250);
        return () => clearInterval(interval);   
    });

    return (
        <div className='PlayerInfo'>
            <div className='WhiteBox'/>
            <div className='TimersContainer'>
                <p className='Timer'> 
                    { time ?
                        <>
                            {time.timeWhite.minutes}:
                            {time.timeWhite.seconds < 10 ? <>0</> : null}
                            {time.timeWhite.seconds}
                        </>
                        :
                        <>0:00</>
                    } 
                </p>
                <p className='Timer'> 
                    { time ?
                        <>
                            {time.timeBlack.minutes}:
                            {time.timeBlack.seconds < 10 ? <>0</> : null}
                            {time.timeBlack.seconds}
                        </>
                        :
                        <>0:00</>
                    } 
                </p>
            </div>
            <div className='BlackBox'/>
        </div>
    )
};

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {game} = state.app;
    return {
        game
    };
};

const WrappedGameInfo = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameInfo);


export default WrappedGameInfo;