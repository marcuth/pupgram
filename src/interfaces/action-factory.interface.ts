import { Page } from "puppeteer"
import { Logger } from "winston"

import { Config } from "./config.interface"
import { Action } from "./action.interface"

export type ActionFactory<T = void> = (...args: any[]) => Action<T>
