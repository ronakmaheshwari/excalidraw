import { logger } from "./logger";

const logInfo = (msg: string) => logger.info(msg);
const logWarn = (msg: string) => logger.warn(msg);
const logError = (msg: string | Error, statusCode?: number) => {
  if (msg instanceof Error) {
    logger.error(`${statusCode ? `[${statusCode}] ` : ""}${msg.message}`, { stack: msg.stack });
  } else {
    logger.error(`${statusCode ? `[${statusCode}] ` : ""}${msg}`);
  }
};

export {logger,logInfo,logWarn,logError};