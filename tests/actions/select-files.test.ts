import path from "node:path"

import { describe, expect, it, vi } from "vitest"

import { selectFilesAction } from "../../src/actions/create-post/select-files.action"
import { InstagramError } from "../../src/error"
import { createActionOptions } from "../helpers"

describe("selectFilesAction", () => {
    it("uploads files using absolute paths", async () => {
        const input = { uploadFile: vi.fn() }
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(input)

        await selectFilesAction(["a.png", "b.png"])(options)

        expect(input.uploadFile).toHaveBeenCalledWith(path.resolve("a.png"), path.resolve("b.png"))
    })

    it("throws InstagramError when the input is missing", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(selectFilesAction(["a.png"])(options)).rejects.toBeInstanceOf(InstagramError)
    })

    it("rethrows and logs upload failures", async () => {
        const input = { uploadFile: vi.fn().mockRejectedValue(new Error("fail")) }
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(input)

        await expect(selectFilesAction(["a.png"])(options)).rejects.toThrow("fail")
        expect(options.logger.error).toHaveBeenCalled()
    })
})
