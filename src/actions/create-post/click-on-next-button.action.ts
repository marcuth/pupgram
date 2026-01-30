import { evaluatedClick } from "../../utils"
import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const clickOnNextButtonAction: Action = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Clicking on next button")

    const nextButton = await page.waitForSelector(`xpath///*[contains(text(), '${config.nextButtonText}')]`, {
        timeout: defaultTimeout,
    })

    if (!nextButton) {
        throw new InstagramError("Next button not found")
    }

    logger.debug("Next button found. Clicking on it")

    await evaluatedClick(page, nextButton)

    logger.debug("Next button clicked")
}
