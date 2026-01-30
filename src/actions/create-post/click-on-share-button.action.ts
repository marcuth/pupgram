import { evaluatedClick } from "../../utils"
import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const clickOnShareButtonAction: Action = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Clicking on share button")

    const shareButton = await page.waitForSelector(
        `xpath///div[@role='button' and (text()='${config.shareButtonText}')]`,
        {
            timeout: defaultTimeout,
        },
    )

    if (!shareButton) {
        throw new InstagramError("Share button not found")
    }

    logger.debug("Share button found. Clicking on it")

    await evaluatedClick(page, shareButton)

    logger.debug("Share button clicked")
}
