import { vi } from "vitest"

import { ActionOptions } from "../src/interfaces"
import { enConfig } from "../src/configs"

export function createActionOptions(pageOverrides: Record<string, any> = {}): ActionOptions {
    const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }

    const page = {
        $: vi.fn(),
        waitForSelector: vi.fn(),
        waitForNavigation: vi.fn(),
        evaluate: vi.fn(),
        ...pageOverrides,
    }

    return {
        config: enConfig,
        logger: logger as any,
        page: page as any,
        defaultTimeout: 1000,
    }
}
