import { HTTPResponse } from "puppeteer"

import { PostData } from "../../interfaces/post-data.interface"
import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const waitForPostConfigureAction: Action<PostData> = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Waiting for confirmation")

    let result: PostData

    const configureEndpoints = ["/api/v1/media/configure/", "/api/v1/media/configure_sidecar/"]

    logger.debug("Waiting for response")

    const response = await page.waitForResponse(
        (res: HTTPResponse) =>
            configureEndpoints.some((endpoint) => res.url().includes(endpoint)) &&
            res.status() === 200 &&
            res.request().method() === "POST",
        { timeout: 60000 * 5 },
    )

    const json = await response.json()

    if (json.status !== "ok" || !json.media) {
        throw new InstagramError("Failed to create post")
    }

    const media = json.media

    result = {
        id: media.id ?? media.pk,
        pk: media.pk,
        code: media.code,
        caption: media.caption?.text || "",
    }

    logger.debug("Response received. Waiting for confirmation text message")

    await page.waitForSelector(`xpath///*[contains(text(), "${config.confirmationText}")]`, {
        timeout: defaultTimeout,
    })

    logger.debug("Confirmation text message found")

    return result
}
