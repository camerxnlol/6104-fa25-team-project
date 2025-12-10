[@concept-background](../../tools/concept-background.md)

[@sync-background](../../tools/sync-background.md)

[@sample-syncs](../../../src/syncs/sample.sync.ts)

[@current-api](../../../src/syncs/reporting.sync.ts)

[@reporting-implementation](../../../src/concepts/Reporting/ReportingConcept.ts)

[@countryrecommendation-implementation](../../../src/concepts/CountryRecommendation/CountryRecommendationConcept.ts)


# prompt: given the implementationa nd current api syncs for a Reporting concept, create a sync for the reporting concept that fires off any time a report request is recieved. It should check how many reports the object has after adding the new report. if it exceeds 67 reports, then you should use CountryRecommendation.removeCommunityRec, whose implementation is also provided.

# response:

# solution:

# file: src/syncs/reporting.sync.ts

```typescript
import { CountryRecommendation, Reporting, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Initialize Object ---
export const InitializeObjectRequest: Sync = (
  { request, session, user, objectId },
) => ({
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
export const UnreportRequest: Sync = (
  { request, session, user, objectId },
) => ({
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

/**
 * When an object's report count exceeds 67 after a new report is made,
 * automatically remove the corresponding community recommendation.
 */
export const RemoveCommunityRecOnHighReports: Sync = (
  { request, objectId, count },
) => ({
  when: actions(
    // We match the original request to get the context (objectId)
    [Requesting.request, { path: "/Reporting/Report", objectId }, { request }],
    // This sync triggers *after* the report action has successfully completed.
    [Reporting.Report, { objectId }, {}],
  ),
  where: async (frames) => {
    // After reporting, we query for the object's new report count.
    frames = await frames.query(
      Reporting._getReportCount,
      { objectId },
      { count },
    );
    // We only proceed if the count is greater than the threshold of 67.
    return frames.filter(($) => $[count] > 67);
  },
  then: actions(
    // If the condition is met, remove the community recommendation.
    // We map the `objectId` from the report to the `recId` of the recommendation.
    [CountryRecommendation.removeCommunityRec, { recId: objectId }],
  ),
});
```

# prompt: the last sync does not work because "object is of type unknown". The issue is in the line return frames.filter(($) => $[count] > 67);. Try fix this and return ONLY this sync

# response:

# solution:

```typescript
/**
 * When an object's report count exceeds 67 after a new report is made,
 * automatically remove the corresponding community recommendation.
 */
export const RemoveCommunityRecOnHighReports: Sync = (
  { request, objectId, count },
) => ({
  when: actions(
    // We match the original request to get the context (objectId)
    [Requesting.request, { path: "/Reporting/Report", objectId }, { request }],
    // This sync triggers *after* the report action has successfully completed.
    [Reporting.Report, { objectId }, {}],
  ),
  where: async (frames) => {
    // After reporting, we query for the object's new report count.
    frames = await frames.query(
      Reporting._getReportCount,
      { objectId },
      { count },
    );
    // We only proceed if the count is greater than the threshold of 67.
    // Cast the value to 'number' to satisfy TypeScript's type checker.
    return frames.filter(($) => ($[count] as number) > 67);
  },
  then: actions(
    // If the condition is met, remove the community recommendation.
    // We map the `objectId` from the report to the `recId` of the recommendation.
    [CountryRecommendation.removeCommunityRec, { recId: objectId }],
  ),
});
```