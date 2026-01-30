import { evaluatedClick } from "../../utils"
import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const clickOnCreateButtonAction: Action = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Clicking on create button")

    const createButton = await page.waitForSelector(`xpath///*[contains(text(), '${config.createButtonText}')]`, {
        timeout: defaultTimeout,
    })

    if (!createButton) {
        throw new InstagramError("Create button not found")
    }

    logger.debug("Create button found. Clicking on it")

    await evaluatedClick(page, createButton)

    logger.debug("Create button clicked")
}
