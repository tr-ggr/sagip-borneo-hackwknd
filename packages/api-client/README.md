# @wira-borneo/api-client

Generated typed API client from the NestJS OpenAPI document.

## Generate

```sh
npm run generate -w @wira-borneo/api-client
```

## How It Works

- `openapi:sync` downloads `http://localhost:3333/api/openapi.json` into `openapi/openapi.json`.
- `generate` runs sync first, then runs Orval to produce `src/generated/api-client.ts`.

Override API URL when needed:

```sh
$env:API_OPENAPI_URL="http://localhost:3333/api/openapi.json"; npm run generate -w @wira-borneo/api-client
```

## Ownership And Update Workflow

- Source of truth: NestJS controllers/DTO Swagger metadata in `apps/api`.
- Generated file ownership: `src/generated/api-client.ts` is generated output; do not hand-edit.
- To update after API changes:
	1. Ensure API is running (`npm run dev:api`).
	2. Regenerate (`npm run api:client:generate`).
	3. Commit generated diff with related API change.
