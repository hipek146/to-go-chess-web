import React from 'react';
import { connect } from 'react-redux';
import './GameTree.css';

interface Props {
    gameTree: any
}

const GameTree = (props: Props) => {
    const {gameTree} = props;
    console.log(gameTree)
    return (
        <div className="GameTree"></div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({});

const mapStateToProps = (state: any) => {
    const {gameTree} = state.app;
    return {
      gameTree,
    };
};
  
const WrappedGameTree = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameTree);
  
export default WrappedGameTree;