import { describe, expect, it, vi } from "vitest"

import { waitForPostConfigureAction } from "../../src/actions/create-post/wait-for-post-configure.action"
import { InstagramError } from "../../src/error"
import { createActionOptions } from "../helpers"

function mockWaitForResponse(options: ReturnType<typeof createActionOptions>, json: any) {
    const predicates: Array<(res: any) => boolean> = []

    ;(options.page as any).waitForResponse = vi.fn(async (predicate: (res: any) => boolean) => {
        predicates.push(predicate)
        return { json: vi.fn().mockResolvedValue(json) }
    })

    return predicates
}

const fakeResponse = (url: string, status: number, method: string) => ({
    url: () => url,
    status: () => status,
    request: () => ({ method: () => method }),
})

describe("waitForPostConfigureAction", () => {
    it("returns the post data and waits for the confirmation text", async () => {
        const options = createActionOptions()
        const predicates = mockWaitForResponse(options, {
            status: "ok",
            media: { id: "1", pk: "2", code: "abc", caption: { text: "hi" } },
        })

        const result = await waitForPostConfigureAction(options)

        expect(result).toEqual({ id: "1", pk: "2", code: "abc", caption: "hi" })
        expect(options.page.waitForSelector).toHaveBeenCalledOnce()

        const predicate = predicates[0]
        expect(predicate(fakeResponse("https://x/api/v1/media/configure/", 200, "POST"))).toBe(true)
        expect(predicate(fakeResponse("https://x/api/v1/media/configure_sidecar/", 200, "POST"))).toBe(true)
        expect(predicate(fakeResponse("https://x/other", 200, "POST"))).toBe(false)
        expect(predicate(fakeResponse("https://x/api/v1/media/configure/", 500, "POST"))).toBe(false)
        expect(predicate(fakeResponse("https://x/api/v1/media/configure/", 200, "GET"))).toBe(false)
    })

    it("falls back to pk as id and to an empty caption", async () => {
        const options = createActionOptions()
        mockWaitForResponse(options, { status: "ok", media: { pk: "2", code: "abc" } })

        const result = await waitForPostConfigureAction(options)

        expect(result).toEqual({ id: "2", pk: "2", code: "abc", caption: "" })
    })

    it("throws when the status is not ok", async () => {
        const options = createActionOptions()
        mockWaitForResponse(options, { status: "fail", media: {} })

        await expect(waitForPostConfigureAction(options)).rejects.toBeInstanceOf(InstagramError)
    })

    it("throws when media is missing", async () => {
        const options = createActionOptions()
        mockWaitForResponse(options, { status: "ok" })

        await expect(waitForPostConfigureAction(options)).rejects.toThrow("Failed to create post")
    })
})
