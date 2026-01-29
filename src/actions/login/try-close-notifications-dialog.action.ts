import { evaluatedClick } from "../../utils"
import { Action } from "../../interfaces"

export const tryCloseNotificationsDialogAction: Action<void> = async ({ config, logger, page, defaultTimeout }) => {
    logger.debug("Trying to close notifications dialog")

    const closeButton = await page.waitForSelector(
        `xpath///*[contains(text(), '${config.closeNotificationsDialogText}')]`,
        { timeout: defaultTimeout },
    )

    if (!closeButton) {
        logger.debug("Close button not found")
        return
    }

    logger.debug("Close button found. Clicking on it...")

    await evaluatedClick(page, closeButton)

    logger.debug("Close button clicked")
}
