import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { putPostCaptionAction } from "../../src/actions/create-post/put-post-caption.action"
import { InstagramError } from "../../src/error"
import { createActionOptions } from "../helpers"

describe("putPostCaptionAction", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it("focuses the caption element and types the caption", async () => {
        const element = { focus: vi.fn() }
        const keyboard = { type: vi.fn(), press: vi.fn() }
        const options = createActionOptions({ keyboard })
        ;(options.page.waitForSelector as any).mockResolvedValue(element)

        const promise = putPostCaptionAction("hello")(options)
        await vi.advanceTimersByTimeAsync(300)
        await promise

        expect(element.focus).toHaveBeenCalledOnce()
        expect(keyboard.type).toHaveBeenCalledWith("hello")
        expect(keyboard.press).toHaveBeenCalledWith("Tab")
    })

    it("throws when the caption element is not found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(putPostCaptionAction("hello")(options)).rejects.toBeInstanceOf(InstagramError)
    })
})
