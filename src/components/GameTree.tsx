import React from 'react';
import { connect } from 'react-redux';
import './GameTree.css';

interface Props {
    gameTree: any,
    game
}

const traverse = (nodes: any[], result: any[] = [], onClick: Function) => {
    nodes.forEach(node => {
        if (Array.isArray(node)) {
            // console.log("ARRAY")
            traverse(node, result, onClick)
        }
        result.push(
            <div key={node.positionFEN} className="TreeNode" onClick={() => onClick(node)}>
                {node.move}
            </div>
        );
    });
}

const generateItems = (game, gameTree: any) => {
    let items: any[] = [];
    
    const onClick = (node) => {
        game.getTree().setLeaf(node);
        game.update(node.positionFEN);
    }

    traverse(gameTree, items, onClick);
    return items;
}

const GameTree = (props: Props) => {
    const {gameTree, game} = props;
    if (gameTree !== undefined && game !== undefined) {
        var items = generateItems(game, gameTree);
    }
    return (
        <div className="GameTree">
            {items}
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({});

const mapStateToProps = (state: any) => {
    const {gameTree, game} = state.app;
    return {
      gameTree,
      game
    };
};
  
const WrappedGameTree = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameTree);
  
export default WrappedGameTree;