import { Subscription } from 'rxjs';
import { Subscribable } from 'rxjs/Observable';
import { Canvas } from '../interfaces/canvas';
import { Player } from '../interfaces/player';
import { Bishop } from '../pieces/bishop';
import { King } from '../pieces/king';
import { Knight } from '../pieces/knight';
import { Pawn } from '../pieces/pawn';
import { PieceConfig } from '../pieces/piece-config';
import { Queen } from '../pieces/queen';
import { Rook } from '../pieces/rook';
import { BoardInfo } from './board-info';

export class Game {

	private whitePlayer: Player;
	private blackPlayer: Player;

	private canvas: Canvas;

	private turn: Player;

	private positionFEN: string;

	private boardInfo: BoardInfo;

	private halfmoveClock: number;
	private fullmoveNumber: number;

	private whiteSubscription: Subscription;
	private blackSubscription: Subscription;

	private check: boolean;
	private mate: boolean;

	init(config: {canvas: Canvas, whitePlayer: Player, blackPlayer: Player, positionFEN?: string}) {
		this.canvas = config.canvas;
		this.whitePlayer = config.whitePlayer;
		this.blackPlayer = config.blackPlayer;
		this.boardInfo = new BoardInfo();

		this.positionFEN = config.positionFEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

		this.updateGameWithFEN();

		if (this.whiteSubscription) this.whiteSubscription.unsubscribe();
		if (this.blackSubscription) this.blackSubscription.unsubscribe();

		this.whiteSubscription = this.whitePlayer.emitMove.subscribe((move) => this.onMove(this.whitePlayer, move));
		this.whitePlayer.color = 'white';
		this.blackSubscription = this.blackPlayer.emitMove.subscribe((move) => this.onMove(this.blackPlayer, move));
		this.blackPlayer.color = 'black';


		this.canvas.draw(this.positionFEN);
	}


	private onMove(player: Player, move: string) {
		if (this.turn === player) {
			try {
				move = this.changePosition(move);
				this.updateFENWithGame();
				this.canvas.draw(this.positionFEN);

				if (player.color === 'white') {
					if (this.mate) {
						this.blackPlayer.receiveMove(move + '#');
					}
					else if (this.check) {
						this.blackPlayer.receiveMove(move + '+');
					}
					else {
						this.blackPlayer.receiveMove(move);
					}
				}
				else {
					if (this.mate) {
						this.whitePlayer.receiveMove(move + '#');
					}
					else if (this.check) {
						this.whitePlayer.receiveMove(move + '+');
					}
					else {
						this.whitePlayer.receiveMove(move);
					}
				}
			}
			catch(e) {
				console.warn(e.message);
			}
		}
	}

	private changeTurn() {
		if (this.turn.color === 'white') {
			this.turn = this.blackPlayer;
		}
		else {
			this.turn = this.whitePlayer;
		}
	}

	private changePosition (move: string): string {
		if (!move) throw new Error ('blank move');

		if (move === 'O-O' || move === 'O-O+' || move === 'O-O#') {
			const row = this.turn.color === 'white' ? 1 : 8;
			let king = this.boardInfo.find('k', this.turn.color).filter(piece => {
				return piece.checkMove(this.boardInfo, row, 7, 'kingsideCastle');
			});
			if (king[0]) {
				king[0].move(row, 7);
				this.boardInfo.moved(king[0], row, 5);
				const rook = this.boardInfo.get(row, 8);
				rook.move(row, 6);;
				this.boardInfo.moved(rook, row, 8);
				if (this.turn.color === 'white') {
					this.boardInfo.castlingAvailability.white = {kingside: false, queenside: false};
				}
				else {
					this.boardInfo.castlingAvailability.black = {kingside: false, queenside: false};
				}
				this.check = false;
				this.mate = false;
				const check = this.boardInfo.isCheck();
				if (check.black || check.white) {
					this.check = true;
				}
				const whiteKing = this.boardInfo.find('k', 'white')[0];
				const blackKing = this.boardInfo.find('k', 'black')[0];
				if (whiteKing.possibleMoves(this.boardInfo).length === 0 || blackKing.possibleMoves(this.boardInfo).length === 0) {
					this.mate = true;
				}
				this.boardInfo.enPassant = {
					row: undefined,
					column: undefined,
				};
				this.halfmoveClock++;
				if (this.turn.color === 'black') {
					this.fullmoveNumber++;
				}
				move = move.slice(0, 3);
				this.changeTurn();
				return move;
			}
			else {
				throw new Error ('invalid move');
			}
		}
		if (move === 'O-O-O' || move === 'O-O-O+' || move === 'O-O-O#') {
			const row = this.turn.color === 'white' ? 1 : 8;
			let king = this.boardInfo.find('k', this.turn.color).filter(piece => {
				return piece.checkMove(this.boardInfo, row, 3, 'queensideCastle');
			});
			if (king[0]) {
				king[0].move(row, 3);
				this.boardInfo.moved(king[0], row, 5);
				const rook = this.boardInfo.get(row, 1);
				rook.move(row, 4);;
				this.boardInfo.moved(rook, row, 1);
				if (this.turn.color === 'white') {
					this.boardInfo.castlingAvailability.white = {kingside: false, queenside: false};
				}
				else {
					this.boardInfo.castlingAvailability.black = {kingside: false, queenside: false};
				}
				this.check = false;
				this.mate = false;
				const check = this.boardInfo.isCheck();
				if (check.black || check.white) {
					this.check = true;
				}
				const whiteKing = this.boardInfo.find('k', 'white')[0];
				const blackKing = this.boardInfo.find('k', 'black')[0];
				if (whiteKing.possibleMoves(this.boardInfo).length === 0 || blackKing.possibleMoves(this.boardInfo).length === 0) {
					this.mate = true;
				}
				this.boardInfo.enPassant = {
					row: undefined,
					column: undefined,
				};
				this.halfmoveClock++;
				if (this.turn.color === 'black') {
					this.fullmoveNumber++;
				}
				move = move.slice(0, 5);
				this.changeTurn();
				return move;
			}
			else {
				throw new Error ('invalid move');
			}
		}

		let symbol: string;
		let offset = 0;
		let type: 'move' | 'capture' = 'move';
		let promotion = '';

		if(['R', 'N', 'B', 'Q', 'K'].includes(move[0])) {
			symbol = move[0].toLowerCase();
			offset = 1;
		}
		else {
			symbol = 'p';
		}

		let specifiedRow: number;
		let specifiedColumn: number;

		if(move[offset] !== 'x' && ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'x'].includes(move[offset + 1])) {
			if (Number(move[offset]) >= 1 && Number(move[offset]) <= 8) {
				specifiedRow = Number(move[offset]);
			}
			else {
				const specifieLetter = move[offset].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
				if (specifieLetter >= 1 && specifieLetter <= 8) {
					specifiedColumn = specifieLetter;
				}
				else {
					throw new Error ('invalid move');
				}
			}
			offset++;
		}

		if (move[offset] === 'x') {
			type = 'capture';
			offset++;
		}

		const destinationColumn = move[offset].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
		offset++;
		const destinationRow = Number(move[offset]);
		offset++;

		move = move.slice(0, offset);

		if (symbol === 'p' && move[offset] === '=' && ['Q', 'R', 'N', 'B'].includes(move[offset + 1])) {
			promotion = this.turn.color === 'white' ? move[offset + 1] : move[offset + 1].toLowerCase();
		}

		if (symbol === 'p' && (destinationRow === 1 || destinationRow === 8) && !promotion) {
			throw new Error ('invalid move');
		}

		if (destinationRow < 1 || destinationRow > 8 || destinationColumn < 1 || destinationColumn > 8) {
			throw new Error ('invalid move');
		}

		let pieces = this.boardInfo.find(symbol, this.turn.color).filter(piece => {
				return piece.checkMove(this.boardInfo, destinationRow, destinationColumn, type);
		});
		pieces = pieces.filter(piece =>{
			if(specifiedRow) return piece.row === specifiedRow;
			else if(specifiedColumn) return piece.column === specifiedColumn;
			else return true;
		})
		if (pieces.length !== 1) {
			throw new Error ('invalid move');
		}
		let piece = pieces[0];
		const oldRow = piece.row;
		const oldColumn = piece.column;

		if (promotion) {
			piece = this.mapToPiece(promotion, destinationRow, destinationColumn);
		}
		
		piece.move(destinationRow, destinationColumn);
		this.boardInfo.moved(piece, oldRow, oldColumn);
		if (symbol === 'p' && type === 'capture' 
			&& destinationColumn === this.boardInfo.enPassant.column && destinationRow === this.boardInfo.enPassant.row ) {
				this.boardInfo.capture(piece.color === 'white' ? 5 : 4, destinationColumn)
			}
		
		this.boardInfo = this.boardInfo;

		this.boardInfo.enPassant = {
			row: undefined,
			column: undefined,
		};
		if (symbol === 'p' && Math.abs(oldRow - destinationRow) === 2) {
			let enPassant = {
				column: destinationColumn,
				row: piece.color === 'white' ? 3 : 6
			};
			let checkPawn = this.boardInfo.get(destinationRow, destinationColumn + 1);
			if (checkPawn && checkPawn.color !== piece.color) {
				const boardInfoCopy = this.boardInfo.copy();
				const piece = checkPawn.copy();
				const pieceOldRow = piece.row;
				const pieceOldColumn = piece.column;
				piece.move(enPassant.row, enPassant.column);
				boardInfoCopy.moved(piece, pieceOldRow, pieceOldColumn);
				boardInfoCopy.capture(piece.color === 'white' ? 5 : 4, enPassant.column);
				const check = boardInfoCopy.isCheck();
				if ((checkPawn.color === 'white' && !check.white) || (checkPawn.color === 'black' && !check.black)) {
					this.boardInfo.enPassant = enPassant;
				}
			}
			checkPawn = this.boardInfo.get(destinationRow, destinationColumn - 1);
			if (checkPawn && checkPawn.color !== piece.color) {
				const boardInfoCopy = this.boardInfo.copy();
				const piece = checkPawn.copy();
				const pieceOldRow = piece.row;
				const pieceOldColumn = piece.column;
				piece.move(enPassant.row, enPassant.column);
				boardInfoCopy.moved(piece, pieceOldRow, pieceOldColumn);
				boardInfoCopy.capture(piece.color === 'white' ? 5 : 4, enPassant.column);
				const check = boardInfoCopy.isCheck();
				if ((checkPawn.color === 'white' && !check.white) || (checkPawn.color === 'black' && !check.black)) {
					this.boardInfo.enPassant = enPassant;
				}
			}
		}

		this.check = false;
		this.mate = false;
		const check = this.boardInfo.isCheck();
		if (check.black || check.white) {
			this.check = true;
		}
		const whiteKing = this.boardInfo.find('k', 'white')[0];
		const blackKing = this.boardInfo.find('k', 'black')[0];
		if (whiteKing.possibleMoves(this.boardInfo).length === 0 || blackKing.possibleMoves(this.boardInfo).length === 0) {
			if (this.check) {
				this.mate = true;
			}
		}

		if (symbol === 'k') {
			if (this.turn.color === 'white') {
				this.boardInfo.castlingAvailability.white = {kingside: false, queenside: false};
			}
			else {
				this.boardInfo.castlingAvailability.black = {kingside: false, queenside: false};
			}
		}
		if (symbol === 'r') {
			if (this.turn.color === 'white') {
				if (oldColumn === 8 && oldRow === 1) {
					this.boardInfo.castlingAvailability.white.kingside = false;
				}
				else if (oldColumn === 1 && oldRow === 1) {
					this.boardInfo.castlingAvailability.white.queenside = false;
				}
			}
			else {
				if (oldColumn === 8 && oldRow === 8) {
					this.boardInfo.castlingAvailability.black.kingside = false;
				}
				else if (oldColumn === 1 && oldRow === 8) {
					this.boardInfo.castlingAvailability.black.queenside = false;
				}
			}
		}

		if (piece.getSymbol() !== 'p' && type !== 'capture') {
			this.halfmoveClock++;
		}
		else {
			this.halfmoveClock = 0;
		}

		if (this.turn.color === 'black') {
			this.fullmoveNumber++;
		}

		this.changeTurn();
		return move;
	}

	private updateGameWithFEN() {
		const positionFEN = this.positionFEN;

		//this.pieces = [];

		let column = 1;
		let row = 8;
		let i: number;

		for(i = 0; positionFEN[i] !== ' '; i++) {
			if(positionFEN[i] === '/') {
				row--;
				column = 1;
				continue;
			}
			const number = Number(positionFEN[i]);
			if (isNaN(number)) {
				this.boardInfo.set(this.mapToPiece(positionFEN[i], row, column));;
				column++;
			}
			else {
				column += number;
			}
		}

		i++;
		if (positionFEN[i] === 'w') {
			this.turn = this.whitePlayer;
		}
		else {
			this.turn = this.blackPlayer;
		}
		i+=2;
		const endCastlingIndex = positionFEN.indexOf(' ', i);
		const castlingFEN = positionFEN.substring(i, endCastlingIndex);
		this.boardInfo.castlingAvailability = {
			white: {kingside: false, queenside: false},
			black: {kingside: false, queenside: false}
		}
		if(castlingFEN !== '-') {
			while (positionFEN[i] != ' ') {
				switch (positionFEN[i]) {
					case 'K':
						this.boardInfo.castlingAvailability.white.kingside = true;
						break;
					case 'Q':
						this.boardInfo.castlingAvailability.white.queenside = true;
						break;
					case 'k':
						this.boardInfo.castlingAvailability.black.kingside = true;
						break;
					case 'q':
						this.boardInfo.castlingAvailability.black.queenside = true;
						break;
				}
				i++;
			}
			i--;
		}
		i+=2;
		if (positionFEN[i] !== '-') {
			const column = positionFEN[i].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
			i++;
			const row = Number(positionFEN[i])
			this.boardInfo.enPassant = {row, column};
		}
		i+=2;
		const endHalfmoveIndex = positionFEN.indexOf(' ', i);
		const halfmoveFEN = positionFEN.substring(i, endHalfmoveIndex);
		this.halfmoveClock = Number(halfmoveFEN);
		i = endHalfmoveIndex + 1;
		
		const fullmoveFEN = positionFEN.substring(i);
		this.fullmoveNumber = Number(fullmoveFEN);
	}

	private updateFENWithGame() {
		let FEN = '';
		for (let row = 8; row > 0; row--) {
			let blank = 0;
			for (let column = 1; column <= 8; column++) {
				let piece = this.boardInfo.get(row, column);
				if (piece) {
					if (blank) {
						FEN += blank;
					}
					FEN += piece.color === 'white' ?
						piece.getSymbol().toUpperCase() : piece.getSymbol().toLowerCase();
					blank = 0;
				}
				else {
					blank++;
				}
			}
			if (blank) {
				FEN += blank;
			}
			if (row > 1) {
				FEN += '/'
			}
		}

		let castlingAvailability = '';
		castlingAvailability += this.boardInfo.castlingAvailability.white.kingside ? 'K' : '';
		castlingAvailability += this.boardInfo.castlingAvailability.white.queenside ? 'Q' : '';
		castlingAvailability += this.boardInfo.castlingAvailability.black.kingside ? 'k' : '';
		castlingAvailability += this.boardInfo.castlingAvailability.black.queenside ? 'q' : '';

		if (!castlingAvailability) {
			castlingAvailability = '-'
		}

		let enPassant: string;
		if (!this.boardInfo.enPassant.row || !this.boardInfo.enPassant.column) {
			enPassant = '-';
		}
		else {
			enPassant = String.fromCharCode('a'.charCodeAt(0) + this.boardInfo.enPassant.column - 1)
				+ this.boardInfo.enPassant.row;
		}

		this.positionFEN = FEN + ' ' 
			+ (this.turn.color === 'white' ? 'w' : 'b') + ' '
			+ castlingAvailability + ' '
			+ enPassant + ' '
			+ this.halfmoveClock + ' '
			+ this.fullmoveNumber;
	}

	private mapToPiece(letter: string, row: number, column: number) {
		const color = letter.toUpperCase() === letter ? 'white' : 'black';
		const config: PieceConfig = {
			color, row, column
		}
		switch (letter.toLowerCase()) {
			case 'r':
				return new Rook(config);
			case 'n':
				return new Knight(config);
			case 'b':
				return new Bishop(config);
			case 'q':
				return new Queen(config);
			case 'k':
				return new King(config);
			default:
				return new Pawn(config);
		}
	}

}
