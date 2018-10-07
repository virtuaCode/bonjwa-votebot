import * as winston from 'winston';
const format = winston.format;

export const Logger = winston.createLogger({
  format: format.combine(
    format.colorize(),
    format.align(),
    format.printf(info => `${info.level}: ${info.message}`),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
