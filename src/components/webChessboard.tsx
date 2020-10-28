import React from 'react';
import { useEffect, useState, FunctionComponent } from 'react';
import { Chessboard } from '../common/core/chessboard';
import { BoardInfo } from '../common/core/board-info';
import { Piece } from '../common/pieces/piece';
import { Move } from '../common/pieces/move';
import WhitePawn from '../images/pawn_white.svg';
import BlackPawn from '../images/pawn_black.svg';
import WhiteRook from '../images/rook_white.svg';
import BlackRook from '../images/rook_black.svg';
import WhiteKnight from '../images/knight_white.svg';
import BlackKnight from '../images/knight_black.svg';
import WhiteBishop from '../images/bishop_white.svg';
import BlackBishop from '../images/bishop_black.svg';
import WhiteKing from '../images/king_white.svg';
import BlackKing from '../images/king_black.svg';
import WhiteQueen from '../images/queen_white.svg';
import BlackQueen from '../images/queen_black.svg';
import './webChessboard.css';

interface Props {
    chessboard: Chessboard;
    onMove: (move: string) => void;
}

interface LastMove {
    previousPosition: {
        row: number, 
        column: number
    }, 
    move: Move
}

const getComponent = (piece: Piece) => {
    if (piece === undefined) return null;

    let char = piece.color === 'white' ? piece.symbol.toUpperCase() : piece.symbol.toLowerCase();
    switch (char) {
        case 'P':
            return <img src={WhitePawn} alt="WhitePawn"/>;
        case 'R':
            return <img src={WhiteRook} alt="WhiteRook"/>;
        case 'N':
            return <img src={WhiteKnight} alt="WhiteKnight"/>;
        case 'B':
            return <img src={WhiteBishop} alt="WhiteBishop"/>;
        case 'Q':
            return <img src={WhiteQueen} alt="WhiteQueen"/>;
        case 'K':
            return <img src={WhiteKing} alt="WhiteKing"/>;
        case 'p':
            return <img src={BlackPawn} alt="BlackPawn"/>;
        case 'r':
            return <img src={BlackRook} alt="BlackRook"/>;
        case 'n':
            return <img src={BlackKnight} alt="White Pawn"/>;
        case 'b':
            return <img src={BlackBishop} alt="BlackBishop"/>;
        case 'q':
            return <img src={BlackQueen} alt="BlackQueen"/>;
        case 'k':
            return <img src={BlackKing} alt="BlackKing"/>;
        default:
            return null;
    }
}

const generateGridItems = (boardInfo: BoardInfo, onClick: Function, firstPress: Piece | undefined, lastMove: LastMove | undefined)  => {
    let items: any[] = [];

    for(let row = 8; row >= 1; row--) {
        for(let column = 1; column <= 8; column++) {
            let piece = boardInfo.get(row, column);
            let svg = getComponent(piece);
            let symbol = piece === undefined ? 'blank' : piece.getSymbol();

            const style = firstPress !== undefined && firstPress === piece ? 
                "highlightedPiece" : (
                    lastMove !== undefined && (lastMove.move.row === row && lastMove.move.column === column || 
                    lastMove.previousPosition.row === row && lastMove.previousPosition.column === column) ? 
                    "highlightedSquare" : "square"
                )

            items.push(
                <div key={symbol + row + column} className={style} onClick={() => onClick(piece, row, column)}>
                    {svg}
                </div>
            );
        }
    }

    return items;
};

const getMinWindowSize = () => Math.min(window.innerHeight, window.innerWidth);

export const WebChessboard: FunctionComponent<Props> = (props: Props) => {
    const [positionFEN, setPositionFEN] = useState(props.chessboard.positionFEN);
    const [boardInfo, setBoardInfo] = useState(new BoardInfo().fromFEN(positionFEN));
    const [firstPress, setFirstPress] = useState<Piece>();
    const [lastMove, setLastMove] = useState<LastMove>();
    const [size, setSize] = useState(getMinWindowSize());

    useEffect(() => {
        window.addEventListener('resize', () => setSize(getMinWindowSize()));
        props.chessboard.callback = (newPosition) => {
            setPositionFEN(newPosition);
            setBoardInfo(new BoardInfo().fromFEN(newPosition));
        };
    });
    
    const onPress = (piece: Piece, row: number, column: number) => {
        if (piece !== undefined && firstPress === undefined && boardInfo.turn == piece.color) {
            setFirstPress(piece);
        } else if (firstPress !== undefined) {
            if (firstPress === piece) {
                setFirstPress(undefined);
            } else {
                const moves = firstPress.possibleMoves(boardInfo);
                for (let move of moves) {
                    if (move.row === row && move.column === column) {
                        let movePGN: string = '';
                        if (firstPress.symbol === 'p') {
                            if ( move.type === 'capture') movePGN += 'abcdefgh'[firstPress.column - 1] + 'x';
                        } else {
                            movePGN += firstPress.symbol.toUpperCase();
                            if (move.type === 'capture') movePGN += 'x';
                        }
                        movePGN += 'abcdefgh'[column - 1] + row;
                        props.onMove(movePGN)
                        setFirstPress(undefined);
                        setLastMove({previousPosition: {row: firstPress.row, column: firstPress.column}, move});
                        break;
                    }
                }
            }
        } else {
            setFirstPress(undefined);
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