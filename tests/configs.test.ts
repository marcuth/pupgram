import { describe, expect, it } from "vitest"

import { enConfig, ptBrConfig } from "../src/configs"

describe("configs", () => {
    it.each([
        ["en", enConfig],
        ["pt-br", ptBrConfig],
    ])("%s config has no empty values", (_name, config) => {
        for (const [key, value] of Object.entries(config)) {
            expect(value, key).toBeTypeOf("string")
            expect(value.length, key).toBeGreaterThan(0)
        }
    })

    it("both configs expose the same keys", () => {
        expect(Object.keys(ptBrConfig).sort()).toEqual(Object.keys(enConfig).sort())
    })
})
