import { ElementHandle } from "puppeteer"

import path from "node:path"
import fs from "node:fs"

import { ActionFactory } from "../../interfaces"
import { InstagramError } from "../../error"

const getMimeType = (fileName: string): string => {
    const ext = path.extname(fileName).toLowerCase()

    const map: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
    }

    return map[ext] || "application/octet-stream"
}

export const selectFilesAction: ActionFactory = (filePaths: string[]) => {
    return async ({ page, config, logger, defaultTimeout }) => {
        logger.info("Selecting files")

        const fileInputElement = (await page.waitForSelector(config.fileInputSelector, {
            timeout: defaultTimeout,
        })) as ElementHandle<HTMLInputElement>

        if (!fileInputElement) {
            throw new InstagramError("File input element not found")
        }

        try {
            const filesData = filePaths.map((filePath) => {
                const absolutePath = path.resolve(filePath)
                const content = fs.readFileSync(absolutePath).toString("base64")
                const mimeType = getMimeType(absolutePath)

                return {
                    name: path.basename(absolutePath),
                    content: content,
                    mimeType: mimeType,
                }
            })

            await page.evaluate(
                async (selector, files) => {
                    const input = document.querySelector(selector) as HTMLInputElement
                    const dataTransfer = new DataTransfer()

                    for (const file of files) {
                        const response = await fetch(`data:${file.mimeType};base64,${file.content}`)
                        const blob = await response.blob()
                        const fileObj = new File([blob], file.name, { type: file.mimeType })
                        dataTransfer.items.add(fileObj)
                    }

                    input.files = dataTransfer.files
                    input.dispatchEvent(new Event("change", { bubbles: true }))
                },
                config.fileInputSelector,
                filesData,
            )

            logger.debug("Files injected via DataTransfer")
        } catch (error: any) {
            logger.error(`Failed to upload: ${error.message}`)
            await fileInputElement.uploadFile(...filePaths.map((filePath) => path.resolve(filePath)))
        }

        logger.debug("Files selected")
    }
}
