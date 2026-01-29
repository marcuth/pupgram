import { Action, ActionFactory } from "../../interfaces"

export const typePasswordAction: ActionFactory<void> = (password: string): Action<void> => {
    return async ({ config, logger, page, defaultTimeout }) => {
        logger.debug("Typing password")

        const passwordInput = await page.waitForSelector(config.passwordInputSelector, { timeout: defaultTimeout })

        if (!passwordInput) {
            logger.error("Password input not found")
            throw new Error("Password input not found")
        }

        await passwordInput.type(password)

        logger.debug("Password typed")
    }
}
