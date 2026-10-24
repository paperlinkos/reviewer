# Extension authentication plan

The extension will never store a password or a permanent developer credential. A future user-initiated connection flow will exchange a browser-authenticated, short-lived, audience-bound authorization grant through the backend. The background worker may retain only short-lived credentials in extension storage and must request renewal through an explicit session flow. Content scripts never receive session secrets.
