import React from 'react';
import { Piece } from '../common/pieces/piece';
import { ReactComponent as WhitePawn } from '../images/pawn_white.svg';
import { ReactComponent as BlackPawn } from '../images/pawn_black.svg';
import { ReactComponent as WhiteRook } from '../images/rook_white.svg';
import { ReactComponent as BlackRook } from '../images/rook_black.svg';
import { ReactComponent as WhiteKnight } from '../images/knight_white.svg';
import { ReactComponent as BlackKnight } from '../images/knight_black.svg';
import { ReactComponent as WhiteBishop } from '../images/bishop_white.svg';
import { ReactComponent as BlackBishop } from '../images/bishop_black.svg';
import { ReactComponent as WhiteKing } from '../images/king_white.svg';
import { ReactComponent as BlackKing } from '../images/king_black.svg';
import { ReactComponent as WhiteQueen } from '../images/queen_white.svg';
import { ReactComponent as BlackQueen } from '../images/queen_black.svg';

export const getComponent = (piece: Piece) => {
    if (piece === undefined) return null;

    let char = piece.color === 'white' ? piece.symbol.toUpperCase() : piece.symbol.toLowerCase();
    switch (char) {
        case 'P':
            return <WhitePawn/>;
        case 'R':
            return <WhiteRook/>;
        case 'N':
            return <WhiteKnight/>;
        case 'B':
            return <WhiteBishop/>;
        case 'Q':
            return <WhiteQueen/>;
        case 'K':
            return <WhiteKing/>;
        case 'p':
            return <BlackPawn/>;
        case 'r':
            return <BlackRook/>;
        case 'n':
            return <BlackKnight/>;
        case 'b':
            return <BlackBishop/>;
        case 'q':
            return <BlackQueen/>;
        case 'k':
            return <BlackKing/>;
        default:
            return null;
    }
}