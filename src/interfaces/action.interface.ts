import { Page } from "puppeteer"
import { Logger } from "winston"

import { Config } from "./config.interface"

export type ActionOptions = {
    config: Config
    logger: Logger
    page: Page
    defaultTimeout?: number
}

export type Action<T = void> = (options: ActionOptions) => Promise<T>
