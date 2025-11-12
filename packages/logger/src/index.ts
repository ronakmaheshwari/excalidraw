import * as ApiError from "./error";
import { logger } from "./logger";

const logInfo = (msg: string) => logger.info(msg);
const logWarn = (msg: string) => logger.warn(msg);
const logError = (statusCode: number | undefined, msg: string | Error) => {
  const prefix = statusCode ? `[${statusCode}] ` : "";

  if (msg instanceof Error) {
    logger.error(`${prefix}${msg.message}`, { stack: msg.stack });
  } else {
    logger.error(`${prefix}${msg}`);
  }
};

export {logger,logInfo,logWarn,logError};