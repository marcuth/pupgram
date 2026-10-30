import { describe, expect, it, vi } from "vitest"

import { tryCloseReelInfoAction } from "../../src/actions/create-reel/try-close-reel-info.action"
import { createActionOptions } from "../helpers"

describe("tryCloseReelInfoAction", () => {
    it("clicks the close button when found", async () => {
        const button = { click: vi.fn() }
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(button)

        await tryCloseReelInfoAction(options)

        expect(button.click).toHaveBeenCalledOnce()
    })

    it("returns when the button is not found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(tryCloseReelInfoAction(options)).resolves.toBeUndefined()
    })

    it("swallows errors thrown while waiting for the button", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockRejectedValue(new Error("timeout"))

        await expect(tryCloseReelInfoAction(options)).resolves.toBeUndefined()
    })
})
