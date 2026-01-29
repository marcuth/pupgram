import { ElementHandle, Page } from "puppeteer"

export const evaluatedClick = async (page: Page, elementHandle: ElementHandle<Element>) => {
    await page.evaluate((el) => {
        const element = el as HTMLElement
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.click()
    }, elementHandle)
}
