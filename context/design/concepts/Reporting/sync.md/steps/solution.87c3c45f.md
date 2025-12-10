---
timestamp: 'Tue Dec 09 2025 20:47:00 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251209_204700.cc68069d.md]]'
content_id: 87c3c45ff5ee2710058287b18d771142dbd452445590827f23a110d3200959da
---

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
