import React from 'react';
import { useEffect, useState, FunctionComponent } from 'react';
import { Chessboard } from '../common/core/chessboard';
import { BoardInfo } from '../common/core/board-info';
import { Piece } from '../common/pieces/piece';
import WhitePawn from '../images/pawn_white.svg';
import BlackPawn from '../images/pawn_black.svg';
import WhiteRock from '../images/rook_white.svg';
import BlackRock from '../images/rook_black.svg';
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

const getComponent = (piece: Piece) => {
    if (piece === undefined) return null;

    let char = piece.color === 'white' ? piece.symbol.toUpperCase() : piece.symbol.toLowerCase();
    switch (char) {
        case 'P':
            return <img src={WhitePawn} alt="WhitePawn"/>;
        case 'R':
            return <img src={WhiteRock} alt="WhiteRock"/>;
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
            return <img src={BlackRock} alt="BlackRock"/>;
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

const generateGridItems = (boardInfo: BoardInfo, onClick: Function) => {
    let items: any[] = [];

    for(let row = 8; row >= 1; row--) {
        for(let column = 1; column <= 8; column++) {
            let piece = boardInfo.get(row, column);
            let svg = getComponent(piece);
            let symbol = piece === undefined ? 'blank' : piece.getSymbol();
            items.push(
                <div key={symbol + row + column} className="square" onClick={() => onClick(piece, row, column)}>
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
    const [firstPress, setFirstPress] = useState<Piece>();

    useEffect(() => {
        props.chessboard.callback = (newPosition) => {
            setPositionFEN(newPosition);
            setBoardInfo(new BoardInfo().fromFEN(newPosition));
        };
    });
    
    const onClick = (piece: Piece, row: number, column: number) => {
        if (piece !== undefined && firstPress === undefined) {
            setFirstPress(piece);
        } else if (firstPress !== undefined) {
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
                    break;
                }
            }
            setFirstPress(undefined);
        } else {
            setFirstPress(undefined);
        }
    };

    const items = generateGridItems(boardInfo, onClick);

    return (
        <div className="chessboard">
            {items}
        </div>
    );
};