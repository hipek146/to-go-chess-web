import React from 'react';
import { connect } from 'react-redux';
import { Game } from '../common/core/game';
import { Chessboard } from '../common/core/chessboard';
import { bindActionCreators } from "redux";
import { openDialog, closeDialog, analysisCreated, gameTreeUpdated, gameObjectCreated, enableTreeMovement } from "../actions";
import { ChessPlayer } from '../common/core/chess-player';
import ChessClockConfig from '../common/timer/chess-clock-config';
import WebChessboard from './WebChessboard';

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
  size: number;
  game: Game;
}

interface Props {
    size: number, 
    // store
    newAnalysis, 
    movesPGN,
    // actions
    openDialog, 
    closeDialog, 
    gameTreeUpdated, 
    gameObjectCreated, 
    analysisCreated,
    enableTreeMovement
}

class GameAnalysis extends React.Component<Props, State> {
  divElement: HTMLDivElement;
  color: 'white' | 'black';

  constructor(props: Props) {
    super(props);

    this.state = {
      size: props.size,
      game: null
    }
  }

  componentDidMount() {
    if (this.props.newAnalysis) {
        this.newGame(this.props.movesPGN);
        this.props.analysisCreated();
    }
  }

  componentDidUpdate() {
    if (this.props.newAnalysis) {
        this.newGame(this.props.movesPGN);
        this.props.analysisCreated();
    }
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any) {
    this.setState({size: nextProps.size})
  }

  newGame(moves?: string) {
    let chessboard = new Chessboard();
    let game = new Game();
    game.event.subscribe((event) => {
      if (event.type === 'mate') {
        this.onEndGame(event.data)
      }
    });
    let wp = new ChessPlayer();
    let bp = new ChessPlayer();

    game.init({canvas: chessboard, whitePlayer: wp, chessClockConfig: clockConfig, blackPlayer: bp});

    if (moves) {
        const movesArr = moves.split(' ');
        let turn = 3;
        for(let i = 0; i < movesArr.length; i++) {
            if (!(turn % 3)) {
                turn = 1;
                continue;
            }
            if (turn === 1) {
                wp.move(movesArr[i]);
            } 
            else if (turn === 2) {
                bp.move(movesArr[i]);
            }
            turn++;
        }
    }

    this.props.gameObjectCreated(game);
    this.props.enableTreeMovement();
    this.props.gameTreeUpdated(game.getTree().toSerializable());
    this.setState({
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
      game
    } = this.state;

    const onMove = (move: string) => {
        if (game.getTurn() === 'white') {
            game.whitePlayer.move(move);
        } else {
            game.blackPlayer.move(move);
        }
        this.props.gameTreeUpdated(game.getTree().toSerializable());
    };

    return (
        <div style={styles}>
          { 
            game ? 
            <>
              <WebChessboard
                onMove={onMove}
                chessboard={game.getChessboard()}
                turn={game.getTurn()}
                mode={'twoPlayers'}
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
        analysisCreated,
        gameTreeUpdated,
        gameObjectCreated,
        enableTreeMovement
      },
      dispatch,
  ),
});

const mapStateToProps = (state: any) => {
  const {config, newAnalysis, movesPGN} = state.app;
  return {
    config,
    newAnalysis,
    movesPGN
  };
};

const WrappedGameAnalysis = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GameAnalysis);


export default WrappedGameAnalysis;
