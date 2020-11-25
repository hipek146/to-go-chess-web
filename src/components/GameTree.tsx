import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { gameTreeUpdated } from "../actions";
import './GameTree.css';

interface Props {
    gameTree: any,
    game,
    gameTreeUpdated
}

const generateItems = (game, gameTree: any, gameTreeUpdated: any) => {
    let items: any[] = [];
    
    const onClick = (node) => {
        game.getTree().setLeaf(node);
        game.update(node.positionFEN);
        gameTreeUpdated(game.getTree().toSerializable());
    }

    const traverse = (node: any, result: any[] = []) => {
        if (Array.isArray(node)) {
            let branchResult = [];
            const isOnRightSide = node[0].positionFEN.split(' ')[1] === 'w';
            if (isOnRightSide) {
                branchResult.push(
                    [
                        <div key={"turn"+node[0].positionFEN} className="TurnNumber">
                            {node[0].positionFEN.split(' ').slice(-1) - 1}..
                         </div>,
                        <div key={node[0].positionFEN} className="EmptyNode">
                            ...
                        </div>
                    ]
                );
            }
            for (const child of node) {
                traverse(child, branchResult);
            }
            if (isOnRightSide) {
                result.push(
                    <div key={node[0].positionFEN} className={"EmptyNode"}>
                        ...
                    </div>
                );
            }
            result.push(
                <div key={"internal"+node[0].positionFEN} className="SubTree">
                    {branchResult}
                </div>
            );
            if (isOnRightSide) {
                result.push(
                    [
                        <div key={"turn"+node[0].positionFEN} className="TurnNumber">
                            {node[0].positionFEN.split(' ').slice(-1) - 1}
                        </div>,
                        <div key={node[0].positionFEN} className="EmptyNode">
                            ...
                        </div>
                    ]
                );
            }
        } else {
            if (node.positionFEN.split(' ')[1] === 'b') {
                result.push(
                    <div key={"turn"+node.positionFEN} className="TurnNumber">
                        {node.positionFEN.split(' ').slice(-1)}
                    </div>
                );
            }
            result.push(
                <div key={node.positionFEN} className={node === game.getTree().leaf ? "Leaf" : "TreeNode"} onClick={() => onClick(node)}>
                    {node.move}
                </div>
            );
        }
    }

    for (const child of gameTree) {
        traverse(child, items);
    }

    return items;
}

const GameTree = (props: Props) => {
    const {gameTree, game, gameTreeUpdated} = props;

    if (gameTree !== undefined && game !== undefined) {
        var items = generateItems(game, gameTree, gameTreeUpdated);
    }

    return (
        <div className="GameTree">
            {items}
        </div>
    );
}

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
            gameTreeUpdated
        },
        dispatch,
    ),
});

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