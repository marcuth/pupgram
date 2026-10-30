import { describe, expect, it, vi } from "vitest"

import { typePasswordAction } from "../../src/actions/login/type-password.action"
import { createActionOptions } from "../helpers"

describe("typePasswordAction", () => {
    it("types the password into the input", async () => {
        const input = { type: vi.fn() }
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(input)

        await typePasswordAction("secret")(options)

        expect(options.page.waitForSelector).toHaveBeenCalledWith(options.config.passwordInputSelector, {
            timeout: options.defaultTimeout,
        })
        expect(input.type).toHaveBeenCalledWith("secret")
    })

    it("throws when the input is not found", async () => {
        const options = createActionOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(typePasswordAction("secret")(options)).rejects.toThrow("Password input not found")
    })
})
