---
timestamp: 'Mon Nov 24 2025 19:09:11 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_190911.4af4abe5.md]]'
content_id: 02dd1396a1db1718dba6bf1c786ed8fc9dd09ddc665cc3cbee11cdb773f978b4
---

# response:

```typescript
  /**
   * Unreport (objectId: string, userId: string)
   *
   * @requires a report for objectId exists and userId is in its reporters
   *           set
   * @effects decrement the count for the report. Remove userId from its
   *          reporters set.
   */
  async Unreport({ objectId, userId }: { objectId: ObjectId; userId: UserId }): Promise<Empty | { error: string }> {
    // The filter for the update will check both parts of the 'requires' clause:
    // 1. The document with `_id: objectId` must exist.
    // 2. The `reporters` array must contain `userId`.
    const filter = {
      _id: objectId,
      reporters: userId,
    };

    // The update operation performs the 'effects':
    // 1. Decrement the count.
    // 2. Remove the userId from the set of reporters. `$pull` is used for this.
    const update = {
      $inc: { count: -1 },
      $pull: { reporters: userId },
    };

    const result = await this.reports.updateOne(filter, update);

    // If `modifiedCount` is 0, it means the filter did not match any document,
    // which implies that one of the 'requires' conditions was not met.
    if (result.modifiedCount === 0) {
      // To provide a specific error, we check which condition failed.
      const report = await this.reports.findOne({ _id: objectId });
      if (!report) {
        return { error: `Report for objectId '${objectId}' does not exist.` };
      }
      // If the report exists, it must be because the user is not in the reporters set.
      return { error: `User '${userId}' has not reported objectId '${objectId}'.` };
    }

    // If the update was successful, return an empty object.
    return {};
  }
```
