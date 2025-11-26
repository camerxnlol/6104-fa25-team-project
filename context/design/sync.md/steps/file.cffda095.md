---
timestamp: 'Tue Nov 25 2025 20:58:43 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251125_205843.559f3a3a.md]]'
content_id: cffda0954e3bbcbff89bdbb800b89f1a00e5e1984bf74e17a0378dc30f5ff171
---

# file: src/syncs/reporting.sync.ts

```typescript
import { Reporting, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Initialize Object ---
export const InitializeObjectRequest: Sync = ({ request, session, user, objectId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/InitializeObject", session, objectId },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate the request, even if user ID isn't passed to the action
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Reporting.InitializeObject, { objectId }]),
});

export const InitializeObjectResponse: Sync = ({ request, objectId }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/InitializeObject" }, { request }],
    [Reporting.InitializeObject, {}, { objectId }],
  ),
  then: actions([Requesting.respond, { request, objectId }]),
});

export const InitializeObjectResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/InitializeObject" }, { request }],
    [Reporting.InitializeObject, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Report ---
export const ReportRequest: Sync = ({ request, session, user, objectId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/Report", session, objectId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  // Map the 'user' variable from the session to the 'userId' parameter
  then: actions([Reporting.Report, { objectId, userId: user }]),
});

export const ReportResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Report" }, { request }],
    [Reporting.Report, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ReportResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Report" }, { request }],
    [Reporting.Report, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Unreport ---
export const UnreportRequest: Sync = ({ request, session, user, objectId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Reporting/Unreport", session, objectId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  // Map the 'user' variable from the session to the 'userId' parameter
  then: actions([Reporting.Unreport, { objectId, userId: user }]),
});

export const UnreportResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Unreport" }, { request }],
    [Reporting.Unreport, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const UnreportResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reporting/Unreport" }, { request }],
    [Reporting.Unreport, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
