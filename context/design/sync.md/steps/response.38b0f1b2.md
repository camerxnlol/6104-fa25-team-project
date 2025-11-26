---
timestamp: 'Tue Nov 25 2025 20:52:20 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205220.4783c4a6.md]]'
content_id: 38b0f1b24bbae4984843fa7e2e3869aaeee88c20f4ba5114d9ab9d2bbeb428c1
---

# response:

I will create the synchronizations for the routes specified as "excluded" in the `passthrough.ts` file. These syncs will re-implement the passthrough logic but add an authorization layer, typically by requiring a valid session to identify the user performing the action. Each excluded route will generally have three corresponding syncs: one for the initial request and authorization, one for handling a successful response from the concept, and one for handling an error response.

I will create a new file, `src/syncs/app.sync.ts`, to house these new synchronizations.
