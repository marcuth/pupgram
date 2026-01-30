import { Action, ActionFactory } from "../interfaces"
import { delay } from "../utils/delay.util"

export const delayAction: ActionFactory<void> = (delayTime: number): Action<void> => {
    return async ({ logger }) => {
        logger.info("Delaying")

        await delay(delayTime)

        logger.debug("Delaying")
    }
}
