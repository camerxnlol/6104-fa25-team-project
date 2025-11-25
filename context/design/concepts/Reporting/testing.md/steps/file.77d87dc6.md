---
timestamp: 'Mon Nov 24 2025 19:04:27 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_190427.11ba772e.md]]'
content_id: 77d87dc6dbc60a0720183c8929ea9269a05e1bd2f296450870f1046a92a76323
---

# file: src/concepts/Reporting/ReportingConcept.test.ts

```typescript
import { assertEquals, assertExists } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import ReportingConcept from "./ReportingConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("Reporting Concept: InitializeObject Action", async (t) => {
  await t.step(
    "Operational Principle: A user can initialize a new object for reporting.",
    async () => {
      console.log(
        "--- Test: Initialize a single new object successfully. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post1" as ID;

      console.log(`Action: InitializeObject with objectId: '${objectId}'`);
      const result = await reporting.InitializeObject({ objectId });

      console.log("Verifying effects...");
      // 1. Check the return value
      assertEquals(
        result,
        { objectId },
        "The action should return the objectId on success.",
      );

      // 2. Check the database state directly
      const reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertExists(
        reportInDb,
        "A report document should be created in the DB.",
      );
      assertEquals(
        reportInDb,
        {
          _id: objectId,
          count: 0,
          reporters: [],
        },
        "The created report should have count=0 and an empty reporters set.",
      );
      console.log("Success: Object initialized with correct default state.");

      await client.close();
    },
  );

  await t.step(
    "Scenario: Attempting to initialize an object that already exists.",
    async () => {
      console.log(
        "\n--- Test: Fail to initialize a duplicate object. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post-abc" as ID;

      console.log(
        `Action 1: InitializeObject with objectId: '${objectId}' (should succeed).`,
      );
      await reporting.InitializeObject({ objectId });

      console.log(
        `Action 2: InitializeObject with the same objectId: '${objectId}' (should fail).`,
      );
      const result = await reporting.InitializeObject({ objectId });

      console.log("Verifying 'requires' clause...");
      // 1. Check that the result is an error object
      assertExists(
        (result as { error: string }).error,
        "The action should return an error when the object already exists.",
      );
      assertEquals(
        (result as { error: string }).error,
        `Report for objectId '${objectId}' already exists.`,
      );

      // 2. Check that the database state is unchanged by the failed action
      const reportsInDb = await reporting.reports.find({ _id: objectId })
        .toArray();
      assertEquals(
        reportsInDb.length,
        1,
        "There should still be only one report for this objectId in the DB.",
      );
      console.log(
        "Success: Requirement fulfilled; duplicate initialization prevented.",
      );

      await client.close();
    },
  );

  await t.step(
    "Scenario: Initializing multiple, distinct objects.",
    async () => {
      console.log(
        "\n--- Test: Successfully initialize several different objects. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId1 = "comment-123" as ID;
      const objectId2 = "user-profile-456" as ID;

      console.log(`Action 1: InitializeObject with objectId: '${objectId1}'`);
      const result1 = await reporting.InitializeObject({ objectId: objectId1 });
      console.log(`Action 2: InitializeObject with objectId: '${objectId2}'`);
      const result2 = await reporting.InitializeObject({ objectId: objectId2 });

      console.log("Verifying effects for both objects...");
      // 1. Check return values
      assertEquals(result1, { objectId: objectId1 });
      assertEquals(result2, { objectId: objectId2 });

      // 2. Check total count in collection
      const totalCount = await reporting.reports.countDocuments();
      assertEquals(
        totalCount,
        2,
        "The total number of reports in the collection should be 2.",
      );

      // 3. Verify the state of the first object
      const report1InDb = await reporting.reports.findOne({ _id: objectId1 });
      assertExists(report1InDb);
      assertEquals(report1InDb.count, 0);
      assertEquals(report1InDb.reporters, []);

      // 4. Verify the state of the second object
      const report2InDb = await reporting.reports.findOne({ _id: objectId2 });
      assertExists(report2InDb);
      assertEquals(report2InDb.count, 0);
      assertEquals(report2InDb.reporters, []);

      console.log(
        "Success: Both objects initialized correctly and independently.",
      );

      await client.close();
    },
  );

  await t.step(
    "Scenario: Using an empty string as an objectId.",
    async () => {
      console.log(
        "\n--- Test: Attempting to initialize an object with an empty string ID. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "" as ID; // This is a non-standard but possible case

      console.log(`Action: InitializeObject with an empty string objectId.`);
      const result = await reporting.InitializeObject({ objectId });

      console.log("Verifying effects...");
      assertEquals(
        result,
        { objectId },
        "The action should succeed even with an empty string ID.",
      );

      const reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertExists(
        reportInDb,
        "A report document for the empty string ID should exist.",
      );
      assertEquals(
        reportInDb.count,
        0,
        "The report's count should be initialized to 0.",
      );
      console.log(
        "Success: Concept correctly handles an empty string as a valid, unique ID.",
      );

      await client.close();
    },
  );
});

```
