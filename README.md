# WiraBorneo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

To build the library use:

```sh
npx nx build pkg1
```

To run any task with Nx use:

```sh
npx nx <target> <project-name>
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Local Development URLs

Use these defaults when running apps locally:

- API: `http://localhost:3333/api`
- Tracker: `http://localhost:4444`
- Admin: `http://localhost:3192`
- Mobile (web dev server): `http://localhost:8888`

These ports are the default local development contract for contributors.

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## API Prisma Workflow

Prisma is configured in `apps/api` with a PostgreSQL datasource.

### Local setup

1. Create `apps/api/.env` from `apps/api/.env.example` and set `DATABASE_URL`.
2. Validate schema:

```sh
npm run prisma:validate -w @wira-borneo/api
```

3. Generate client:

```sh
npm run prisma:generate -w @wira-borneo/api
```

4. Check migration status:

```sh
npm run prisma:migrate:status -w @wira-borneo/api
```

### CI checks

Use these tasks in CI after installing dependencies and setting `DATABASE_URL`:

```sh
npx nx run api:prisma-validate
npx nx run api:prisma-generate
npx nx test api
```

### Deployment order

Run Prisma client generation before applying migrations:

```sh
npx nx run api:prisma-prepare-deploy
```

This runs:
1. `api:prisma-generate`
2. `api:prisma-migrate-deploy`

### Rollback guidance

If deployment fails after migrations:
1. Roll back application deployment to the previous version.
2. Restore database from backup or apply a reviewed reverse SQL script for the specific migration.
3. Regenerate Prisma client for the rolled-back schema version before re-deploying.

## API Authentication (Better Auth)

The NestJS API (`apps/api`) uses Better Auth for credential authentication and
session management.

### Required environment variables

Configure these in `apps/api/.env`:

- `AUTH_SECRET`: long random secret for token/cookie signing.
- `AUTH_BASE_URL`: API origin (for local dev: `http://localhost:3333`).
- `AUTH_TRUSTED_ORIGINS` (optional): comma-separated origins allowed to send
	credentialed auth requests.

Example local trusted origins:

- `AUTH_TRUSTED_ORIGINS="http://localhost:4444,http://localhost:3192,http://localhost:8888"`

### Auth endpoints

All routes are under the global prefix `/api`:

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`

Protected route example:

- `GET /api/protected` (requires active authenticated session)

## API OpenAPI and Orval Client

Swagger is available from the API during local development:

- UI: `http://localhost:3333/api/docs`
- OpenAPI JSON: `http://localhost:3333/api/openapi.json`

The generated typed client lives in `packages/api-client`.

### Generate client from local API

1. Start API:

```sh
npm run dev:api
```

2. In another terminal, generate client:

```sh
npm run api:client:generate
```

3. Optional deterministic check (no diffs on rerun with unchanged input):

```sh
npm run api:client:generate:check
```

Ownership notes:

- Edit API behavior and Swagger metadata in `apps/api`.
- Do not hand-edit `packages/api-client/src/generated/api-client.ts`; regenerate instead.

## SAGIP Demo Screen Recording Plan

### Goal

Map each major section of the 8-minute SAGIP pitch to specific screen recordings from the existing admin, mobile, and tracker apps, and clearly mark which beats will rely on future functionality or static slides for now.

### Key Files / Surfaces

- Admin web app (dashboards, maps, registries, logs)
- Mobile app (map/forecast views, pin-location/report flows)
- Tracker page (candidate for command center / live-ops visualization)

### High-Level Flow

- **Hook / Problem (0:00–1:00)**: Use B-roll and slides; no product recording required.
- **Infrastructure Reality (1:15–1:45)**: Short admin or tracker map view over ASEAN region, optionally with overlays; fallback to slide.
- **Before Disaster (Preparedness) (1:45–3:00)**:
  - Show admin map with building/household markers (as "digital census & vulnerability mapping").
  - Use any existing filters/layers to imply risk and vulnerability; if not present, keep generic.
  - No live AI vulnerability scoring yet; treat as future/TBD.
- **AI Preparedness Assistant (SEA-Lion)**:
  - If no chatbot in product yet, rely on static mock UI or slide only; mark as future.
- **Volunteer & Asset Registry + AI Simulation Sandbox**:
  - If any admin lists/forms for volunteers, assets, or resources exist, record navigating and adding a record.
  - For simulation sandbox, assume not yet implemented; use conceptual slide only.
- **During Disaster (3:00–5:15)**:
  - Use mobile app to show a resident opening the map, pinning location, and submitting a distress/needs report.
  - Use admin or tracker to show those requests appearing as structured tickets on a map/list, with basic filtering.
  - Use tracker page as the visual for the "command control center" (teams, resources, clusters), even if current data is limited.
- **After Disaster (5:15–6:15)**:
  - If mobile/photo reporting exists, show creating a damage report with photo upload and location.
  - If not, use slide/mock and mark as future; same for blockchain aid ledger.
- **Why SAGIP / Responsible AI / Vision (6:15–7:35)**:
  - Focus on clean comparison tables and ecosystem diagrams as slides; briefly cut back to any strong map/dashboard shots if helpful.

### Notes

- For beats tied to not-yet-implemented functionality (SEA-Lion assistant, AI vulnerability scoring, AI simulation sandbox, computer-vision damage mapping, blockchain ledger), rely on static mocks or slides and clearly label them as **future capabilities** in internal notes, even if the spoken script is present-tense.
- Prefer continuous, narrative-friendly recordings (capture whole flows) and trim in editing, rather than many micro-clips.
