import { Canvas } from '../interfaces/canvas';

export class Chessboard implements Canvas {
    positionFEN: string;
    callback = (newPosition: string) => {};

    draw(newPosition: string) {
        console.log(`drawing ${newPosition}`)
        this.positionFEN = newPosition;
        this.callback(newPosition);
    }
}
