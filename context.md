# Automatic continuation context

The API/web project and client-review milestone is verified: API integration
14/14, API unit 4/4, API typecheck/build, and web typecheck/build pass.

The extension foundation now uses MV3 `activeTab` plus `scripting` only after a
popup click. It dynamically injects a review overlay into the current tab,
places removable temporary pins on deliberate clicks, and removes all overlay
elements/listeners when disabled. It does not request microphone, screenshot,
history, or broad host permissions.

Feedback migration `20261024195000_feedback` is applied to both local project
databases. A real end-to-end API test now covers invitation redemption, client
pinned-feedback creation, coordinate validation, project isolation, developer
listing, status update, and reply. Integration suite is 15/15 passing. The
shared error filter now maps Zod validation errors to HTTP 400.

Next: dashboard feedback inbox and extension composer/persistence handoff.
Do not place client session credentials in extension storage; the secure handoff
requires a short-lived, project-bound exchange mechanism rather than reuse of
the web HttpOnly cookie. Media capture remains explicit-action only.

Web feedback inbox production build now passes. Extension authorization is
blocked on a required security configuration decision: an extension fetch has
the distinct `chrome-extension://<extension-id>` origin and cannot safely use
the web review HttpOnly cookie under current API CORS. Implement a one-time
handoff only after a stable extension ID/origin is configured and allowlisted;
then bind its short-lived exchange to the review session and project.
