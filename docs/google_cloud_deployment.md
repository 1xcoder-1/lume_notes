# ☁️ Deploying Lume Notes to Google Cloud Run

This guide explains how to deploy the Lume Notes monorepo to Google Cloud Run using Docker and Google Cloud Build.

## 🏗️ Prerequisites

1. **Google Cloud Project**: Created and active.
2. **gcloud CLI**: Installed and authenticated (`gcloud auth login`).
3. **Artifact Registry**: A repository created (e.g., `lume-repo` in `us-central1`).

## 📦 Containerization

We use a multi-stage `Dockerfile` optimized for Turborepo and Next.js standalone mode.

### 1. Build the Image

Use Google Cloud Build to compile the project. We pass the `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` as a build argument so it's embedded in the client-side bundle.

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_LIVEBLOCKS_KEY="your_liveblocks_public_key" .
```

## 🚀 Deployment

Deploy the built image to Cloud Run.

```bash
gcloud run deploy lume-notes \
  --image us-central1-docker.pkg.dev/[PROJECT_ID]/lume-repo/lume-notes:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="AUTH_TRUST_HOST=true" \
  --set-env-vars="NEXTAUTH_URL=https://[YOUR_CLOUD_RUN_URL]" \
  --set-env-vars="DATABASE_URL=[YOUR_DATABASE_URL]" \
  --set-env-vars="AUTH_SECRET=[YOUR_SECRET]" \
  --set-env-vars="GITHUB_CLIENT_ID=[ID]" \
  --set-env-vars="GITHUB_CLIENT_SECRET=[SECRET]" \
  --set-env-vars="GOOGLE_CLIENT_ID=[ID]" \
  --set-env-vars="GOOGLE_CLIENT_SECRET=[SECRET]" \
  --set-env-vars="BREVO_API_KEY=[KEY]" \
  --set-env-vars="GOOGLE_GENERATIVE_AI_API_KEY=[KEY]" \
  --set-env-vars="NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=[KEY]"
```

## 🔑 Critical Environment Variables

| Variable                            | Description                                                |
| ----------------------------------- | ---------------------------------------------------------- |
| `AUTH_TRUST_HOST`                   | Set to `true` to allow NextAuth to work on Cloud Run URLs. |
| `NEXTAUTH_URL`                      | The public URL of your Cloud Run service.                  |
| `DATABASE_URL`                      | Connection string for PostgreSQL (Supabase/Neon).          |
| `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` | Must be provided both at **Build Time** and **Runtime**.   |

## 🛠️ Configuration Files

- `Dockerfile`: Multi-stage build for monorepo support.
- `cloudbuild.yaml`: CI/CD configuration for Google Cloud Build.
- `.dockerignore`: Optimized to reduce upload size.
