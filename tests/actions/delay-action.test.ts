import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { delayAction } from "../../src/actions/delay.action"
import { createActionOptions } from "../helpers"

describe("delayAction", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it("waits for the given time", async () => {
        const done = vi.fn()

        delayAction(200)(createActionOptions()).then(done)

        await vi.advanceTimersByTimeAsync(199)
        expect(done).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)
        expect(done).toHaveBeenCalledOnce()
    })
})
