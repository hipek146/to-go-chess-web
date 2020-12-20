import React from 'react';
import { Subject } from 'rxjs';
import { connect } from 'react-redux';
import { Game } from '../common/core/game';
import { Chessboard } from '../common/core/chessboard';
import { Player } from '../common/interfaces/player';
import { SocketPlayer } from "../common/core/socket-player";
import { bindActionCreators } from "redux";
import {
  openDialog,
  closeDialog,
  gameCreated,
  gameTreeUpdated,
  gameObjectCreated,
  disableTreeMovement,
  openToast, closeToast, gameInProgress, drawOffer, emoteSent
} from "../actions";
import { StockfishPlayer } from '../common/core/stockfish-player';
import { ChessPlayer } from '../common/core/chess-player';
import WebChessboard from './WebChessboard';
import ChessClockConfig from '../common/timer/chess-clock-config';
import GameInfo from './GameInfo';
import emotes from "../utils/emotes";
import "./GameComponent.css"

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
  status,
  emoteToSend,
  // actions 
  openDialog, 
  closeDialog,
  openToast,
  closeToast,
  gameCreated, 
  gameTreeUpdated, 
  gameObjectCreated, 
  disableTreeMovement,
  gameInProgress,
  drawOffer,
  emoteSent,
  botLevel
}

class GameComponent extends React.Component<Props, State> {
  divElement: HTMLDivElement;
  color: 'white' | 'black';
  ws: WebSocket;
  mode: string;
  clearBoard: Subject<void> = new Subject<void>();
  me: ChessPlayer;
  opponentDraw: boolean = false;

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

  componentDidUpdate(prevProps:Readonly<Props>) {
    if (this.props.newGame) {
      if (this.state.game) {
        this.state.game.stopClock();
      }
      this.mode = this.props.config.mode;
      this.newGame();
      this.props.gameCreated();
    }
    if (prevProps.status !== 'drawOffered' && this.props.status === 'drawOffered') {
      this.me.move('draw');
    }
    if (prevProps.status === 'drawOffered' && this.props.status !== 'drawOffered') {
      this.props.closeToast();
    }
    if (prevProps.status !== 'surrendered' && this.props.status === 'surrendered') {
      this.me.move('surrender');
    }
    if (this.props.emoteToSend !== undefined) {
      if (this.ws) {
        this.ws.send(JSON.stringify({type: 'emote', emote: this.props.emoteToSend}));
      }
      this.props.emoteSent();
    }
  }

  componentWillUnmount() {
    if (this.state.game) {
        this.state.game.stopClock();
    }
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any) {
    this.setState({size: nextProps.size})
  }

  newGame(newColor?: string, newClockType?: string) {
    this.clearBoard.next();
    if (this.opponentDraw) {
      this.opponentDraw = false;
      this.props.closeToast();
    }
    if (this.props.status !== 'inProgress') {
      this.props.gameInProgress();
    }
    if (this.mode === 'onlineGame') {
      this.newOnlineGame(newColor || this.props.config.color, newClockType || this.props.config.clockType);
    }
    else if (this.mode === 'twoPlayers') {
      this.color = 'white';
      this.init(new ChessPlayer(),  newClockType || this.props.config.clockType);
    }
    else if (this.mode === 'singleGame') {
      this.color = this.props.config.color;
      this.init(new StockfishPlayer(this.props.botLevel),  newClockType || this.props.config.clockType);
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
      this.ws.send(JSON.stringify({type: 'newGame', color, clockType}));
    }
    this.ws.onmessage = (event) => {
      let msg = JSON.parse(String(event.data));
      if (msg.type === 'config') {
        this.props.closeDialog();
        this.color = msg.color;
        this.init(new SocketPlayer(this.ws), clockType);
        /****  DANGEROUS  ******/
        const socketOnMessage = this.ws.onmessage;
        this.ws.onmessage = (event) => {
          socketOnMessage.call(this.ws, event);
          let msg = JSON.parse(String(event.data));
          if (msg.type === 'emote') {
            const emote = emotes.find(emote => emote.index === msg.emote);
            if (emote) {
              this.props.openToast(<img src={emote.res} className="GameComponent-emote" />, {fade: true});
            }
          }
        }
        /********** ********/
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
      else if (event.type === 'draw') {
        this.onEndGame('draw');
      }
      else if (event.type === 'draw_offer' && this.me.color !== event.data) {
        this.opponentDraw = true;
        this.props.openToast(
            <div>
              Przeciwnik proponuje remis.
              <div>
                <button onClick={() => {
                  this.me.move('draw');
                  this.props.closeToast();
                }}>Akceptuj</button>
                <button onClick={() => this.props.closeToast()}>Odrzuć</button>
              </div>
            </div>
        );
      }
      else if (event.type === 'surrender') {
        this.onEndGame(this.me.color === event.data ? 'me_surrender' : 'opponent_surrender');
      }
    });
    this.me = new ChessPlayer();
    const me = this.me;

    /****  DANGEROUS  ******/
    const superReceiveMove = me.receiveMove;
    me.receiveMove = (move: string) => {
      superReceiveMove(move);
      if (this.opponentDraw) {
        this.opponentDraw = false;
        this.props.closeToast();
      }
      if (this.props.status !== 'inProgress') {
        this.props.gameInProgress();
      }
    }
    /********** ********/

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
    game.init({canvas: chessboard, whitePlayer: wp, chessClockConfig: clockConfig, blackPlayer: bp});
    if (this.mode === 'singleGame') {
      // @ts-ignore
      opponent.setBoardInfo(game.getBoardInfo());
      if (this.color === 'black') {
        // @ts-ignore
        opponent.makeFirstMove();
      }
    }
    else if (this.mode === 'onlineGame') {
      //@ts-ignore
      opponent.setChessClock(game.getChessClock());
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
    if (this.opponentDraw) {
      this.opponentDraw = false;
      this.props.closeToast();
    }
    this.props.openDialog(
        <>
          <div>
            {status === 'draw' && 'Partia zakończona remisem'}
            {status === 'white' && 'Wygrywają białe'}
            {status === 'black' && 'Wygrywają czarne'}
            {status === 'me_surrender' && 'Poddałeś się'}
            {status === 'opponent_surrender' && 'Przeciwnik się poddał'}
          </div>
          <div><button onClick={() => {
            const color = this.color === 'white' ? 'black' : 'white';
            this.props.closeDialog();
            this.newGame(color, clockConfig.mode.type);
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
      if (this.opponentDraw) {
        this.opponentDraw = false;
        this.props.closeToast();
      }
      if (this.props.status !== 'inProgress') {
        this.props.gameInProgress();
      }
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
                size={this.state.size - 90}
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
        openToast,
        closeToast,
        gameCreated,
        gameTreeUpdated,
        gameObjectCreated,
        disableTreeMovement,
        gameInProgress,
        drawOffer,
        emoteSent,
      },
      dispatch,
  ),
});

const mapStateToProps = (state: any) => {
  const {config, newGame, status, emoteToSend, botLevel} = state.app;
  return {
    config,
    newGame,
    status,
    emoteToSend,
    botLevel
  };
};

const WrappedGameComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameComponent);


export default WrappedGameComponent;
