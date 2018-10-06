import { Config } from './config';

const { voting } = Config.instance;

export interface Action {
  readonly args: [string?, string?, string?, string?];
}

export class InitAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export class StartAction implements Action {
  constructor(public readonly args: [string, string, string?, string?]) { }
}

export class HelpAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export class VersionAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export class StatusAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export class KillAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export class MedianModeAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export class NormalModeAction implements Action {
  constructor(public readonly args: [] = []) { }
}

export function parseAction(text: string): Action | string | null {
  if (!text.startsWith(`${voting.command} `) && voting.command !== text) {
    return null;
  }

  const [command, action, ...args] = text.split(' ');

  switch (action) {
    case undefined:
      return new InitAction();

    case 'start':
      if (checkArgs(args, 2, 4)) {
        const [arg1, arg2, arg3, arg4] = args;
        return new StartAction([arg1, arg2, arg3, arg4]);
      }
      return 'Invalide Anzahl an Argumenten!';

    case 'help':
      if (checkArgs(args, 0)) {
        return new HelpAction();
      }
      return 'Invalide Anzahl an Argumenten!';

    case 'version':
      if (checkArgs(args, 0)) {
        return new VersionAction();
      }
      return 'Invalide Anzahl an Argumenten!';

    case 'info':
      if (checkArgs(args, 0)) {
        return new StatusAction();
      }
      return 'Invalide Anzahl an Argumenten!';

    case 'status':
      if (checkArgs(args, 0)) {
        return new StatusAction();
      }
      return 'Invalide Anzahl an Argumenten!';

    case 'kill':
      if (checkArgs(args, 0)) {
        return new KillAction();
      }
      return 'Invalide Anzahl an Argumenten!';

    case 'mode':
      if (checkArgs(args, 1)) {
        if (args[0] === 'median') {
          return new MedianModeAction();
        }
        if (args[0] === 'normal') {
          return new NormalModeAction();
        }
        return `Unbekannter Modus "${args[0]}"!`;
      }
      return 'Invalide Anzahl an Argumenten!';

    default:
      return `Unbekannter Befehl "${action}"!`;
  }
}

function checkArgs(args: string[] | undefined, min: number, max: number = min) {
  return args && args.length >= min && args.length <= max;
}
