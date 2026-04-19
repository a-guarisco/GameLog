# Project Settings

## Starting the project

### expo go on android emulator

1. open android studio
2. click on virtual device manager and start the VM <img src="assets/docs-image.png" alt="drawing" width="400"/>

3. run: `npm run start`
4. check the current expo mode is Expo Go (in blue)
5. press "a" in the terminal to open the app in the android emulator
   - shift + a to select the emulator if you have more than one
6. if you have problems with the metro bundler, try to reset the cache with `npm run start -c`

### expo go - development build on android emulator

1. open android studio
2. click on virtual device manager and start the VM
3. run: `npm run android`
4. if the emulator doesn't open automatically, press "a" in the terminal to open the app in the android emulator
   - shift + a to select the emulator if you have more than one

note: use java 17

## Minimal Workflow

before committing:

```zsh
npm run lint:fix
npm run prettier:fix
```

## Useful stuff

### Linter

to check for linting:

```zsh
npm run lint
```

to fix linting problems:

```zsh
npm run lint:fix
```

settings for ESLint in `eslint.config.js`.

### Jest

to run every test (with coverage):

```zsh
npm run test
```

settings for jest in `package.json`, under "jest".

### Prettier

if you need to just check for prettier formatting:

```zsh
npm run prettier
```

if you want to automatically fix every formatting error:

```zsh
npm run prettier:fix
```

settings for prettier in `.prettierrc`.

### Note

Every command in this document is to be run inside the mobile-app folder.

## API Provider Switch

Use these scripts to choose the backend implementation:

```zsh
npm run start:steam
npm run start:backend
```

```zsh
npm run android:steam
npm run android:backend
```

If you need to override the backend URL:

```zsh
EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:9000 npm run start:backend
```

The provider is selected with `EXPO_PUBLIC_API_PROVIDER` and defaults to `steam`.
