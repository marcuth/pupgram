import prettierRecommended from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"

export default [
    { ignores: ["dist/**", "coverage/**", "errors/**", "playground/**"] },
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: { parser: tseslint.parser },
    },
    prettierRecommended,
]
