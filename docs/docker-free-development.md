# Docker-free local development

Phase 00 supports a lightweight local mode: PostgreSQL runs through an existing local installation and media uses a private filesystem adapter. Docker Compose remains optional for a later PostgreSQL/MinIO environment.

Set `DATABASE_URL` to the isolated local PostgreSQL role/database, `STORAGE_PROVIDER=local`, and `LOCAL_MEDIA_DIR` to an absolute directory outside a public web root. The default directory is `/tmp/visual-feedback-media`; it is created owner-only. It is not exposed by an HTTP route. `LOCAL_MEDIA_MAX_UPLOAD_BYTES` defaults to 25 MiB.

The adapter validates generated UUID identifiers, rejects traversal, creates files with mode `0600`, limits size, and currently permits signature-checked PNG, JPEG, and WAV content. It is an infrastructure boundary only: no upload or media-serving feature is included. S3 configuration remains validated for a future adapter when `STORAGE_PROVIDER=s3`.

`pnpm db:migrate` applies committed migrations with `prisma migrate deploy`, so the application role does not need permission to create a Prisma shadow database. Creating new migrations later is an explicit local administrator/developer action using `prisma migrate dev` and a role with `CREATEDB`; that action is not part of Phase 00.
