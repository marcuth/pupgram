import { describe, expect, it, vi } from "vitest"

import { typeUsernameAction } from "../../src/actions/login/type-username.action"
import { createActionOptions } from "../helpers"

describe("typeUsernameAction", () => {
    it("types the username into the input", async () => {
        const input = { type: vi.fn() }
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(input)

        await typeUsernameAction("john")(options)

        expect(options.page.waitForSelector).toHaveBeenCalledWith(options.config.usernameInputSelector, {
            timeout: options.defaultTimeout,
        })
        expect(input.type).toHaveBeenCalledWith("john")
    })

    it("throws when the input is not found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(typeUsernameAction("john")(options)).rejects.toThrow("Username input not found")
    })
})
