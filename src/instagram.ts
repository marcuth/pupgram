import StealthPlugin from "puppeteer-extra-plugin-stealth"
import puppeteer from "puppeteer-extra"
import { Browser } from "puppeteer"
import { Logger } from "winston"

import fs from "node:fs"

import {
    typeUsernameAction,
    typePasswordAction,
    clickOnLoginButtonAction,
    tryCloseNotificationsDialogAction,
} from "./actions/login"
import { createLogger } from "./helpers/logger.helper"
import { Action, Config } from "./interfaces"
import { needsLoginAction } from "./actions"

puppeteer.use(StealthPlugin())

export const defaultTimeout = 10_000

export type CreateInstagramOptions = {
    puppeteer: {
        headless?: boolean | "new" | "shell"
        executablePath?: string
        userDataDir: string
        extraArgs?: string[]
    }
    logLevel?: "debug" | "info" | "warn" | "error"
    screenshotOnError?: boolean
    htmlContentOnError?: boolean
    config: Config
    defaultTimeout?: number
}

export type InstagramOptions = {
    browser: Browser
    logLevel: "debug" | "info" | "warn" | "error"
    screenshotOnError: boolean
    htmlContentOnError: boolean
    config: Config
    defaultTimeout?: number
}

export class Instagram {
    readonly baseUrl = "https://www.instagram.com"
    private readonly browser: Browser
    readonly logLevel: "debug" | "info" | "warn" | "error"
    private readonly logger: Logger
    private readonly screenshotOnError: boolean
    private readonly htmlContentOnError: boolean
    readonly config: Config
    readonly defaultTimeout: number

    constructor({
        browser,
        logLevel,
        screenshotOnError,
        htmlContentOnError,
        config,
        defaultTimeout: optionsDefaultTimeout,
    }: InstagramOptions) {
        this.browser = browser
        this.logLevel = logLevel
        this.logger = createLogger("Instagram", logLevel)
        this.screenshotOnError = screenshotOnError
        this.htmlContentOnError = htmlContentOnError
        this.config = config
        this.defaultTimeout = optionsDefaultTimeout ?? defaultTimeout
    }

    static async create(options: CreateInstagramOptions) {
        const browser = await puppeteer.launch({
            headless: options.puppeteer.headless as any,
            executablePath: options.puppeteer.executablePath,
            userDataDir: options.puppeteer.userDataDir,
            args: [
                "--start-maximized",
                "--lang=pt-BR",
                "--accept-lang=pt-BR,pt;q=0.9",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                ...(options.puppeteer.extraArgs ?? []),
            ],
        })

        return new Instagram({
            browser: browser,
            logLevel: options.logLevel ?? "info",
            screenshotOnError: options.screenshotOnError ?? true,
            htmlContentOnError: options.htmlContentOnError ?? true,
            config: options.config,
            defaultTimeout: options.defaultTimeout,
        })
    }

    async close() {
        this.logger.info("Closing browser")
        await this.browser.close()
        this.logger.debug("Browser closed")
    }

    private async initalizePage() {
        this.logger.info("Initalizing page")

        const page = await this.browser.newPage()

        await page.setViewport({ width: 1920, height: 1080 })
        await page.goto(this.baseUrl, { waitUntil: "networkidle2" })

        this.logger.debug("Page initalized")

        return page
    }

    private async executeWithDiagnostics(actions: Action[]) {
        const page = await this.initalizePage()

        try {
            for (const action of actions) {
                await action({
                    config: this.config,
                    logger: this.logger,
                    page: page,
                    defaultTimeout: this.defaultTimeout,
                })
            }
        } catch (error) {
            this.logger.error(error)

            if (this.screenshotOnError) {
                await page.screenshot({ path: `error-${Date.now()}.png` })
            }

            if (this.htmlContentOnError) {
                const htmlContent = await page.content()
                await fs.promises.writeFile(`error-${Date.now()}.html`, htmlContent)
            }

            throw error
        } finally {
            await page.close()
        }
    }

    async needsLogin() {
        this.logger.info("Checking if needs login")

        const page = await this.initalizePage()

        const needsLogin = await needsLoginAction({
            config: this.config,
            logger: this.logger,
            page: page,
            defaultTimeout: this.defaultTimeout,
        })

        await page.close()

        this.logger.debug(`Needs login: ${needsLogin}`)

        return needsLogin
    }

    async login(username: string, password: string) {
        this.logger.info("Logging in")

        await this.executeWithDiagnostics([
            typeUsernameAction(username),
            typePasswordAction(password),
            clickOnLoginButtonAction,
            tryCloseNotificationsDialogAction,
        ])

        this.logger.debug("Logged in")
    }

    async ensureLoggedIn(username: string, password: string) {
        const needsLogin = await this.needsLogin()

        if (needsLogin) {
            this.logger.info("Needs login")
            await this.login(username, password)
        } else {
            this.logger.info("Already logged in")
        }
    }
}
