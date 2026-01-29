import { evaluatedClick } from "../../utils"
import { Action } from "../../interfaces"

export const clickOnLoginButtonAction: Action<void> = async ({ config, logger, page, defaultTimeout }) => {
    logger.debug("Clicking on login button")

    const loginButton = await page.waitForSelector(
        `xpath///div[@role='button'][.//text()[normalize-space()='${config.loginButtonText}']]`,
        { timeout: defaultTimeout },
    )

    if (!loginButton) {
        logger.error("Login button not found")
        throw new Error("Login button not found")
    }

    logger.debug("Login button found. Clicking on it...")

    await evaluatedClick(page, loginButton)
    await page.waitForNavigation()

    logger.debug("Login button clicked")
}
