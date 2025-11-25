---
timestamp: 'Mon Nov 24 2025 19:04:27 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_190427.11ba772e.md]]'
content_id: 0852bcbf652ced02c9253be8c143faf72b2812f40ff1031b1d68cc6327bf4620
---

# file: src/concepts/Reporting/ReportingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Collection prefix, using the concept name for namespacing
const PREFIX = "Reporting" + ".";

// Generic types for this concept, using the branded ID type for clarity
type ObjectId = ID;
type UserId = ID;

/**
 * Represents the state for a single reported object.
 *
 * a set of Reports with
 *   an objectId of type string
 *   a count of type Number
 *   a reporters set of userId string
 */
interface Report {
  /** The unique identifier of the object being reported. */
  _id: ObjectId;
  /** The number of times this object has been reported. */
  count: number;
  /** A set of user IDs who have reported this object. Stored as an array. */
  reporters: UserId[];
}

/**
 * @purpose to create and keep track of reports made on objects
 */
export default class ReportingConcept {
  public readonly reports: Collection<Report>;

  constructor(private readonly db: Db) {
    this.reports = this.db.collection<Report>(PREFIX + "reports");
  }

  /**
   * InitializeObject (objectId: string): (objectId: string)
   *
   * @requires a report containing objectId doesn’t already exist
   * @effects Creates a new report with objectId. Set the report’s count=0
   *          and reporters set to empty. Return objectId
   */
  async InitializeObject(
    { objectId }: { objectId: ObjectId },
  ): Promise<{ objectId: ObjectId } | { error: string }> {
    // Check if a report for this objectId already exists (requires clause)
    const existingReport = await this.reports.findOne({ _id: objectId });
    if (existingReport) {
      return { error: `Report for objectId '${objectId}' already exists.` };
    }

    // Create the new report (effects clause)
    const newReport: Report = {
      _id: objectId,
      count: 0,
      reporters: [],
    };
    await this.reports.insertOne(newReport);

    // Return the objectId as specified
    return { objectId };
  }

  /**
   * Report (objectId: string, userId: string)
   *
   * @requires a report for objectId exists and userId isn’t in its
   *           reporters set
   * @effects increment the count of the report that contains objectId. Add
   *          userId to its reporters set
   */
  async Report(
    { objectId, userId }: { objectId: ObjectId; userId: UserId },
  ): Promise<Empty | { error: string }> {
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
      return {
        error: `User '${userId}' has already reported objectId '${objectId}'.`,
      };
    }

    // If the update was successful, return an empty object.
    return {};
  }
}

```
