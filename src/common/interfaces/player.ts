import { Subject } from 'rxjs';

export interface Player {
	color: 'white' | 'black';
	emitMove: any;
	move(move: string): void;
	receiveMove(move: string): void;
}
