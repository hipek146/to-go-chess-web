import React from 'react';
import { Piece } from '../common/pieces/piece';
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

export const getComponent = (piece: Piece) => {
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