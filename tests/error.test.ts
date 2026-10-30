import { describe, expect, it } from "vitest"

import { InstagramError } from "../src/error"

describe("InstagramError", () => {
    it("is an Error with the right name and message", () => {
        const error = new InstagramError("boom")

        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe("InstagramError")
        expect(error.message).toBe("boom")
    })
})
