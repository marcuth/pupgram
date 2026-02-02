import { ActionFactory } from "../../interfaces"
import { InstagramError } from "../../error"
import { delay } from "../../utils"

export const putPostCaptionAction: ActionFactory = (caption: string) => {
    return async ({ page, config, logger, defaultTimeout }) => {
        logger.info("Starting to put post caption")

        const captionElement = await page.waitForSelector(config.captionInputSelector, {
            timeout: defaultTimeout,
        })

        if (!captionElement) {
            logger.error("Failed to find caption input element")
            throw new InstagramError("Caption element not found")
        }

        logger.debug("Caption element located. Focusing and typing caption...")

        await captionElement.focus()
        await page.keyboard.type(caption)

        await page.keyboard.press("Tab")
        await delay(300)

        logger.info("Post caption successfully entered")
    }
}
