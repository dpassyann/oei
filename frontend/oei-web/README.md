# OeiWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Notes on the `lmdb` pnpm override and `.npmrc`

`package.json` pins `pnpm.overrides.lmdb` to `npm:is-odd@3.0.1`, and `.npmrc` sets
`virtual-store-dir=node_modules/.pnpm`. Both exist to work around a sandboxed-environment-specific
`pnpm install` failure, not to change any runtime behavior:

- `lmdb` is only ever pulled in transitively as Angular's optional disk build cache backend, and that
  cache is explicitly disabled in `angular.json` (`cli.cache.enabled: false`). It is never functionally
  needed by this project.
- One of `lmdb`'s own dependencies, `ordered-binary`, ships a native/prebuilt file that certain
  sandboxed CI/dev environments refuse to write during install, causing `pnpm install` to fail. Since
  `lmdb` is unused here, overriding it to a trivial package (`is-odd`) avoids ever installing the
  problematic dependency, sidestepping the failure entirely.

**If the Angular build cache is ever re-enabled** (`cli.cache.enabled: true` in `angular.json`), the
`lmdb` override above must be removed first — otherwise the cache will silently fail to work because
the real `lmdb` package is no longer installed.
