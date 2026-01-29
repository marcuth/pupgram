import { Action } from "../interfaces"

export const needsLoginAction: Action<boolean> = async ({ config, logger, page }) => {
    let needsLogin = true

    logger.debug("Checking if needs login")

    const loginTextElement = await page.$(`xpath///span[contains(text(), '${config.loginText}')]`)

    logger.debug("Login text element found: ", loginTextElement)

    if (loginTextElement) {
        logger.debug("Needs login")
        needsLogin = true
    } else {
        logger.debug("Does not need login")
        needsLogin = false
    }

    return needsLogin
}
