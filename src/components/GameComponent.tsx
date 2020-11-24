import React from 'react';
import { Subject } from 'rxjs';
import { connect } from 'react-redux';
import { Game } from '../common/core/game';
import { Chessboard } from '../common/core/chessboard';
import { Player } from '../common/interfaces/player';
import { SocketPlayer } from "../common/core/socket-player";
import { bindActionCreators } from "redux";
import { openDialog, closeDialog, gameCreated, gameTreeUpdated, gameObjectCreated } from "../actions";
import { StockfishPlayer } from '../common/core/stockfish-player';
import { ChessPlayer } from '../common/core/chess-player';
import GameTree from '../common/game_tree/game-tree';
import WebChessboard from './WebChessboard';
import ChessClockConfig from '../common/timer/chess-clock-config';

const config: ChessClockConfig = {
  initMsBlack: 360 * 1000,
  initMsWhite: 360 * 1000,
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
  chessboard: Chessboard;
  currentPlayer: ChessPlayer;
  size: number;
  game: Game;
}

interface Props {size: number, config, newGame, openDialog, closeDialog, gameCreated, gameTreeUpdated, gameObjectCreated}

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
      chessboard: chessboard,
      currentPlayer: null,
      size: props.size,
      game: null
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
      this.init(new StockfishPlayer(15));
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
    game.init({canvas: this.state.chessboard, whitePlayer: wp, chessClockConfig: config, blackPlayer: bp});
    if (this.mode === 'singleGame') {
      // @ts-ignore
      opponent.setBoardInfo(game.getBoardInfo());
      if (this.color === 'black') {
        // @ts-ignore
        opponent.makeFirstMove();
      }
    }

    this.props.gameObjectCreated(game);

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
      chessboard,
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
        this.props.gameTreeUpdated(game.getTree().toSerializable());
      }
    };

    return (
        <div style={styles}>
          { game ? 
            <WebChessboard
              onMove={onMove}
              chessboard={chessboard}
              turn={this.color}
              mode={this.mode}
              clearBoard={this.clearBoard}
              size={this.state.size}
            /> 
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
        gameObjectCreated
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
