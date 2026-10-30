import { describe, expect, it, vi } from "vitest"

import { waitForReelConfigureAction } from "../../src/actions/create-reel/wait-for-reel-configurate.action"
import { createActionOptions } from "../helpers"

function mockResponses(options: ReturnType<typeof createActionOptions>, ...jsons: any[]) {
    const predicates: Array<(res: any) => boolean> = []
    const waitForResponse = vi.fn(async (predicate: (res: any) => boolean) => {
        predicates.push(predicate)
        const json = jsons[Math.min(waitForResponse.mock.calls.length, jsons.length) - 1]
        return { json: async () => json }
    })

    ;(options.page as any).waitForResponse = waitForResponse

    return { predicates, waitForResponse }
}

const fakeResponse = (url: string, method: string) => ({
    url: () => url,
    request: () => ({ method: () => method }),
})

describe("waitForReelConfigureAction", () => {
    it("returns the reel data", async () => {
        const options = createActionOptions()
        const { predicates } = mockResponses(options, {
            media: { id: "1", pk: "2", code: "abc" },
            caption: { text: "hi" },
        })

        const result = await waitForReelConfigureAction(options)

        expect(result).toEqual({ caption: "hi", id: "1", pk: "2", code: "abc" })

        const predicate = predicates[0]
        expect(predicate(fakeResponse("https://x/api/v1/media/configure_to_clips/", "POST"))).toBe(true)
        expect(predicate(fakeResponse("https://x/api/v1/media/configure_to_clips/", "GET"))).toBe(false)
        expect(predicate(fakeResponse("https://x/other", "POST"))).toBe(false)
    })

    it("uses an empty caption when none is returned", async () => {
        const options = createActionOptions()
        mockResponses(options, { media: { id: "1", pk: "2", code: "abc" } })

        const result = await waitForReelConfigureAction(options)

        expect(result.caption).toBe("")
    })

    it("retries while the transcode is not finished", async () => {
        const options = createActionOptions()
        const { waitForResponse } = mockResponses(
            options,
            { status: "fail", message: "Transcode not finished yet." },
            { media: { id: "1", pk: "2", code: "abc" } },
        )

        const result = await waitForReelConfigureAction(options)

        expect(waitForResponse).toHaveBeenCalledTimes(2)
        expect(result.code).toBe("abc")
    })

    it("throws on an unexpected response", async () => {
        const options = createActionOptions()
        mockResponses(options, { status: "fail", message: "nope" })

        await expect(waitForReelConfigureAction(options)).rejects.toThrow("Unexpected response")
    })

    it("throws when the timeout is exceeded", async () => {
        const options = createActionOptions()
        mockResponses(options, { status: "fail", message: "Transcode not finished yet." })

        vi.spyOn(Date, "now")
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0)
            .mockReturnValue(10 * 60_000)

        await expect(waitForReelConfigureAction(options)).rejects.toThrow("Timeout waiting for Reel configure")
    })
})
