import React from 'react';
import { Subject } from 'rxjs';
import { connect } from 'react-redux';
import { Game } from '../common/core/game';
import { Chessboard } from '../common/core/chessboard';
import { Player } from '../common/interfaces/player';
import { SocketPlayer } from "../common/core/socket-player";
import { bindActionCreators } from "redux";
import { openDialog, closeDialog, gameCreated, gameTreeUpdated, gameObjectCreated, disableTreeMovement } from "../actions";
import { StockfishPlayer } from '../common/core/stockfish-player';
import { ChessPlayer } from '../common/core/chess-player';
import WebChessboard from './WebChessboard';
import ChessClockConfig from '../common/timer/chess-clock-config';
import GameInfo from './GameInfo';
import ChessClock from '../common/timer/chess-clock';

const clockConfig: ChessClockConfig = {
  initMsBlack: 300 * 1000,
  initMsWhite: 300 * 1000,
  stepBlack: 1,
  stepWhite: 1,
  mode: {
    type: 'standard',
  },
  endCallback: (winner: string) => {
    console.log(winner + 'wins');
  }
}

interface State {
  currentPlayer: Player;
  size: number;
  game: Game;
}

interface Props {
  size: number, 
  // store
  config, 
  newGame,
  // actions 
  openDialog, 
  closeDialog, 
  gameCreated, 
  gameTreeUpdated, 
  gameObjectCreated, 
  disableTreeMovement
}

class GameComponent extends React.Component<Props, State> {
  divElement: HTMLDivElement;
  color: 'white' | 'black';
  ws: WebSocket;
  mode: string;
  clearBoard: Subject<void> = new Subject<void>();

  constructor(props: Props) {
    super(props);

    this.state = {
      currentPlayer: undefined,
      size: props.size,
      game: undefined
    }
  }

  componentDidMount() {
    this.mode = 'twoPlayers';
    this.newGame(undefined, 'standard');
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

  newGame(newColor?: string, newClockType?: string) {
    this.clearBoard.next();
    if (this.mode === 'onlineGame') {
      this.newOnlineGame(newColor || this.props.config.color, newClockType || this.props.config.clockType);
    }
    else if (this.mode === 'twoPlayers') {
      this.color = 'white'
      this.init(new ChessPlayer(),  newClockType || this.props.config.clockType);
    }
    else if (this.mode === 'singleGame') {
      this.color = this.props.config.color;
      this.init(new StockfishPlayer(15),  newClockType || this.props.config.clockType);
    }
  }

  newOnlineGame(color, clockType) {
    this.props.openDialog(
        <div>
          Oczekiwanie na przeciwnika...
        </div>
        , () => {
          this.ws.close();
        }
    )
    this.ws = new WebSocket('wss://to-go-chess-sockets.herokuapp.com')
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
        this.init(new SocketPlayer(this.ws), clockType);
      }
    };
  }

  init(opponent: Player, clockType: string) {
    let chessboard = new Chessboard();
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
    clockConfig.endCallback = (winner: string) => {
      this.onEndGame(winner);
    };
    clockConfig.mode = {
      type: clockType,
      toAdd: 5000
    }
    let chessClock = new ChessClock(clockConfig);
    game.init({canvas: chessboard, whitePlayer: wp, chessClock, blackPlayer: bp});
    if (this.mode === 'singleGame') {
      // @ts-ignore
      opponent.setBoardInfo(game.getBoardInfo());
      if (this.color === 'black') {
        // @ts-ignore
        opponent.makeFirstMove();
      }
    }

    this.props.gameObjectCreated(game);
    this.props.disableTreeMovement();
    this.props.gameTreeUpdated(game.getTree().toSerializable());
    this.setState({
      currentPlayer: me,
      game
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
      game
    } = this.state;

    const onMove = (move: string) => {
      if (this.mode === 'onlineGame' || this.mode === 'singleGame') {
        currentPlayer.move(move);
      }
      else {
          if (game.getTurn() === 'white') {
              game.whitePlayer.move(move);
              this.color = 'black';
          } else {
              game.blackPlayer.move(move);
              this.color = 'white';
          }
      }
    this.props.gameTreeUpdated(game.getTree().toSerializable());
    };

    return (
        <div style={styles}>
          { game ? 
            <>
              <GameInfo/>
              <WebChessboard
                onMove={onMove}
                chessboard={game.getChessboard()}
                turn={this.color}
                mode={this.mode}
                size={this.state.size}
              /> 
            </>
            : undefined
          }
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
        gameTreeUpdated,
        gameObjectCreated,
        disableTreeMovement
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
