import { createLogger, format, transports } from 'winston';
import { utilities as nestWinstonUtilities, WinstonModule } from 'nest-winston';
import * as path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = format;

// ── Log file path ─────────────────────────────────────────────────────────────
const LOG_FILE = path.join(process.cwd(), 'logs', 'app.log');

// ── Console format: colored, human-readable ───────────────────────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, context, stack, ...meta }) => {
    const ctx  = context ? `[${context}]` : '';
    const rest = Object.keys(meta).length ? '\n  ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n  ') : '';
    const err  = stack ? `\n${stack}` : '';
    return `${timestamp} ${level} ${ctx} ${message}${rest}${err}`;
  }),
);

// ── File format: plain JSON, one line per entry ───────────────────────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

// ── Shared winston instance (used by WinstonModule and standalone) ────────────
export const winstonInstance = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    // Console — colored output in terminal
    new transports.Console({ format: consoleFormat }),

    // File — all logs in one file (logs/app.log)
    new transports.File({
      filename: LOG_FILE,
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10 MB per file
      maxFiles: 5,               // keep last 5 rotated files
      tailable: true,
    }),

    // Separate file for errors only
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
});

// ── NestJS module (plug into AppModule) ──────────────────────────────────────
export const WinstonLogger = WinstonModule.createLogger({
  instance: winstonInstance,
});
