import { describe, expect, it } from "vitest"

import { tryCloseNotificationsDialogAction } from "../../src/actions/login/try-close-notifications-dialog.action"
import { clickOnCreateButtonAction } from "../../src/actions/create-post/click-on-create-button.action"
import { clickOnShareButtonAction } from "../../src/actions/create-post/click-on-share-button.action"
import { clickOnPostButtonAction } from "../../src/actions/create-post/click-on-post-button.action"
import { clickOnNextButtonAction } from "../../src/actions/create-post/click-on-next-button.action"
import { clickOnLoginButtonAction } from "../../src/actions/login/click-on-login-button.action"
import { InstagramError } from "../../src/error"
import { createActionOptions } from "../helpers"

const buttonActions = [
    ["clickOnCreateButtonAction", clickOnCreateButtonAction, "Create button not found"],
    ["clickOnNextButtonAction", clickOnNextButtonAction, "Next button not found"],
    ["clickOnPostButtonAction", clickOnPostButtonAction, "Post button not found"],
    ["clickOnShareButtonAction", clickOnShareButtonAction, "Share button not found"],
] as const

describe.each(buttonActions)("%s", (_name, action, errorMessage) => {
    it("clicks the button when found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue({})

        await action(options)

        expect(options.page.evaluate).toHaveBeenCalledOnce()
    })

    it("throws InstagramError when the button is missing", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        const promise = action(options)

        await expect(promise).rejects.toBeInstanceOf(InstagramError)
        await expect(promise).rejects.toThrow(errorMessage)
    })
})

describe("clickOnLoginButtonAction", () => {
    it("clicks the login button and waits for navigation", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue({})

        await clickOnLoginButtonAction(options)

        expect(options.page.evaluate).toHaveBeenCalledOnce()
        expect(options.page.waitForNavigation).toHaveBeenCalledOnce()
    })

    it("throws when the button is not found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(clickOnLoginButtonAction(options)).rejects.toThrow("Login button not found")
        expect(options.logger.error).toHaveBeenCalled()
    })
})

describe("tryCloseNotificationsDialogAction", () => {
    it("clicks the close button when found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue({})

        await tryCloseNotificationsDialogAction(options)

        expect(options.page.evaluate).toHaveBeenCalledOnce()
    })

    it("does nothing when the close button is not found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await tryCloseNotificationsDialogAction(options)

        expect(options.page.evaluate).not.toHaveBeenCalled()
    })
})
