# Pupgram

**Pupgram** is a powerful automation library for Instagram built on top of `puppeteer`. It simplifies the process of interacting with Instagram programmatically, allowing you to log in, create posts, and manage your account with ease.

## 📦 Installation

Installation is straightforward; just use your preferred package manager. Here is an example using NPM:

```bash
npm i pupgram
```

## 🚀 Usage

<a href="https://www.buymeacoffee.com/marcuth">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200">
</a>

### Basic Example

Here is how to use `Pupgram` to log in and create a post.

```ts
import { Instagram, enConfig } from "pupgram"

async function main() {
    // 1. Initialize the Instagram instance
    const instagram = await Instagram.create({
        puppeteer: {
            userDataDir: ".user-data", // Persist session
            headless: "shell",
        },
        logLevel: "debug",
        screenshotOnError: true,
        config: enConfig, // Use English selectors/config
    })

    // 2. Ensure you are logged in
    await instagram.ensureLoggedIn({
        username: "your-username",
        password: "your-password",
    })

    // 3. Create a post
    const postData = await instagram.createPost({
        filePaths: ["./path/to/image.png"],
        caption: "Hello from Pupgram! 🚀",
    })

    console.log(`Post created! URL: https://www.instagram.com/p/${postData.code}`)
    console.log(postData)

    // 4. Close the instance
    await instagram.close()
}

main()
```

---

### Features

#### 🤖 Automated Interactions

Pupgram handles the complex DOM interactions required to navigate Instagram, including handling dialogues, buttons, and inputs.

#### 🔐 Login Management

Easily manage user sessions. `ensureLoggedIn` checks if a valid session exists and only performs a full login flow if necessary, saving time and reducing friction.

#### 📸 Post Creation

Automate content publishing with support for:
- **Multiple Files**: Upload one or more images/videos.
- **Captions**: Add rich text captions to your posts.
- **Confirmation**: Waiting for server confirmation to ensure the post is live before proceeding.

#### ⚙️ Configurable

Pupgram is designed to be flexible. You can provide custom configurations for different locales or UI variations using the `config` option in `Instagram.create`.

---

## 🧪 Tests (Not included yet, CONTRIBUTE! :D)

Automated tests are located in `__tests__`. To run them:

```bash
npm run test
```

## 🤝 Contributing

Want to contribute? Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-new`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-new`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the MIT License.