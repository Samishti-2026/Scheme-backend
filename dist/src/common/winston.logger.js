"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLogger = exports.winstonInstance = void 0;
const winston_1 = require("winston");
const nest_winston_1 = require("nest-winston");
const path = __importStar(require("path"));
const { combine, timestamp, printf, colorize, errors, json } = winston_1.format;
const LOG_FILE = path.join(process.cwd(), 'logs', 'app.log');
const consoleFormat = combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), errors({ stack: true }), printf(({ timestamp, level, message, context, stack, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const rest = Object.keys(meta).length ? '\n  ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n  ') : '';
    const err = stack ? `\n${stack}` : '';
    return `${timestamp} ${level} ${ctx} ${message}${rest}${err}`;
}));
const fileFormat = combine(timestamp(), errors({ stack: true }), json());
exports.winstonInstance = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'debug',
    transports: [
        new winston_1.transports.Console({ format: consoleFormat }),
        new winston_1.transports.File({
            filename: LOG_FILE,
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
            tailable: true,
        }),
        new winston_1.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 3,
        }),
    ],
});
exports.WinstonLogger = nest_winston_1.WinstonModule.createLogger({
    instance: exports.winstonInstance,
});
//# sourceMappingURL=winston.logger.js.map