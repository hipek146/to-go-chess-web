import React from 'react';
import { Subject } from 'rxjs';
import {connect} from 'react-redux';
import { Game } from '../common/core/game';
import { Chessboard } from '../common/core/chessboard';
import { Player } from '../common/interfaces/player';
import { WebChessboard } from './webChessboard';
import {SocketPlayer} from "../common/core/socket-player";
import {bindActionCreators} from "redux";
import {openDialog, closeDialog, gameCreated} from "../actions";
import {StockfishPlayer} from '../common/core/stockfish-player';

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

interface Props {size: number, config, newGame, openDialog, closeDialog, gameCreated}

class GameComponent extends React.Component<Props, State> {
  divElement: HTMLDivElement;
  color: 'white' | 'black';
  ws: WebSocket;
  mode: string;
  clearBoard: Subject<void> = new Subject<void>();

  constructor(props: Props) {
    super(props);

    let chessboard = new Chessboard();

    this.state = {
      whitePlayer: null,
      blackPlayer: null,
      chessboard: chessboard,
      currentPlayer: null,
      size: props.size,
    }
  }

  componentDidMount() {
    this.mode = 'twoPlayers';
    this.newGame();
  }

  componentDidUpdate() {
    if (this.props.newGame) {
      this.mode = this.props.config.mode;
      this.newGame();
      this.props.gameCreated();
    }
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any) {
    this.setState({size: nextProps.size})
  }

  newGame(newColor?) {
    this.clearBoard.next();
    if (this.mode === 'onlineGame') {
      this.newOnlineGame(newColor || this.props.config.color);
    }
    else if (this.mode === 'twoPlayers') {
      this.color = 'white'
      this.init(new ChessPlayer());
    }
    else if (this.mode === 'singleGame') {
      this.color = this.props.config.color;
      this.init(new StockfishPlayer(10));
    }
  }

  newOnlineGame(color) {
    this.props.openDialog(
        <div>
          Oczekiwanie na przeciwnika...
        </div>
        , () => {
          this.ws.close();
        }
    )
    this.ws = new WebSocket('ws://localhost:9000')
    this.ws.onerror = (event) => {
      this.props.openDialog(
          <div>
            Błąd połączenia...
          </div>
      )
    }
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({type: 'newGame', color}));
    }
    this.ws.onmessage = (event) => {
      let msg = JSON.parse(String(event.data));
      if (msg.type === 'config') {
        this.props.closeDialog();
        this.color = msg.color;
        this.init(new SocketPlayer(this.ws));
      }
    };
  }

  init(opponent: Player) {
    let game = new Game();
    game.event.subscribe((event) => {
      if (event.type === 'mate') {
        this.onEndGame(event.data)
      }
    });
    const me = new ChessPlayer();
    let wp;
    let bp;
    if (this.color === 'white') {
      wp = me;
      bp = opponent;
    }
    else {
      wp = opponent;
      bp = me;
    }
    game.init({canvas: this.state.chessboard, whitePlayer: wp, blackPlayer: bp});
    if (this.mode === 'singleGame') {
      // @ts-ignore
      opponent.setBoardInfo(game.getBoardInfo());
      if (this.color === 'black') {
        // @ts-ignore
        opponent.makeFirstMove();
      }
    }

    this.setState({
      currentPlayer: me,
      whitePlayer: wp,
      blackPlayer: bp,
    });
  }

  onEndGame(status) {
    this.props.openDialog(
        <>
          <div>
            {status === 'draw' && 'Remis'}
            {status === 'white' && 'Wygrywają białe'}
            {status === 'black' && 'Wygrywają czarne'}
          </div>
          <div><button onClick={() => {
            const color = this.color === 'white' ? 'black' : 'white';
            this.props.closeDialog();
            this.newGame(color);
          }}>Zagraj jeszcze raz</button></div>
        </>
    )
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
      if (this.mode === 'twoPlayers') {
        if (currentPlayer === whitePlayer) {
          this.color = 'black';
          this.setState({currentPlayer: blackPlayer});
        }
        if (currentPlayer === blackPlayer) {
          this.color = 'white';
          this.setState({currentPlayer: whitePlayer});
        }
      }
    };

    return (
        <div style={styles}>
          <WebChessboard
              onMove={onMove}
              chessboard={chessboard}
              turn={this.color}
              clearBoard={this.clearBoard}
              size={this.state.size}
          />
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

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
      {
        openDialog,
        closeDialog,
        gameCreated,
      },
      dispatch,
  ),
});

const mapStateToProps = (state: any) => {
  const {config, newGame} = state.app;
  return {
    config,
    newGame,
  };
};

const WrappedGameComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameComponent);


export default WrappedGameComponent;
