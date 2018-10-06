import * as env from 'dotenv-extended';

export interface AuthConfig {
  readonly username: string; // twitch username
  readonly oauth: string; // oauth:you-oauth-password
}

export interface VotingConfig {
  readonly channel: string; // twitch channel name
  readonly bufferSize: number; // vote buffer size in seconds
  readonly maxTime: number; // maximal time for voting in seconds
  readonly resultInterval: number; // interval for posting result in seconds
  readonly startCount: number;
  readonly endCount: number;
  readonly admin: string;
  readonly allowMods: boolean;
  readonly command: string;
  readonly pause: number;
  readonly lifetime: number;
  readonly medianThreshold: number;
}

export class Config {
  private static privateInstance: Config;

  public readonly debug: boolean;
  public readonly version: string;
  public readonly auth: AuthConfig;
  public readonly voting: VotingConfig;

  constructor() {
    env.load({
      encoding: 'utf8',
      silent: true,
      path: '.env',
      defaults: '.env.defaults',
      schema: '.env.schema',
      errorOnMissing: true,
      errorOnExtra: true,
      assignToProcessEnv: true,
      overrideProcessEnv: false,
    });

    this.version = process.env.npm_package_version || 'unknown';
    this.debug = Config.bool('BOT_DEBUG');

    this.auth = {
      username: Config.string('BOT_AUTH_USERNAME'),
      oauth: Config.string('BOT_AUTH_OAUTH'),
    };

    this.voting = {
      channel: Config.string('BOT_VOTING_CHANNEL'),
      bufferSize: Config.int('BOT_VOTING_BUFFER_SIZE', 1),
      maxTime: Config.int('BOT_VOTING_MAX_TIME', 10),
      resultInterval: Config.int('BOT_VOTING_RESULT_INTERVAL', 1),
      startCount: Config.int('BOT_VOTING_START_COUNT', 1),
      endCount: Config.int('BOT_VOTING_END_COUNT', 1),
      admin: Config.string('BOT_VOTING_ADMIN'),
      allowMods: Config.bool('BOT_VOTING_ALLOW_MODS'),
      command: Config.string('BOT_VOTING_COMMAND'),
      pause: Config.int('BOT_VOTING_PAUSE'),
      lifetime: Config.int('BOT_VOTING_LIFETIME', 0),
      medianThreshold: Config.float('BOT_VOTING_MEDIAN_THRESHOLD', 0, 1),
    };
  }

  public static get instance() {
    if (!Config.privateInstance) {
      Config.privateInstance = new Config();
    }

    return Config.privateInstance;
  }

  private static string(variable: string): string {
    const value = process.env[variable];

    if (!value || typeof value !== 'string') {
      throw new Error(`${variable} is not a string`);
    }

    return value;
  }

  private static int(variable: string, min?: number, max?: number): number {
    const value = process.env[variable];

    if (value === undefined) {
      throw new Error(`${variable} is undefined`);
    }

    const integer = Number.parseInt(value, 10);

    if (Number.isNaN(integer)) {
      throw new Error(`${variable} is not an number`);
    }

    if (min !== undefined && integer < min) {
      throw new Error(`${variable} must be greater or equal ${min}`);
    }

    if (max !== undefined && integer > max) {
      throw new Error(`${variable} must be lower or equal ${max}`);
    }

    return integer;
  }

  private static bool(variable: string): boolean {
    const value = process.env[variable];

    if (value === undefined) {
      throw new Error(`${variable} is undefined`);
    }

    if (typeof value !== 'string') {
      throw new Error(`${variable} must be a string`);
    }

    const normValue = value.trim().toLowerCase();

    if (normValue === 'true') {
      return true;
    }

    if (normValue === 'false') {
      return false;
    }

    throw new Error(`${variable} must be true or false`);

  }

  private static float(variable: string, min?: number, max?: number) {
    const value = process.env[variable];

    if (value === undefined) {
      throw new Error(`${variable} is undefined`);
    }

    const float = Number.parseFloat(value);

    if (Number.isNaN(float)) {
      throw new Error(`${variable} is not an number`);
    }

    if (min !== undefined && float < min) {
      throw new Error(`${variable} must be greater or equal ${min}`);
    }

    if (max !== undefined && float > max) {
      throw new Error(`${variable} must be lower or equal ${max}`);
    }

    return float;
  }
}
