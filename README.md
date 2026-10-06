# TourFlow AI backend

FastAPI backend for the TourFlow AI hackathon project. The API verifies
Supabase access tokens, enforces resource-level authorization, and uses
PostgreSQL row-level security as defense in depth.

## Run locally

1. Create and activate a Python 3.11+ virtual environment.
2. Install `pip install -e ".[dev]"`.
3. Copy `.env.example` to `.env`, configure Supabase and a PostgreSQL URL, and
   apply the SQL migration in `supabase/migrations`.
4. Start `uvicorn app.main:app --app-dir backend --reload`.

The default SQLite database is intended only for local development and tests.
Schema auto-creation applies only to SQLite. PostgreSQL deployments must apply
the checked-in migration; never enable a service-role credential for client use.
Configure `TOURFLOW_CORS_ORIGINS` as a comma-separated allowlist. AI routes
return an explicit `AI_PROVIDER_ERROR` until the server-side AI provider
settings are configured.

Interactive API documentation is available at `/docs`; the stable contract
summary is in [`api/openapi.yaml`](api/openapi.yaml).

## Checks

```powershell
pytest
ruff check backend
```
