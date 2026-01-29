import { Action, ActionFactory } from "../../interfaces"

export const typeUsernameAction: ActionFactory<void> = (username: string): Action<void> => {
    return async ({ config, logger, page, defaultTimeout }) => {
        logger.debug("Typing username")

        const usernameInput = await page.waitForSelector(config.usernameInputSelector, { timeout: defaultTimeout })

        if (!usernameInput) {
            logger.error("Username input not found")
            throw new Error("Username input not found")
        }

        await usernameInput.type(username)

        logger.debug("Username typed")
    }
}
