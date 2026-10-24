# Security model

Developer and client accounts will be distinct identities, but all data access will be scoped server-side by workspace membership and project review grants. A project must never be discoverable or accessible solely from a client-supplied ID.

The extension uses no broad host permission: it has only `activeTab` and `storage`; future injection must follow an explicit, user-started review session and validate the active tab origin against a server-issued session allowlist. Authentication will use short-lived, audience-bound tokens suitable for the extension; refresh credentials must not be exposed to content scripts.

Media uploads will use short-lived, object-specific signed URLs after authorization. Screenshots and audio are sensitive: store private by default, encrypt in transit, minimize retention, audit access, and never expose raw object keys as access control. The API validates HTTP(S) URL origins, normalizes origins before comparison, and applies CORS only to approved dashboard origins. Content scripts treat page DOM as untrusted and communicate with the background through explicit messages.
