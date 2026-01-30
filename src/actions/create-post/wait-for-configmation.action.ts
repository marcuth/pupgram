import { HTTPResponse } from "puppeteer"

import { PostData } from "../../interfaces/post-data.interface"
import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const waitForConfirmationAction: Action<PostData> = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Waiting for confirmation")

    let result: PostData

    const configureEndpoint = "/api/v1/media/configure/"

    logger.debug("Waiting for response")

    const response = await page.waitForResponse(
        (res: HTTPResponse) =>
            res.url().includes(configureEndpoint) && res.status() === 200 && res.request().method() === "POST",
        { timeout: 60000 * 2 },
    )

    const json = await response.json()

    if (json.status === "ok" && json.media) {
        const media = json.media

        result = {
            id: media.id,
            pk: media.pk,
            code: media.code,
            caption: media.caption?.text || "",
        }
    } else {
        throw new InstagramError("Failed to create post")
    }

    logger.debug("Response received. Waiting for confirmation text message")

    await page.waitForSelector(`xpath///*[contains(text(), "${config.confirmationText}")]`, {
        timeout: defaultTimeout,
    })

    logger.debug("Confirmation text message found")

    return result
}
