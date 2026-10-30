import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { delay } from "../../src/utils"

describe("delay", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("resolves only after the given time", async () => {
        const done = vi.fn()
        delay(500).then(done)

        await vi.advanceTimersByTimeAsync(499)
        expect(done).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)
        expect(done).toHaveBeenCalledOnce()
    })
})
