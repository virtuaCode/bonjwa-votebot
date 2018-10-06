import { DefaultResult } from './default-voting';
import { median } from 'mathjs';
import { Mode } from './main';
import { Config } from './config';

const { medianThreshold } = Config.instance.voting;

export class VoteService {

  public formatResult(result: DefaultResult, mode: Mode): string {
    switch (mode) {
      case 'NORMAL':
        const entries = [
          ['①', result[1]],
          ['②', result[2]],
          ['③', result[3]],
        ];
        const resultString =
          entries
            .filter(([label, value]) => value !== undefined)
            .map(([label, value]) => `${label} ${value}`)
            .join(' ');
        return resultString;

      case 'MEDIAN':
        const median = this.findMedian(result);
        return String(median);
    }

  }

  public isMedianResult(result: DefaultResult) {
    const entries = [...Object.entries(result)];
    const grouped = entries.reduce(
      (sum, [val, count]) => {
        if (['1', '2', '3'].includes(String(val))) {
          sum.normal += count;
        } else {
          sum.others += count;
        }
        return sum;
      },
      { normal: 0, others: 0 },
    );

    const { normal, others } = grouped;

    return (others / (normal + others)) >= medianThreshold;
  }

  private findMedian(result: DefaultResult) {
    const entries = [...Object.entries(result)];
    const values = entries.reduce(
      (list, [val, count]) => {
        return [...list, ...Array.from(Array(count), () => Number(val))];
      },
      [] as number[],
    );

    return median(values);
  }

  public isVote(text: string) {
    return /^\s*(0|[1-9]\d*)\s*$/.test(text);
  }
}
