import { describe, expect, it } from "vitest"

import { needsLoginAction } from "../../src/actions/needs-login.action"
import { createActionOptions } from "../helpers"

describe("needsLoginAction", () => {
    it("returns true when the login text is found", async () => {
        const options = createActionOptions()
        ;(options.page.$ as any).mockResolvedValue({})

        expect(await needsLoginAction(options)).toBe(true)
    })

    it("returns false when the login text is not found", async () => {
        const options = createActionOptions()
        ;(options.page.$ as any).mockResolvedValue(null)

        expect(await needsLoginAction(options)).toBe(false)
    })
})
