---
timestamp: 'Tue Nov 25 2025 20:58:43 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205843.559f3a3a.md]]'
content_id: e5e1d56702b63d579771ef16270d564577e70629cf6abab48fc0b194c91e4c01
---

# file: src/syncs/passport.sync.ts

```typescript
import { Passport, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Log Exploration ---
export const LogExplorationRequest: Sync = ({ request, session, user, song, country }) => ({
  when: actions([
    Requesting.request,
    { path: "/Passport/logExploration", session, song, country },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Passport.logExploration, { user, song, country }]),
});

export const LogExplorationResponse: Sync = ({ request, entry }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { entry }],
  ),
  then: actions([Requesting.respond, { request, entry }]),
});

export const LogExplorationResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
