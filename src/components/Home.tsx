import React from 'react';
import { connect } from 'react-redux';
import './GameTree.css';
import GameComponent from '../components/GameComponent';
import GameAnalysis from '../components/GameAnalysis';

interface Props {
    newAnalysis,
    newGame,
    size
}

const GameTree = (props: Props) => {
    const {newGame, newAnalysis, size} = props;

    return (
        <div>
            {
                newGame ? (
                    <GameComponent size={size}/>
                ) : (
                    newAnalysis ? (
                        <GameAnalysis size={size}/>
                    ) : (
                        undefined
                    )
                )
            }
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({});

const mapStateToProps = (state: any) => {
    const {newGame, newAnalysis} = state.app;
    return {
      newGame,
      newAnalysis
    };
};
  
const WrappedGameTree = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameTree);
  
export default WrappedGameTree;