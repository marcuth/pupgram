import { describe, expect, it } from "vitest"

import { createPostUrl, createReelUrl } from "../../src/utils"

describe("url utils", () => {
    it("creates a post url", () => {
        expect(createPostUrl("abc123")).toBe("https://www.instagram.com/p/abc123")
    })

    it("creates a reel url", () => {
        expect(createReelUrl("abc123")).toBe("https://www.instagram.com/reel/abc123")
    })
})
