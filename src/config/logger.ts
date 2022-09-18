import winston from 'winston';
import 'winston-daily-rotate-file';
import { resolve } from 'path';
import colors from './logger.config';

const { combine, errors, timestamp, json, colorize, printf } = winston.format;
winston.addColors(colors);

const dailyRotateFileCreator = (name: string, level: string = 'http') =>
  new winston.transports.DailyRotateFile({
    filename: resolve(__dirname, '..', '..', 'logs', `${name}-%DATE%.log`),
    level,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });

const logger = winston.createLogger({
  level: 'http',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    dailyRotateFileCreator('combined'),
    dailyRotateFileCreator('error', 'error'),
  ],
  exceptionHandlers: [dailyRotateFileCreator('exception')],
  rejectionHandlers: [dailyRotateFileCreator('rejection')],
});

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        colorize({ all: true }),
        printf((info) => {
          if (info.level.includes('http')) {
            return `${info.timestamp} ${info.level}: ${info.message}${info.method} ${info.url} ${info.status} resp_time: ${info.response_time} `;
          }
          if (
            info.message.includes('typeorm:log') ||
            info.message.includes('typeorm:schema-build') ||
            info.message.includes('typeorm:migration')
          ) {
            return `${info.timestamp} ${info.level}: ${info.message} ${info.msg}`;
          }
          if (info.message.includes('typeorm:error')) {
            return `${info.timestamp} ${info.level}: ${info.message} ${info.error} ${info.query} ${info.parameters}`;
          }
          if (info.message.includes('typeorm:slow')) {
            return `${info.timestamp} ${info.level}: ${info.message} ${info.time} ${info.query} ${info.parameters}`;
          }
          return `${info.timestamp} ${info.level}: ${info.message}`;
        }),
      ),
    }),
  );
}

export default logger;
