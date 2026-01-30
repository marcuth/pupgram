import { ElementHandle } from "puppeteer"

import { ActionFactory } from "../../interfaces"
import { InstagramError } from "../../error"

export const selectFilesAction: ActionFactory = (filePaths: string[]) => {
    return async ({ page, config, logger, defaultTimeout }) => {
        logger.info("Selecting files")

        const fileInputElement = (await page.waitForSelector(config.fileInputSelector, {
            timeout: defaultTimeout,
        })) as ElementHandle<HTMLInputElement>

        if (!fileInputElement) {
            throw new InstagramError("File input element not found")
        }

        logger.debug("File input element found. Making it visible")

        await page.evaluate((selector) => {
            const fileInputElement = document.querySelector(selector) as HTMLInputElement
            fileInputElement.style.display = "block"
        }, config.fileInputSelector)

        logger.debug("File input element visible. Uploading files")

        await fileInputElement.uploadFile(...filePaths)

        logger.debug("Files selected")
    }
}
