import { evaluatedClick } from "../../utils"
import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const clickOnPostButtonAction: Action = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Clicking on post button")

    const postButton = await page.waitForSelector(`xpath///*[contains(text(), '${config.postButtonText}')]`, {
        timeout: defaultTimeout,
    })

    if (!postButton) {
        throw new InstagramError("Post button not found")
    }

    logger.debug("Post button found. Clicking on it")

    await evaluatedClick(page, postButton)

    logger.debug("Post button clicked")
}
