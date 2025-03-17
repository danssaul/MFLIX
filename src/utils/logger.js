// logger.js
import fs from 'node:fs';
import path from 'node:path';
import morgan from 'morgan';
import config from 'config';
import { createStream } from 'rotating-file-stream';

const env = process.env.NODE_ENV || 'development';
const morganConfig = config.get("morgan");

let loggerMiddleware;

if (env === 'production') {
  // Production settings with rotated file streams
  
  const accessLogStream = createStream('access.log', {
    interval: '1d',  // rotate daily
    path: path.join(process.cwd(), 'logs')
  });

  const authErrorLogStream = createStream('auth-errors.log', {
    interval: '1d',
    path: path.join(process.cwd(), 'logs')
  });

  const morganAll = morgan(morganConfig.type, { stream: accessLogStream });
  const morganAuth = morgan(morganConfig.type, {
    stream: authErrorLogStream,
    skip: (req, res) => res.statusCode !== 401 && res.statusCode !== 403
  });

  loggerMiddleware = (req, res, next) => {
    morganAll(req, res, () => {
      morganAuth(req, res, next);
    });
  };
} else {
  // Development settings using console
  const stream = morganConfig.stream === "console" ? process.stdout : fs.createWriteStream(morganConfig.stream, { flags: "a" });
  loggerMiddleware = morgan(morganConfig.type, { stream });
}

export const logger = loggerMiddleware;
