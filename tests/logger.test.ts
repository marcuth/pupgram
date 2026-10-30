import { describe, expect, it } from "vitest"

import { createLogger } from "../src/helpers/logger.helper"
import { Language } from "../src/enums"

describe("createLogger", () => {
    it("creates a logger with the given level and service name", () => {
        const logger = createLogger("test", "debug")

        expect(logger.level).toBe("debug")
        expect(logger.defaultMeta).toEqual({ service: "test" })
        logger.close()
    })

    it("defaults to the info level", () => {
        const logger = createLogger("test")

        expect(logger.level).toBe("info")
        logger.close()
    })
})

describe("Language", () => {
    it("exposes the supported language codes", () => {
        expect(Language.PT_BR).toBe("pt-br")
        expect(Language.EN).toBe("en")
    })
})
