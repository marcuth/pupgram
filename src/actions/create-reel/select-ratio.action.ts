import { InstagramError } from "../../error"
import { Action } from "../../interfaces"

export const selectRatioAction: Action<void> = async ({ page, config, logger, defaultTimeout }) => {
    logger.info("Selecting ratio")

    const selectRatioSelector = `xpath///button[.//*[name()='svg']//*[name()='title' and text()='${config.reelSelectRatioText}']]`

    const videoElement = await page.waitForSelector("video", { timeout: defaultTimeout })

    if (!videoElement) {
        throw new InstagramError("Video element not found")
    }

    logger.debug("Video element found")

    await page.evaluate((videoElement) => {
        const container = videoElement.closest("div")

        if (container instanceof HTMLElement) {
            container.dataset.__oldDisplay = container.style.display
            container.style.display = "none"
        }
    }, videoElement)

    logger.debug("Video container display hidden")

    try {
        const selectRatioElement = await page.waitForSelector(selectRatioSelector, {
            timeout: defaultTimeout,
        })

        if (!selectRatioElement) {
            throw new InstagramError("Select ratio element not found")
        }

        await selectRatioElement.click()

        logger.debug("Select ratio element clicked")

        const originalRatioElement = await page.waitForSelector(
            `xpath///div[./span[contains(text(), '${config.reelSelectOriginalRatioText}')]]`,
            { timeout: defaultTimeout },
        )

        if (!originalRatioElement) {
            throw new InstagramError("Original ratio element not found")
        }

        await originalRatioElement.click()

        logger.debug("Original ratio element clicked")
    } finally {
        logger.info("Restoring video container display")

        await page.evaluate(() => {
            document.querySelectorAll("div[data-__old-display]").forEach((el) => {
                const oldDisplay = el.getAttribute("data-__old-display")
                ;(el as HTMLElement).style.display = oldDisplay || ""
                el.removeAttribute("data-__old-display")
            })
        })
    }

    logger.debug("Original ratio element clicked")
}
