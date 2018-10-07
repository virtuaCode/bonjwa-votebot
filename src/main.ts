const twitchbot = require('twitch-bot');
import { Config } from './config';
import { Message } from './message';
import { VoteService } from './vote.service';
import { DefaultVoting, DefaultResult } from './default-voting';
import { Logger } from './winston';
import {
  parseAction, InitAction, StartAction, KillAction,
  MedianModeAction, NormalModeAction, HelpAction, StatusAction, VersionAction,
} from './action';

const { debug, version } = Config.instance;
const { auth } = Config.instance;
const { admin, command, channel, allowMods, pause, lifetime } = Config.instance.voting;

// TODO: labeled votings
// TODO: improve logging

if (debug) {
  Logger.warn('Debug mode enabled!');
}

function checkPrivileges(chatter: Message) {
  return (
    chatter.username === admin ||
    (allowMods && (chatter.mod === true || (chatter.badges && chatter.badges.broadcaster === 1)))
  );
}

const bot = new twitchbot({
  username: auth.username,
  oauth: auth.oauth,
  channels: [channel],
});

export type Mode = 'NORMAL' | 'MEDIAN';

const voteService = new VoteService();
const voting = new DefaultVoting();

let mode: Mode = 'NORMAL';
let lastVoteAt: number | null = null;
let activeUntil: number | null = null;

function say(text: string) {
  const message = text.trim().split(/\s+/).join(' ');

  Logger.info(`> ${message}`);

  if (!debug) {
    bot.say(message);
  }
}

function logAction(clazz: {name: string}) {
  Logger.info(`Executing ${clazz.name}`);
}

function isNotPaused() {
  return (lastVoteAt === null || Date.now() - (pause * 1000) >= lastVoteAt);
}

function reset() {
  mode = 'NORMAL';
  lastVoteAt = Date.now();
}

function kill() {
  voting.kill();
  mode = 'NORMAL';
  activeUntil = null;
  lastVoteAt = null;
}

function checkActivated() {
  if (activeUntil === null) {
    return false;
  }

  if (Date.now() <= activeUntil) {
    return true;
  }

  activeUntil = null;
  return false;
}

voting.on('start', (result: DefaultResult) => {
  say(`Vote gestartet: ${voteService.formatResult(result, mode)}`);
});

voting.on('result', (result: DefaultResult) => {
  if (mode === 'MEDIAN') {
    say(`Vote läuft: ${voteService.formatResult(result, mode)}`);
  } else {
    if (voteService.isMedianResult(result)) {
      mode = 'MEDIAN';
      say('Vote konvertiert zu Median-Modus!');
    } else {
      say(`Vote läuft: ${voteService.formatResult(result, mode)}`);
    }
  }
});

voting.on('end', (result: DefaultResult) => {
  say(`Ergebnis: ${voteService.formatResult(result, mode)}`);
  reset();
});

bot.on('join', (channel: any) => {
  Logger.info(`Joined channel: ${channel}`);
});

bot.on('error', (err: any) => {
  Logger.error(err);
});

bot.on('message', (chatter: Message) => {

  const action = parseAction(chatter.message);

  if (action === null && checkActivated()) {
    if (isNotPaused() && voteService.isVote(chatter.message)) {
      const value = Number.parseInt(chatter.message.trim().toLowerCase(), 10);

      if (Number.isNaN(value)) {
        return;
      }

      const vote = {
        value,
        username: chatter.username,
        time: chatter.tmi_sent_ts,
      };

      voting.handleVote(vote);
    }
  } else if (!checkPrivileges(chatter)) {
    return;
  } else if (action instanceof InitAction) {
    logAction(InitAction);
    activeUntil = Date.now() + (lifetime * 1000);
    const info = `@${chatter.username} \
      Der Votebot wurde aktiviert und steht dem \
      Chad nun eine Weile zur Verfügung. \
      Für weitere Infos bitte "${command} help" eingeben.`;
    return say(info);
  } else if (!checkActivated()) {
    return;
  } else if (typeof action === 'string') {
    return say(`@${chatter.username} ${action} NotLikeThis`);
  } else if (action instanceof StatusAction) {
    logAction(StatusAction);
    const minutes = activeUntil ? Math.ceil((activeUntil - Date.now()) / 60000) : 0;
    return say(`@${chatter.username} \
    Der Votebot ist noch für ${minutes === 1 ? '1 Minute' : `${minutes} Minuten`} aktiviert.`);
  } else if (action instanceof VersionAction) {
    logAction(VersionAction);
    return say(`@${chatter.username} Votebot Version: ${version}`);
  } else if (action instanceof StartAction) {
    // TODO: implement start action
    logAction(StartAction);
    return say(`@${chatter.username} Dieser Befehl ist noch nicht implementiert! Kappa`);
  } else if (action instanceof KillAction) {
    logAction(KillAction);
    say(`@${chatter.username} Der Votebot ist nun deaktiviert.`);
    return kill();
  } else if (action instanceof MedianModeAction) {
    // TODO: implement median mode action
    logAction(MedianModeAction);
    return say(`@${chatter.username} Dieser Befehl ist noch nicht implementiert! Kappa`);
  } else if (action instanceof NormalModeAction) {
    // TODO: implement normal mode action
    logAction(NormalModeAction);
    return say(`@${chatter.username} Dieser Befehl ist noch nicht implementiert! Kappa`);
  } else if (action instanceof HelpAction) {
    logAction(HelpAction);
    return say(`/w ${chatter.username} [Votebot Help] \
    https://github.com/virtuaCode/bonjwa-votebot/blob/master/README.md`);
  }
});
