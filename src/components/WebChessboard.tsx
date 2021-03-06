import React from 'react';
import { connect } from 'react-redux';
import { useEffect, useState, FunctionComponent } from 'react';
import { Chessboard } from '../common/core/chessboard';
import { BoardInfo } from '../common/core/board-info';
import { Piece } from '../common/pieces/piece';
import { Move } from '../common/pieces/move';
import { getComponent, getComponentBySymbol } from '../helpers/get-component';
import { bindActionCreators } from "redux";
import { openDialog, closeDialog } from "../actions";
import './WebChessboard.css';


interface Props {
    chessboard: Chessboard;
    onMove: (move: string) => void;
    size: number;
    turn: 'white' | 'black';
    openDialog: any; 
    closeDialog: any;
    mode: 'onlineGame' | 'singleGame' | 'twoPlayers';
    chessboardRotated: boolean;
    rotateAutomatically: boolean;
}

interface LastMove {
    previousPosition: {
        row: number, 
        column: number
    }, 
    move: Move
}

interface FirstPress {
    piece: Piece;
    possibleMoves: Move[];
}

const generateGridItems = (boardInfo: BoardInfo, onClick: Function, firstPress: FirstPress | undefined, lastMove: LastMove | undefined, rotate: boolean)  => {
    let items: any[] = [];

    var startRow, checkCondition, iterate;
    if (rotate) {
        startRow = 1;
        checkCondition = (row) => row <= 8;
        iterate = (row) => row + 1;
    } else {
        startRow = 8;
        checkCondition = (row) => row >= 1;
        iterate = (row) => row - 1;
    }

    for(let row = startRow; checkCondition(row); row = iterate(row)) {
        for(let column = 1; column <= 8; column++) {
            let piece = boardInfo.get(row, column);
            let svg = getComponent(piece);
            let symbol = piece === undefined ? 'blank' : piece.getSymbol();

            let style = ['square'];
            let moves = firstPress?.possibleMoves?.filter(el => el.row === row && el.column === column);
            if (firstPress !== undefined && firstPress.piece === piece) {
                style.push('highlightedPossibleMove');
            } else if (moves !== undefined && moves.length > 0) {
                style.push(moves[0].type === 'capture' ? 'highlightedPossibleCapture' : 'highlightedPossibleMove');
            } else if (lastMove !== undefined && ((lastMove.move.row === row && lastMove.move.column === column) || 
                (lastMove.previousPosition.row === row && lastMove.previousPosition.column === column))) {
                style.push('highlightedLastMove');
            } 
            const styles = style.join(" ")
            items.push(
                <div key={symbol + row + column} className={styles} onClick={() => onClick(piece, row, column)}>
                    {svg}
                </div>
            );
        }
    }

    return items;
};

const generatePromotionItems = (color: 'white' | 'black', callback: (symbol: string) => void) => {
    let symbols = color === 'black' ? ['q', 'r', 'b', 'n'] : ['Q', 'R', 'B', 'N'];
    let items: any[] = [];

    symbols.forEach(symbol => {
        items.push(
            <div 
                key={`promotion=${symbol}`} 
                onClick={() => callback(symbol.toUpperCase())}
                className='promotionPiece'
            >
                { getComponentBySymbol(symbol) }
            </div>
        );
    });

    return items;
};

const WebChessboard: FunctionComponent<Props> = (props: Props) => {
    const [boardInfo, setBoardInfo] = useState(new BoardInfo().fromFEN(props.chessboard.positionFEN));
    const [firstPress, setFirstPress] = useState<FirstPress>();
    const [lastMove, setLastMove] = useState<LastMove>();
    const { size } = props;

    useEffect(() => {
        props.chessboard.callback = (newPosition) => {
            setBoardInfo(new BoardInfo().fromFEN(newPosition));
            setFirstPress(undefined);
            setLastMove(undefined);
        };
    });

    useEffect(() => {
        setBoardInfo(new BoardInfo().fromFEN(props.chessboard.positionFEN));
    }, [props.chessboard.positionFEN]);

    useEffect(() => {
        setFirstPress(undefined);
        setLastMove(undefined);
    }, [props.chessboard]);
    
    const onPress = (piece: Piece, row: number, column: number) => {
        if (firstPress === undefined && (props.mode === 'onlineGame' || props.mode === 'singleGame') && piece !== undefined && props.turn !== piece.color) {
            return;
        }
        if (piece === firstPress?.piece) {
            setFirstPress(undefined);
        } else if (piece !== undefined && boardInfo.turn === piece.color) {
            setFirstPress({
                piece, 
                possibleMoves: piece.possibleMoves(boardInfo)
            });
        } else if (firstPress !== undefined) {
            let move = firstPress.possibleMoves.filter(move => move.column === column && move.row === row)[0];
            if (move === undefined) return;
            let movePGN: string = '';
            if (firstPress.piece.symbol === 'p') {
                if (move.type === 'capture') movePGN += 'abcdefgh'[firstPress.piece.column - 1] + 'x';
                movePGN += 'abcdefgh'[column - 1] + row;
                if ((row === 8 && boardInfo.turn === 'white') || (row === 1 && boardInfo.turn === 'black')) {
                    const callback = (symbol:string) => {
                        movePGN += `=${symbol}`;
                        props.onMove(movePGN);
                        setFirstPress(undefined);
                        setLastMove({
                            previousPosition: {
                                row: firstPress.piece.row, 
                                column: firstPress.piece.column
                            }, 
                            move
                        });
                        props.closeDialog()
                    };

                    props.openDialog(
                        <div className='promotionContainer'>
                            {generatePromotionItems(boardInfo.turn, callback)}
                        </div>
                    )
                }
            } else if (firstPress.piece.symbol === 'k' && move.type === 'kingsideCastle') {
                movePGN += 'O-O';
            } else if (firstPress.piece.symbol === 'k' && move.type === 'queensideCastle') {
                movePGN += 'O-O-O';
            } else {
                movePGN += firstPress.piece.symbol.toUpperCase();
                let samePieces = boardInfo.find(firstPress.piece.symbol, boardInfo.turn).filter(piece => {
                    return piece.checkMove(boardInfo, row, column, move.type);
                });
                let toAdd = '';
                samePieces = samePieces.filter(piece => !(piece.column === firstPress.piece.column && piece.row == firstPress.piece.row));
                if (samePieces.some(piece => piece.row === firstPress.piece.row)) {
                    toAdd += 'abcdefgh'[firstPress.piece.column - 1];
                } 
                if (samePieces.some(piece => piece.column === firstPress.piece.column)) {
                    toAdd += firstPress.piece.row;
                } 
                if (toAdd.length === 0 && samePieces.length !== 0) {
                    toAdd += 'abcdefgh'[firstPress.piece.column - 1];
                }
                if (move.type === 'capture') toAdd += 'x';
                movePGN += toAdd;
                movePGN += 'abcdefgh'[column - 1] + row;
            } 
            props.onMove(movePGN)
            setFirstPress(undefined);
            setLastMove({
                previousPosition: {
                    row: firstPress.piece.row, 
                    column: firstPress.piece.column
                }, 
                move
            });
        } 
    };

    const items = generateGridItems(
        boardInfo, onPress, firstPress, lastMove, 
        (props.rotateAutomatically && boardInfo.turn === 'black') ? !props.chessboardRotated : props.chessboardRotated
    ); // last argument is simple logical XOR

    return (
        <div style={{width: size, height: size}}>
            <div className="chessboard-image" style={{width: size, height: size}}>
                <div className="chessboard" style={{width: size, height: size}}>
                    {items}
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch: any) => ({
    ...bindActionCreators(
        {
          openDialog,
          closeDialog,
        },
        dispatch,
    ),
});

const mapStateToProps = (state: any) => {
    const {rotateAutomatically, chessboardRotated} = state.app;
    return {
        rotateAutomatically,
        chessboardRotated
    };
};

const WrappedWebChessboard = connect(
    mapStateToProps,
    mapDispatchToProps,
)(WebChessboard);

export default WrappedWebChessboard;

