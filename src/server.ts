import config from './config/config'

import app from './app'
import logger from './util/logger'
import databaseService from './service/databaseService'
import { initRateLimiter } from './config/rateLimiter';
const server = app.listen(config.PORT)
;(async () => {
    try {
        // Database Connection
        const connection = await databaseService.connect()
        logger.info(`DATABASE_CONNECTION`, {
            meta: {
                CONNECTION_NAME: connection.name
            }
        })
        //Rate Limiter
        initRateLimiter(connection)
        logger.info(`RATE_LIMITER_INITIATED`)

        logger.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })
    } catch (err) {
        logger.error(`APPLICATION_ERROR`, { meta: err })
        server.close((error) => {
            if (error) {
                logger.error(`APPLICATION_ERROR`, { meta: error })
            }

            process.exit(1)
        })
    }
})()
