---
timestamp: 'Mon Nov 24 2025 18:58:58 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_185858.908dcfeb.md]]'
content_id: ad3e2f013dd7df20cc37c962272b2eb4fc24fc49945d0d0c3be6f91f48cdc41b
---

# response:

```typescript
  /**
   * Report (objectId: string, userId: string)
   *
   * @requires a report for objectId exists and userId isn’t in its
   *           reporters set
   * @effects increment the count of the report that contains objectId. Add
   *          userId to its reporters set
   */
  async Report({ objectId, userId }: { objectId: ObjectId; userId: UserId }): Promise<Empty | { error: string }> {
    // The filter for the update will check both parts of the 'requires' clause:
    // 1. The document with `_id: objectId` must exist.
    // 2. The `reporters` array must not contain `userId`.
    const filter = {
      _id: objectId,
      reporters: { $ne: userId },
    };

    // The update operation performs the 'effects':
    // 1. Increment the count.
    // 2. Add the userId to the set of reporters. `$addToSet` is used to ensure uniqueness.
    const update = {
      $inc: { count: 1 },
      $addToSet: { reporters: userId },
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
      // If the report exists, it must be because the user is already in the reporters set.
      return { error: `User '${userId}' has already reported objectId '${objectId}'.` };
    }

    // If the update was successful, return an empty object.
    return {};
  }
```
