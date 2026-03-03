# Project Settings
### Starting the project:

**run on android studio:**
1. open android studio
2. click on virtual device manager and start the VM <img src="assets/docs-image.png" alt="drawing" width="400"/>

3. run: ``` npm run android ```


### Minimal Workflow

before committing:

```
npm run lint -- --fix
npm run prettier:fix
```



# Useful stuff

### Linter

to check for linting:
```
npm run lint
```

to fix linting problems:
```
npm run lint -- --fix
```

settings for ESLint in `eslint.config.js`.


### Jest

to run every test (with coverage):
```
npm run test
```

settings for jest in `package.json`, under "jest".


### Prettier

if you need to just check for prettier formatting:
```
npm run prettier
```

if you want to automatically fix every formatting error:
```
npm run prettier:fix
```

settings for prettier in `.prettierrc`.

**every command in this document is to be run inside the mobile-app folder**