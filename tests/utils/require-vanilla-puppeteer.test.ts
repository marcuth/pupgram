import Module from "node:module"

import { describe, expect, it, vi } from "vitest"

import { requireVanillaPuppeteer } from "../../src/utils"

function mockRequire(missing: string[]) {
    const original = Module.prototype.require

    vi.spyOn(Module.prototype, "require").mockImplementation(function (this: any, id: string) {
        if (missing.includes(id)) {
            throw new Error(`Cannot find module '${id}'`)
        }

        return original.call(this, id)
    } as any)
}

describe("requireVanillaPuppeteer", () => {
    it("returns puppeteer without error when installed", () => {
        const [module, error] = requireVanillaPuppeteer()

        expect(error).toBeUndefined()
        expect(module).toBeDefined()
    })

    it("falls back to puppeteer-core when puppeteer is missing", () => {
        mockRequire(["puppeteer"])

        const [module, error] = requireVanillaPuppeteer()

        expect(error).toBeUndefined()
        expect(module).toBeDefined()
    })

    it("returns the error when neither is installed", () => {
        mockRequire(["puppeteer", "puppeteer-core"])

        const [module, error] = requireVanillaPuppeteer()

        expect(module).toBeUndefined()
        expect(error).toBeInstanceOf(Error)
    })
})
