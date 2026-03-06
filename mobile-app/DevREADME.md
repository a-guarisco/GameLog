# Project Settings

## Starting the project

**run on android studio:**

1. open android studio
2. click on virtual device manager and start the VM <img src="assets/images/docs-image.png" alt="drawing" width="400"/>

3. run: `bun run start`

### Minimal Workflow

before committing:

```bash
bun run lint:fix
bun run prettier:fix
```

## Useful stuff

### Linter

to check for linting:

```bash
bun run lint
```

to fix linting problems:

```bash
bun run lint:fix
```

settings for ESLint in `eslint.config.js`.

### Jest

to run every test (with coverage):

```bash
bun run test
```

settings for jest in `package.json`, under "jest".

### Prettier

if you need to just check for prettier formatting:

```bash
bun run prettier
```

if you want to automatically fix every formatting error:

```bash
bun run prettier:fix
```

settings for prettier in `.prettierrc`.

> [!NOTE]
> **every command in this document is to be run inside the mobile-app folder**
