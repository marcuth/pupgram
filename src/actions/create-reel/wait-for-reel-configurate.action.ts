import { PostData } from "../../interfaces/post-data.interface"
import { Action } from "../../interfaces"

export const waitForReelConfigureAction: Action<PostData> = async ({ page }) => {
    const start = Date.now()
    const timeout = 5 * 60_000

    while (Date.now() - start < timeout) {
        const response = await page.waitForResponse(
            (res) => res.url().includes("/api/v1/media/configure_to_clips/") && res.request().method() === "POST",
            { timeout: timeout },
        )

        const json = await response.json()

        if (json.media) {
            return {
                caption: json.caption?.text ?? "",
                id: json.media?.id,
                pk: json.media?.pk,
                code: json.media?.code,
            } as PostData
        }

        if (json.status === "fail" && json.message === "Transcode not finished yet.") {
            continue
        }

        throw new Error(`Unexpected response: ${JSON.stringify(json)}`)
    }

    throw new Error("Timeout waiting for Reel configure")
}
