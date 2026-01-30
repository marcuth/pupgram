export class InstagramError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "InstagramError"
    }
}
