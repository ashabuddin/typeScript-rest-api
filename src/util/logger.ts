import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import { EApplicationEnvironment } from '../constant/application'
import config from '../config/config'
import util from 'util'
import path from 'path'
import * as sourceMapSupport from 'source-map-support'

// Linking Trace Support
sourceMapSupport.install()
// const colorizeLevel = (level: string) => {
//     switch (level) {
//         case 'ERROR':
//             return red(level)
//         case 'INFO':
//             return blue(level)
//         case 'WARN':
//             return yellow(level)
//         default:
//             return level
//     }
// }
const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info
    const customLevel = level.toUpperCase()
    // colorizeLevel(level.toUpperCase())

    const customTimestamp = timestamp
    //  green(timestamp as string)

    const customMessage = message

    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors: true
    })
    const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${'META'} ${customMeta}\n`

    return customLog
})
const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta ={} as any } = info
 
    const logMeta: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                trace: value.stack || ''
            }
        } else {
            logMeta[key] = value
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,

        timestamp,
        meta: logMeta
    }
    return JSON.stringify(logData, null, 4)
})
const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ]
    }

    return []
}
const fileTransport = (): Array<FileTransportInstance> => {
    return [
        new transports.File({
            filename: path.join(__dirname, '../', '../', 'logs', `${config.ENV}.log`),
            level: 'info',
            format: format.combine(format.timestamp(), fileLogFormat)
        })
    ]
}
export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...consoleTransport(), ...fileTransport()]
})
