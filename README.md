# Lesoles Shopify Theme

Lesoles is a Shopify theme developed with Liquid, Vite, and the Shopify CLI.

## Requirements

- Node.js `24.21.0` (`x64`)
- npm
- Git
- Git Bash on Windows
- A Shopify store with Theme access

NVS is the recommended Node version manager for Windows:

```bash
nvs add node/24.21.0
nvs use node/24.21.0/x64
```

Check the active version before working:

```bash
node --version
```

It must show `v24.21.0`.

## First-Time Setup

Clone the repository, enter it, and install dependencies:

```bash
git clone https://github.com/meets45/Lesoles.git
cd Lesoles
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Update `.env` with the Shopify development store:

```dotenv
STORE_DOMAIN=your-store.myshopify.com
```

`.env` is ignored by Git and must never be committed.

Sign in to Shopify when prompted by the development or deployment commands. To sign out:

```bash
npm run shopify:logout
```

## Run Locally

Use Git Bash and activate Node before starting:

```bash
nvs use node/24.21.0/x64
npm start
```

This starts:

- Vite for frontend assets, normally on `http://localhost:5173`
- Shopify Theme Dev for the actual storefront preview, normally on `http://127.0.0.1:9292`

Open the **Shopify preview URL printed in the terminal**, or press `t` in the Shopify CLI terminal. Do not use the production domain for local development.

The VS Code workspace includes a `Lesoles Git Bash` terminal profile that automatically runs `nvs use node/24.21.0/x64` when NVS is installed.

## Build And Check

Create production assets:

```bash
npm run build
```

Check theme code with Shopify Theme Check:

```bash
nvs use node/24.21.0/x64
shopify theme check --path=shopify
```

Check formatting:

```bash
npm run format:check
```

## Project Structure

```text
src/
  components/       Reusable Liquid, JavaScript, and SCSS components
  entrypoints/      Vite CSS and JavaScript entry points
  assets/           Source assets copied into the Shopify theme
shopify/
  config/           Theme settings and saved settings data
  layout/           Shopify layouts
  sections/         Generated Shopify sections
  snippets/         Generated Shopify snippets
  templates/        Shopify JSON and Liquid templates
```

Edit component source files in `src/components`. Vite copies sections, snippets, and assets into `shopify/` during development and build.

## Shopify Commands

```bash
npm run shopify:dev
npm run shopify:push
npm run pull:all
npm run deploy:dev
npm run deploy:prd
```

Use `deploy:prd` only after confirming the target store, theme, content, and production settings.

## Windows Notes

The local `.npmrc` configures npm to use Git Bash when it runs package scripts. It is ignored by Git because Git Bash may be installed in a different path on another device.

If npm reports that it cannot find `bash.exe`, create or update a local `.npmrc` with the actual Git Bash path. For example:

```ini
script-shell=D:\\Git\\bin\\bash.exe
```

Do not commit `.npmrc`.

## Secrets And Generated Files

Do not commit:

- `.env`
- `.npmrc`
- `node_modules/`
- generated Shopify assets under `shopify/assets/`

The `shopify/.shopifyignore` file prevents Vite's local manifest from being uploaded to Shopify.
