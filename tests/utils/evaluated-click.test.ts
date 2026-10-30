import { describe, expect, it, vi } from "vitest"

import { evaluatedClick } from "../../src/utils"

describe("evaluatedClick", () => {
    it("scrolls to and clicks the element inside page.evaluate", async () => {
        const element = { scrollIntoView: vi.fn(), click: vi.fn() }
        const page = { evaluate: vi.fn(async (fn: any, el: any) => fn(el)) }

        await evaluatedClick(page as any, element as any)

        expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" })
        expect(element.click).toHaveBeenCalledOnce()
    })
})
