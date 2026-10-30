import { afterEach, describe, expect, it, vi } from "vitest"

import { selectRatioAction } from "../../src/actions/create-reel/select-ratio.action"
import { InstagramError } from "../../src/error"
import { createActionOptions } from "../helpers"

class FakeHTMLElement {
    dataset: Record<string, string> = {}
    style = { display: "block" }
    attributes: Record<string, string> = {}

    getAttribute(name: string) {
        return this.attributes[name] ?? null
    }

    removeAttribute(name: string) {
        delete this.attributes[name]
    }
}

function createOptions() {
    const options = createActionOptions()

    ;(options.page.evaluate as any).mockImplementation(async (fn: any, ...args: any[]) => fn(...args))

    return options
}

function stubDom(elements: FakeHTMLElement[] = []) {
    vi.stubGlobal("HTMLElement", FakeHTMLElement)
    vi.stubGlobal("document", { querySelectorAll: () => elements })
}

describe("selectRatioAction", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("selects the original ratio and restores the container display", async () => {
        const container = new FakeHTMLElement()
        const video = { closest: vi.fn().mockReturnValue(container) }
        const restored = new FakeHTMLElement()
        const emptyRestored = new FakeHTMLElement()

        restored.attributes["data-__old-display"] = "flex"
        emptyRestored.attributes["data-__old-display"] = ""
        stubDom([restored, emptyRestored])

        const ratioButton = { click: vi.fn() }
        const originalButton = { click: vi.fn() }
        const options = createOptions()
        ;(options.page.waitForSelector as any)
            .mockResolvedValueOnce(video)
            .mockResolvedValueOnce(ratioButton)
            .mockResolvedValueOnce(originalButton)

        await selectRatioAction(options)

        expect(container.dataset.__oldDisplay).toBe("block")
        expect(container.style.display).toBe("none")
        expect(ratioButton.click).toHaveBeenCalledOnce()
        expect(originalButton.click).toHaveBeenCalledOnce()
        expect(restored.style.display).toBe("flex")
        expect(restored.getAttribute("data-__old-display")).toBeNull()
        expect(emptyRestored.style.display).toBe("")
    })

    it("ignores a video that has no html container", async () => {
        stubDom()

        const options = createOptions()
        ;(options.page.waitForSelector as any)
            .mockResolvedValueOnce({ closest: vi.fn().mockReturnValue(null) })
            .mockResolvedValueOnce({ click: vi.fn() })
            .mockResolvedValueOnce({ click: vi.fn() })

        await expect(selectRatioAction(options)).resolves.toBeUndefined()
    })

    it("throws when the video element is not found", async () => {
        const options = createOptions()
        ;(options.page.waitForSelector as any).mockResolvedValue(null)

        await expect(selectRatioAction(options)).rejects.toBeInstanceOf(InstagramError)
    })

    it("throws and still restores the display when the ratio button is missing", async () => {
        stubDom()

        const options = createOptions()
        ;(options.page.waitForSelector as any)
            .mockResolvedValueOnce({ closest: () => null })
            .mockResolvedValueOnce(null)

        await expect(selectRatioAction(options)).rejects.toThrow("Select ratio element not found")
        expect(options.page.evaluate).toHaveBeenCalledTimes(2)
    })

    it("throws when the original ratio option is missing", async () => {
        stubDom()

        const options = createOptions()
        ;(options.page.waitForSelector as any)
            .mockResolvedValueOnce({ closest: () => null })
            .mockResolvedValueOnce({ click: vi.fn() })
            .mockResolvedValueOnce(null)

        await expect(selectRatioAction(options)).rejects.toThrow("Original ratio element not found")
    })
})
