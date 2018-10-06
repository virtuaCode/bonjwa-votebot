import { Config } from './config';
import { Vote } from './vote';

const { voting } = Config.instance;

export class VoteBuffer {
  private buffer: Map<string, Vote>;

  constructor() {
    this.buffer = new Map<string, Vote>();
  }

  addVote(vote: Vote) {
    this.buffer.set(vote.username, vote);
    const limit = Date.now() - voting.bufferSize * 1000;

    for (const [username, vote] of this.buffer.entries()) {
      if (vote.time < limit) {
        this.buffer.delete(username);
      }
    }
  }

  voteCount() {
    return this.getBuffer().length;
  }

  getBuffer() {
    const limit = Date.now() - voting.bufferSize * 1000;
    return [...this.buffer.values()].filter(m => m.time >= limit);
  }
}
