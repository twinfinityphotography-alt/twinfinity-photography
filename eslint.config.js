export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        navigator: "readonly",
        IntersectionObserver: "readonly",
        Intl: "readonly",
        history: "readonly",
        setTimeout: "readonly",
        encodeURIComponent: "readonly",
        Number: "readonly",
        alert: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "prefer-const": "warn",
      "no-var": "error"
    }
  }
];