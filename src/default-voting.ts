import { Vote } from './vote';
import { EventEmitter } from 'events';
import { VoteBuffer } from './vote-buffer';
import { Config } from './config';

const { voting } = Config.instance;

export interface DefaultResult {
  [key: number]: number;
}

export class DefaultVoting extends EventEmitter {
  private map: Map<string, number> = new Map<string, number>();
  private buffer: VoteBuffer = new VoteBuffer();
  private active: boolean = false;
  private checkInterval?: NodeJS.Timer;
  private endTimeout?: NodeJS.Timer;
  private resultInterval?: NodeJS.Timer;

  constructor() {
    super();
  }

  public handleVote(vote: Vote): void {
    this.buffer.addVote(vote);
    if (this.active) {

      this.addVote(vote);

      if (this.buffer.voteCount() <= voting.endCount) {
        return this.end();
      }
    } else {
      if (this.buffer.voteCount() >= voting.startCount) {
        this.start();
      }
    }
  }

  private addVote(vote: Vote) {
    this.map.set(vote.username, vote.value);
  }

  private start() {
    this.active = true;

    this.resultInterval = setInterval(
      () => this.emit('result', this.getResult()),
      voting.resultInterval * 1000);

    this.checkInterval = setInterval(
      () => {
        if (this.buffer.voteCount() <= voting.endCount) {
          this.end();
        }
      },
      voting.bufferSize * 1000);

    this.endTimeout = setTimeout(
      () => this.end(),
      voting.maxTime * 1000);

    for (const vote of this.buffer.getBuffer()) {
      this.addVote(vote);
    }

    this.emit('start', this.getResult());
  }

  public kill() {
    this.active = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (this.endTimeout) {
      clearTimeout(this.endTimeout);
    }

    if (this.resultInterval) {
      clearInterval(this.resultInterval);
    }

    this.checkInterval = undefined;
    this.endTimeout = undefined;
    this.resultInterval = undefined;
    this.buffer = new VoteBuffer();
    this.map = new Map<string, number>();
  }

  private end() {
    this.emit('end', this.getResult());
    this.kill();
  }

  public getResult() {
    const entries = [...this.map.entries()];

    return entries.reduce(
      (map, [user, num]) => {
        map[num] = (map[num] || 0) + 1;
        return map;
      },
      {} as { [key: number]: number },
    );
  }
}
