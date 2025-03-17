import winston from 'winston';

const env = process.env.NODE_ENV || 'development';
const defaultLevel = env === 'production' ? 'info' : 'debug';
const logLevel = process.env.LOG_LEVEL || defaultLevel;

const appLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()  
  ]
});

export default appLogger;
