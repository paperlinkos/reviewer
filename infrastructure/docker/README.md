# Local infrastructure

The root `docker-compose.yml` runs PostgreSQL 16 and MinIO, an S3-compatible local object store. Run `docker compose up -d` after copying `.env.example` to `.env`. MinIO's console is available at `http://localhost:9001`.
