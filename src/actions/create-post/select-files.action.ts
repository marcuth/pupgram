import { ElementHandle } from "puppeteer"

import path from "node:path"

import { ActionFactory } from "../../interfaces"
import { InstagramError } from "../../error"

export const selectFilesAction: ActionFactory = (filePaths: string[]) => {
    return async ({ page, config, logger, defaultTimeout }) => {
        logger.info("Selecting files")

        const fileInput = (await page.waitForSelector(config.fileInputSelector, {
            timeout: defaultTimeout,
        })) as ElementHandle<HTMLInputElement>

        if (!fileInput) {
            throw new InstagramError("File input element not found")
        }

        const absolutePaths = filePaths.map((filePath) => path.resolve(filePath))

        try {
            await fileInput.uploadFile(...absolutePaths)
            logger.debug("Files uploaded via uploadFile")
        } catch (error: any) {
            logger.error(`Failed to upload files: ${error.message}`)
            throw error
        }

        logger.debug("Files selected")
    }
}
