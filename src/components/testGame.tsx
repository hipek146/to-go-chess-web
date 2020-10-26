import React from 'react';
import {Subject} from 'rxjs';
import {Game} from '../common/core/game';
import {Chessboard} from '../common/core/chessboard';
import {Player} from '../common/interfaces/player';
import {WebChessboard} from './webChessboard';

class ChessPlayer implements Player {
  color: 'white' | 'black';
  emitMove: Subject<string> = new Subject<string>();

  move(move: string) {
    this.emitMove.next(move);
  }

  receiveMove(move: string) {
    console.log(this.color + ' player received: ' + move);
  }
}

interface State {
  whitePlayer: ChessPlayer;
  blackPlayer: ChessPlayer;
  chessboard: Chessboard;
  currentPlayer: ChessPlayer;
}

interface Props {}

class TestGame extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let game = new Game();
    let chessboard = new Chessboard();
    let wp = new ChessPlayer();
    let bp = new ChessPlayer();
    game.init({canvas: chessboard, whitePlayer: wp, blackPlayer: bp});

    this.state = {
      currentPlayer: wp,
      whitePlayer: wp,
      blackPlayer: bp,
      chessboard: chessboard,
    };
  }

  render() {
    const {
      currentPlayer,
      chessboard,
      whitePlayer,
      blackPlayer,
    } = this.state;

    const onMove = (move: string) => {
      currentPlayer.move(move);
      if (currentPlayer === whitePlayer)
        this.setState({ currentPlayer: blackPlayer });
      if (currentPlayer === blackPlayer)
        this.setState({ currentPlayer: whitePlayer });
    };

    return (
      <WebChessboard onMove={onMove} chessboard={chessboard}/>
    );
  }
}


export default TestGame;
