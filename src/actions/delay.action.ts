import { Action, ActionFactory } from "../interfaces"
import { delay } from "../utils"

export const delayAction: ActionFactory<void> = (delayTime: number): Action<void> => {
    return async ({ logger }) => {
        logger.info("Delaying")

        await delay(delayTime)

        logger.debug("Delaying")
    }
}
