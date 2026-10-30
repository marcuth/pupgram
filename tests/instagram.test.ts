import fs from "node:fs"

import { beforeEach, describe, expect, it, vi } from "vitest"

import { Instagram } from "../src/instagram"
import { enConfig } from "../src/configs"
import { Language } from "../src/enums"

const mocks = vi.hoisted(() => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const action = (name: string, result?: any) => vi.fn(async () => result ?? name)

    return {
        logger,
        launch: vi.fn(),
        use: vi.fn(),
        puppeteerExtraArgs: [] as any[],
        stealth: vi.fn(() => "stealth"),
        needsLogin: vi.fn(),
        loginButton: action("loginButton"),
        postResult: { id: "1", pk: "2", code: "abc", caption: "post" },
        reelResult: { id: "3", pk: "4", code: "def", caption: "reel" },
        action,
    }
})

vi.mock("puppeteer-extra", () => ({
    PuppeteerExtra: class {
        constructor(...args: any[]) {
            mocks.puppeteerExtraArgs.push(args)
        }

        use = mocks.use
        launch = mocks.launch
    },
}))

vi.mock("puppeteer-extra-plugin-stealth", () => ({ default: mocks.stealth }))

vi.mock("../src/helpers/logger.helper", () => ({ createLogger: vi.fn(() => mocks.logger) }))

vi.mock("../src/utils", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../src/utils")>()),
    requireVanillaPuppeteer: vi.fn(() => [{ vanilla: true }, undefined]),
}))

vi.mock("../src/actions/needs-login.action", () => ({ needsLoginAction: mocks.needsLogin }))
vi.mock("../src/actions/delay.action", () => ({ delayAction: vi.fn(() => mocks.action("delay")) }))

vi.mock("../src/actions/login", () => ({
    typeUsernameAction: vi.fn(() => mocks.action("username")),
    typePasswordAction: vi.fn(() => mocks.action("password")),
    clickOnLoginButtonAction: mocks.loginButton,
    tryCloseNotificationsDialogAction: mocks.action("closeNotifications"),
}))

vi.mock("../src/actions/create-post", () => ({
    clickOnCreateButtonAction: mocks.action("create"),
    clickOnNextButtonAction: mocks.action("next"),
    clickOnPostButtonAction: mocks.action("post"),
    clickOnShareButtonAction: mocks.action("share"),
    putPostCaptionAction: vi.fn(() => mocks.action("caption")),
    selectFilesAction: vi.fn(() => mocks.action("files")),
    waitForPostConfigureAction: mocks.action("waitPost", mocks.postResult),
}))

vi.mock("../src/actions/create-reel", () => ({
    selectRatioAction: mocks.action("ratio"),
    tryCloseReelInfoAction: mocks.action("closeReelInfo"),
    waitForReelConfigureAction: mocks.action("waitReel", mocks.reelResult),
}))

function createPage() {
    return {
        setViewport: vi.fn(),
        goto: vi.fn(),
        close: vi.fn(),
        screenshot: vi.fn(),
        content: vi.fn().mockResolvedValue("<html></html>"),
    }
}

function createInstagram(overrides: Partial<ConstructorParameters<typeof Instagram>[0]> = {}) {
    const page = createPage()
    const browser = { newPage: vi.fn().mockResolvedValue(page), close: vi.fn() }

    const instagram = new Instagram({
        browser: browser as any,
        logLevel: "info",
        screenshotOnError: false,
        htmlContentOnError: false,
        config: enConfig,
        ...overrides,
    })

    return { instagram, browser, page }
}

describe("Instagram", () => {
    beforeEach(() => {
        mocks.puppeteerExtraArgs.length = 0
    })

    describe("create", () => {
        const browser = { close: vi.fn() }

        beforeEach(() => {
            mocks.launch.mockResolvedValue(browser)
        })

        it("launches puppeteer with the stealth plugin and extra args", async () => {
            const instagram = await Instagram.create({
                puppeteer: { userDataDir: "./data", headless: true, executablePath: "chrome", extraArgs: ["--foo"] },
                config: enConfig,
            })

            expect(mocks.puppeteerExtraArgs[0]).toEqual([{ vanilla: true }, undefined])
            expect(mocks.use).toHaveBeenCalledWith("stealth")
            expect(mocks.launch).toHaveBeenCalledWith(
                expect.objectContaining({
                    headless: true,
                    executablePath: "chrome",
                    userDataDir: "./data",
                    args: expect.arrayContaining(["--no-sandbox", "--foo"]),
                }),
            )
            expect(instagram).toBeInstanceOf(Instagram)
            expect(instagram.logLevel).toBe("info")
            expect(instagram.defaultTimeout).toBe(10_000)
        })

        it("respects custom options", async () => {
            const instagram = await Instagram.create({
                puppeteer: { userDataDir: "./data" },
                config: enConfig,
                logLevel: "debug",
                defaultTimeout: 500,
                languageParam: Language.PT_BR,
            })

            expect(mocks.launch.mock.calls[0][0].args).not.toContain("--foo")
            expect(instagram.logLevel).toBe("debug")
            expect(instagram.defaultTimeout).toBe(500)
            expect(instagram.languageParam).toBe(Language.PT_BR)
        })
    })

    it("closes the browser", async () => {
        const { instagram, browser } = createInstagram()

        await instagram.close()

        expect(browser.close).toHaveBeenCalledOnce()
    })

    describe("needsLogin", () => {
        it("returns the result of the action and closes the page", async () => {
            mocks.needsLogin.mockResolvedValue(true)
            const { instagram, page } = createInstagram()

            expect(await instagram.needsLogin()).toBe(true)
            expect(page.setViewport).toHaveBeenCalled()
            expect(page.goto).toHaveBeenCalledWith("https://www.instagram.com", { waitUntil: "domcontentloaded" })
            expect(page.close).toHaveBeenCalledOnce()
        })

        it("adds the language param to the url", async () => {
            mocks.needsLogin.mockResolvedValue(false)
            const { instagram, page } = createInstagram({ languageParam: Language.PT_BR })

            expect(await instagram.needsLogin()).toBe(false)
            expect(page.goto).toHaveBeenCalledWith("https://www.instagram.com?hl=pt-br", expect.anything())
        })
    })

    describe("logIn", () => {
        it("runs the login actions and closes the page", async () => {
            const { instagram, page } = createInstagram()

            await instagram.logIn({ username: "john", password: "secret" })

            expect(mocks.loginButton).toHaveBeenCalledOnce()
            expect(page.close).toHaveBeenCalledOnce()
        })
    })

    describe("ensureLoggedIn", () => {
        it("logs in when login is needed", async () => {
            mocks.needsLogin.mockResolvedValue(true)
            const { instagram } = createInstagram()
            const logIn = vi.spyOn(instagram, "logIn").mockResolvedValue()

            await instagram.ensureLoggedIn({ username: "john", password: "secret" })

            expect(logIn).toHaveBeenCalledWith({ username: "john", password: "secret" })
        })

        it("does not log in when already logged in", async () => {
            mocks.needsLogin.mockResolvedValue(false)
            const { instagram } = createInstagram()
            const logIn = vi.spyOn(instagram, "logIn").mockResolvedValue()

            await instagram.ensureLoggedIn({ username: "john", password: "secret" })

            expect(logIn).not.toHaveBeenCalled()
        })
    })

    describe("createPost and createReel", () => {
        it("creates a post and returns its url", async () => {
            const { instagram, page } = createInstagram()

            const result = await instagram.createPost({ caption: "post", filePaths: ["a.png"] })

            expect(result).toEqual({ ...mocks.postResult, url: "https://www.instagram.com/p/abc" })
            expect(page.close).toHaveBeenCalledOnce()
        })

        it("creates a reel and returns its url", async () => {
            const { instagram, page } = createInstagram()

            const result = await instagram.createReel({ caption: "reel", filePath: "a.mp4" })

            expect(result).toEqual({ ...mocks.reelResult, url: "https://www.instagram.com/reel/def" })
            expect(page.close).toHaveBeenCalledOnce()
        })
    })

    describe("error diagnostics", () => {
        beforeEach(() => {
            mocks.loginButton.mockRejectedValueOnce(new Error("boom"))
        })

        it("rethrows without saving diagnostics when disabled", async () => {
            const mkdir = vi.spyOn(fs.promises, "mkdir").mockResolvedValue(undefined)
            const { instagram, page } = createInstagram()

            await expect(instagram.logIn({ username: "a", password: "b" })).rejects.toThrow("boom")

            expect(mkdir).not.toHaveBeenCalled()
            expect(page.screenshot).not.toHaveBeenCalled()
            expect(page.close).toHaveBeenCalledOnce()
        })

        it("saves a screenshot and the html content when enabled", async () => {
            const mkdir = vi.spyOn(fs.promises, "mkdir").mockResolvedValue(undefined)
            const writeFile = vi.spyOn(fs.promises, "writeFile").mockResolvedValue()
            const { instagram, page } = createInstagram({ screenshotOnError: true, htmlContentOnError: true })

            await expect(instagram.logIn({ username: "a", password: "b" })).rejects.toThrow("boom")

            expect(mkdir).toHaveBeenCalledOnce()
            expect(page.screenshot).toHaveBeenCalledOnce()
            expect(writeFile).toHaveBeenCalledWith(expect.stringContaining("error.html"), "<html></html>")
            expect(page.close).toHaveBeenCalledOnce()
        })

        it("saves only the html content when the screenshot is disabled", async () => {
            vi.spyOn(fs.promises, "mkdir").mockResolvedValue(undefined)
            vi.spyOn(fs.promises, "writeFile").mockResolvedValue()
            const { instagram, page } = createInstagram({ htmlContentOnError: true })

            await expect(instagram.logIn({ username: "a", password: "b" })).rejects.toThrow("boom")

            expect(page.screenshot).not.toHaveBeenCalled()
            expect(page.content).toHaveBeenCalledOnce()
        })
    })
})
