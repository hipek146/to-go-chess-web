import React from 'react';
import { Subject } from 'rxjs';
import { useEffect, useState, FunctionComponent } from 'react';
import { Chessboard } from '../common/core/chessboard';
import { BoardInfo } from '../common/core/board-info';
import { Piece } from '../common/pieces/piece';
import { Move } from '../common/pieces/move';
import { getComponent } from '../helpers/get-component';
import './webChessboard.css';


interface Props {
    chessboard: Chessboard;
    onMove: (move: string) => void;
    size: number;
    turn: 'white' | 'black';
    clearBoard: Subject<void>;
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


const getMinWindowSize = () => Math.min(window.innerHeight, window.innerWidth);


const generateGridItems = (boardInfo: BoardInfo, onClick: Function, firstPress: FirstPress | undefined, lastMove: LastMove | undefined)  => {
    let items: any[] = [];

    for(let row = 8; row >= 1; row--) {
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


export const WebChessboard: FunctionComponent<Props> = (props: Props) => {
    const [positionFEN, setPositionFEN] = useState(props.chessboard.positionFEN);
    const [boardInfo, setBoardInfo] = useState(new BoardInfo().fromFEN(positionFEN));
    const [firstPress, setFirstPress] = useState<FirstPress>();
    const [lastMove, setLastMove] = useState<LastMove>();
    const { size } = props;

    useEffect(() => {
        props.chessboard.callback = (newPosition) => {
            setPositionFEN(newPosition);
            setBoardInfo(new BoardInfo().fromFEN(newPosition));
        };
    });

    useEffect(() => {
        props.clearBoard.subscribe(() => {
            setFirstPress(undefined);
            setLastMove(undefined);
        });
        return props.clearBoard.unsubscribe;
    }, []);
    
    const onPress = (piece: Piece, row: number, column: number) => {
        if (piece === firstPress?.piece) {
            setFirstPress(undefined);
        } else if (piece !== undefined && props.turn == piece.color && boardInfo.turn === piece.color) {
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
                if (row === 8 && boardInfo.turn === 'white') movePGN += '=Q';
                if (row === 1 && boardInfo.turn === 'black') movePGN += '=Q';
            } else if (firstPress.piece.symbol === 'k' && move.type === 'kingsideCastle') {
                movePGN += 'O-O';
            } else if (firstPress.piece.symbol === 'k' && move.type === 'queensideCastle') {
                movePGN += 'O-O-O';
            } else {
                movePGN += firstPress.piece.symbol.toUpperCase();
                if (move.type === 'capture') movePGN += 'x';
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

    const items = generateGridItems(boardInfo, onPress, firstPress, lastMove);

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