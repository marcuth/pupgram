import { Action } from "../../interfaces"

export const tryCloseReelInfoAction: Action<void> = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Closing reel info")

    try {
        const closeButton = await page.waitForSelector(`xpath///button[text()='${config.reelCloseInfoText}']`, {
            timeout: defaultTimeout * 2,
        })

        if (!closeButton) {
            logger.debug("Close button not found")
            return
        }

        await closeButton.click()

        logger.debug("Close button clicked")
    } catch (error) {
        logger.debug("Close button not found")
    }
}
