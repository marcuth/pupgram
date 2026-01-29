import winston from "winston"

export function createLogger(name: string, level: string = "info") {
    return winston.createLogger({
        level: level,
        format: winston.format.json(),
        defaultMeta: { service: name },
        transports: [new winston.transports.Console()],
    })
}
