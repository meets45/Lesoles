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
npm run pull:content
npm run pull:all
npm run deploy:dev
npm run deploy:prd
```

Routine push and deploy commands preserve Theme Editor-managed content: `templates/*.json`, `sections/*.json`, `locales/*.json`, and `config/settings_data.json`. Use `push:content` only for an intentional, reviewed content migration to the theme selected by Shopify CLI. `shopify:dev` uses Theme Editor sync so editor changes on an existing development theme are retained while working locally.

Use `deploy:prd` only after confirming the target store, theme, content, and production settings.

## GitHub Actions Deployment

The repository has three environment branches and matching Shopify deployment workflows:

- `lesoles-development` deploys to the Development theme after every push.
- `lesoles-preprod` deploys to the Preproduction theme after every push.
- `lesoles-prod` deploys to the Production theme after every push and can update the live theme.

Create feature branches from `lesoles-development` and merge completed work back into it. Promote validated code by creating a PR from `lesoles-development` to `lesoles-preprod`, then from `lesoles-preprod` to `lesoles-prod`, or run `Promote Theme Code` in GitHub Actions.

All three workflows use the same store and Theme Access password. Configure these repository Actions secrets before running a workflow:

| Environment | Theme ID secret |
| --- | --- |
| Production | `SHOPIFY_THEME_ID` |
| Preproduction | `SHOPIFY_PREPROD_THEME_ID` |
| Development | `SHOPIFY_DEV_THEME_ID` |

Shared secrets: `SHOPIFY_STORE` must be a permanent `*.myshopify.com` store domain, and `SHOPIFY_CLI_THEME_TOKEN` must be the Theme Access password. Theme IDs must be numeric.

## Theme Content Sync

`Sync Production Theme Content` runs every two hours and can also be started manually. It pulls only merchant-managed JSON from the production theme and creates or updates the `chore/sync-production-theme-content` pull request against `lesoles-development`.

Merging that PR updates `lesoles-development`'s content baseline. Routine deployment intentionally does not upload these files to the development theme, so a code push cannot overwrite content changed in Shopify. Use `push:content` only when the content baseline must be intentionally applied to a selected theme.

GitHub runs scheduled workflows from the repository's default branch. Keep this workflow on that branch so the schedule can run, even though the automated content PR targets `lesoles-development`. Create all three environment branches on GitHub before enabling the workflows.

## Code Promotion

`Promote Theme Code` lets an authorized user promote `lesoles-development` to `lesoles-preprod` or `lesoles-preprod` to `lesoles-prod` without creating a PR. It allows fast-forward promotions only; a diverged destination branch must be resolved through a PR.

Add a repository secret named `PROMOTION_TOKEN` before using this workflow. It must be a fine-grained personal access token or GitHub App token with read and write access to repository contents. Configure a required-review environment named `production` before enabling production promotion.

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
