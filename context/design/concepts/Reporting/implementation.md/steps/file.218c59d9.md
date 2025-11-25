---
timestamp: 'Mon Nov 24 2025 18:43:58 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_184358.401e896b.md]]'
content_id: 218c59d97b56adf8d289b3e6392d11bb3eac4af1b45c495c250f1391ad703d5e
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

  // Actions and queries to be implemented in the next steps.
}
```
