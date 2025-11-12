import path from "path";
import fs from "fs";
import { createLogger, format, transports } from "winston";

const logDir = path.resolve(__dirname, "../../../logs");

if(!fs.existsSync(logDir)){
    fs.mkdirSync(logDir,{recursive: true})
}

const logFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
    level:'info',
    format: format.combine(
        format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        format.errors({stack: true}),
        format.splat(),
        format.json(),
        logFormat
    ),
    transports:[
        new transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),
        new transports.File({
            filename: path.join(logDir,"error.log"),
            level:"error"
        }),
        new transports.File({
            filename:path.join(logDir,"app.log"),
            level:"info"
        })
    ]
})