# Initial Settings for Telegram Bot with Google Gemini AI API

This project provides the initial setup for a TypeScript-based Telegram bot that integrates with Google's Gemini AI API. It combines the power of the [Grammy](https://grammy.dev) framework for building Telegram bots with the capabilities of Google's Generative AI API, enabling you to create intelligent and interactive bots.

---

## Features

- **TypeScript Support**: Leverages strong typing for robust and maintainable code.
- **AI Integration**: Integrates with Google's Generative AI via `@google/generative-ai` package.
- **Modular Structure**: Organized file system for better scalability and maintainability.
- **Development Tools**:
  - Live reload using `nodemon`
  - Path aliasing with `module-alias` and `tsconfig-paths`
  - Pre-configured ESLint and Prettier for code quality

---

## Getting Started

### Prerequisites

- Node.js >= 16.0
- npm or yarn installed
- A Google Generative AI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/init-bot-with-gemini.git
   cd init-bot-with-gemini
   ```

2. Install dependencies of the project:

   ```
   npm install
   ```

3. Command for the build of the project:

   ```
   npm build
   ```

4. Kickstart the project by launching it on your local server!:

   ```
   npm dev
   ```

**Create a .env.local file to store environment variables. Add your Google API key and Telegram Bot token:**

```
- GOOGLE_AI_API_KEY=your-google-api-key
- GOOGLE_AI_API_KEY=your-telegram-bot-token
```

## Project Structure

**The project is organized into various directories for better modularization and scalability:**

`src/

- ├── config/ # Environment and configuration files
- ├── controllers/ # Handlers for bot commands and messages
- ├── models/ # TypeScript models and schemas
- ├── modules/ # Modularized features and utilities
- ├── providers/ # Services and API integrations
- ├── services/ # Business logic and AI integrations
- │ ├── generates/ # Text generation logic (e.g.,`generateText.ts`)
- ├── utils/ # Helper functions and shared utilities
- ├── index.ts # Application entry point
  `

## Path Aliases

**To simplify imports, the following path aliases are configured in tsconfig.json and \_moduleAliases:**
`

- @config → src/config
- @controllers → src/controllers
- @models → src/models
- @modules → src/modules
- @providers → src/providers
- @services → src/services
- @utils → src/utils
- `import { generateText } from "@services/generates/generateText";`
  `
