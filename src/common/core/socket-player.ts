import { Subject } from "rxjs";
import { Player } from "../interfaces/player";
import ChessClock from "../timer/chess-clock";

export class SocketPlayer implements Player {
    color: 'white' | 'black';
    emitMove: Subject<string> = new Subject<string>();
    webSocket: WebSocket;
    chessClock: ChessClock;

    constructor(ws: WebSocket) {
        this.webSocket = ws;
        ws.onmessage = (event) => {
            let msg = JSON.parse(String(event.data));
            if (msg.type === 'receive') {
                this.move(msg.move);
                if (this.chessClock) {
                    this.chessClock.setTimes(msg.time);
                }
            }
        };
    }

    setChessClock(chessClock: ChessClock) {
        this.chessClock = chessClock;
    }

    move(move: string) {
        this.emitMove.next(move);
    }

    receiveMove(move: string) {
        this.webSocket.send(JSON.stringify({type: 'move', move: move}));
    }
}
