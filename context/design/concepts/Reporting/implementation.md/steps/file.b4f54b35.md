---
timestamp: 'Mon Nov 24 2025 18:58:41 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_185841.dfde2cff.md]]'
content_id: b4f54b3540a005120452a1ef654a8f33d5e61b2183dd4fd426c32a2a85698fc1
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
}

```
