import React from 'react';
import { Subject } from 'rxjs';
import { Game } from '../common/core/game';
import { Chessboard } from '../common/core/chessboard';
import { Player } from '../common/interfaces/player';
import { WebChessboard } from './webChessboard';

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
  size: number;
}

interface Props {size: number}

class GameComponent extends React.Component<Props, State> {
  divElement: HTMLDivElement;

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
      size: props.size,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any) {
    this.setState({size: nextProps.size})
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
        <div style={styles}>
          <WebChessboard onMove={onMove} chessboard={chessboard} size={this.state.size}/>
        </div>
    );
  }
}

const styles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  userSelect: 'none',
}


export default GameComponent;
