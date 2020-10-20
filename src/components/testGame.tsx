import React from 'react';
import {Subject} from 'rxjs';
import {Game} from '../common/core/game';
import {Chessboard} from '../common/core/chessboard';
import {Player} from '../common/interfaces/player';

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
  inputTextWhite: string;
  inputTextBlack: string;
  gameState: string;
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
      whitePlayer: wp,
      blackPlayer: bp,
      inputTextWhite: '',
      inputTextBlack: '',
      chessboard: chessboard,
      gameState: '',
    };
  }

  render() {
    const {chessboard, whitePlayer, blackPlayer, inputTextWhite, inputTextBlack, gameState} = this.state;
    const onButtonPress = (player: string) => {
        if (player === 'black') {
            blackPlayer.move(inputTextBlack);
            console.log(inputTextBlack)
            this.setState({inputTextBlack: ''});
        } else {
            whitePlayer.move(inputTextWhite);
            console.log(inputTextWhite)
            this.setState({inputTextWhite: ''});
        }
        this.setState({gameState: `${gameState}<br>${chessboard.positionFEN}`});
    };


    return (
      <div>
        <input
          value={inputTextWhite}
          type="text"
          onChange={event => this.setState({inputTextWhite: event.target.value})}
        />
        <button onClick={() => onButtonPress('white')}> Wykonaj ruch białym </button>
        <input
          value={inputTextBlack}
          type="text"
          onChange={event => this.setState({inputTextBlack: event.target.value})}
        />
        <button onClick={() => onButtonPress('black')}> Wykonaj ruch czarnym </button>
        <div dangerouslySetInnerHTML={{__html: gameState}}/>
      </div>
    );
  }
}


export default TestGame;
