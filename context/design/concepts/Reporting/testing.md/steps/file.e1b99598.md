---
timestamp: 'Mon Nov 24 2025 19:11:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_191106.080210d7.md]]'
content_id: e1b99598a13376f10c1b95ddc9eadc79b57418175481930e35a3d4caab5ff360
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

Deno.test("Reporting Concept: Report Action Scenarios", async (t) => {
  await t.step(
    "Scenario: Attempting to report an object that has not been initialized.",
    async () => {
      console.log("\n--- Test: Fail to report a non-existent object. ---");
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post-dne" as ID;
      const userId = "user-fail" as ID;

      console.log(
        `Action: User '${userId}' attempts to report uninitialized object '${objectId}'.`,
      );
      const result = await reporting.Report({ objectId, userId });

      console.log("Verifying 'requires' clause...");
      assertExists((result as { error: string }).error);
      assertEquals(
        (result as { error: string }).error,
        `Report for objectId '${objectId}' does not exist.`,
      );

      const count = await reporting.reports.countDocuments();
      assertEquals(
        count,
        0,
        "No report document should have been created.",
      );
      console.log(
        "Success: Requirement fulfilled; cannot report a non-existent object.",
      );

      await client.close();
    },
  );

  await t.step(
    "Scenario: A user attempts to report the same object multiple times.",
    async () => {
      console.log(
        "\n--- Test: A user reports an object, then fails on the second attempt. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post-multi-report" as ID;
      const userId = "user-x" as ID;

      console.log(`Action 1: InitializeObject for '${objectId}'.`);
      await reporting.InitializeObject({ objectId });

      console.log(
        `Action 2: User '${userId}' reports '${objectId}' for the first time (should succeed).`,
      );
      const firstReport = await reporting.Report({ objectId, userId });
      assertEquals(
        firstReport,
        {},
        "The first report should be successful.",
      );

      console.log("Verifying state after first report...");
      let reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertEquals(reportInDb?.count, 1);
      assertEquals(reportInDb?.reporters, [userId]);

      console.log(
        `Action 3: User '${userId}' reports '${objectId}' again (should fail).`,
      );
      const secondReport = await reporting.Report({ objectId, userId });

      console.log("Verifying 'requires' clause for second report...");
      assertExists((secondReport as { error: string }).error);
      assertEquals(
        (secondReport as { error: string }).error,
        `User '${userId}' has already reported objectId '${objectId}'.`,
      );

      console.log("Verifying state is unchanged by the failed report...");
      reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertEquals(
        reportInDb?.count,
        1,
        "Count should remain 1 after the failed report.",
      );
      assertEquals(
        reportInDb?.reporters.length,
        1,
        "Reporters set should still contain only one user.",
      );
      console.log(
        "Success: Requirement fulfilled; duplicate reports from the same user are prevented.",
      );

      await client.close();
    },
  );

  await t.step(
    "Scenario: Multiple users report different objects independently.",
    async () => {
      console.log(
        "\n--- Test: Reports on different objects do not interfere with each other. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);

      const objectA = "post-a" as ID;
      const objectB = "photo-b" as ID;
      const userA = "user-a" as ID;
      const userB = "user-b" as ID;
      const userC = "user-c" as ID;

      console.log(
        `Action 1: InitializeObject for '${objectA}' and '${objectB}'.`,
      );
      await reporting.InitializeObject({ objectId: objectA });
      await reporting.InitializeObject({ objectId: objectB });

      console.log(`Action 2: User '${userA}' reports '${objectA}'.`);
      await reporting.Report({ objectId: objectA, userId: userA });

      console.log(`Action 3: User '${userB}' reports '${objectB}'.`);
      await reporting.Report({ objectId: objectB, userId: userB });

      console.log(`Action 4: User '${userC}' also reports '${objectA}'.`);
      await reporting.Report({ objectId: objectA, userId: userC });

      console.log("Verifying final state of all objects...");
      const reportA = await reporting.reports.findOne({ _id: objectA });
      const reportB = await reporting.reports.findOne({ _id: objectB });

      assertExists(reportA, `Report for ${objectA} should exist.`);
      assertEquals(reportA.count, 2);
      assertEquals(new Set(reportA.reporters), new Set([userA, userC]));
      console.log(
        `State for '${objectA}' is correct: count=2, reporters=['${userA}', '${userC}'].`,
      );

      assertExists(reportB, `Report for ${objectB} should exist.`);
      assertEquals(reportB.count, 1);
      assertEquals(reportB.reporters, [userB]);
      console.log(
        `State for '${objectB}' is correct: count=1, reporter='${userB}'.`,
      );

      console.log(
        "Success: Reports for different objects are tracked independently.",
      );

      await client.close();
    },
  );
});

Deno.test("Reporting Concept: Unreport Action Scenarios", async (t) => {
  await t.step(
    "Scenario: A user successfully unreports an object.",
    async () => {
      console.log("\n--- Test: A user unreports an object successfully. ---");
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post-to-unreport" as ID;
      const userId = "user-unreporter" as ID;

      console.log(`Setup 1: Initialize object '${objectId}'.`);
      await reporting.InitializeObject({ objectId });
      console.log(`Setup 2: User '${userId}' reports '${objectId}'.`);
      await reporting.Report({ objectId, userId });

      console.log("Verifying pre-unreport state...");
      let reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertEquals(reportInDb?.count, 1);
      assertEquals(reportInDb?.reporters, [userId]);

      console.log(`Action: User '${userId}' unreports '${objectId}'.`);
      const result = await reporting.Unreport({ objectId, userId });

      console.log("Verifying effects...");
      assertEquals(result, {}, "Unreport action should succeed.");

      reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertExists(reportInDb);
      assertEquals(reportInDb.count, 0, "Count should be decremented to 0.");
      assertEquals(
        reportInDb.reporters.length,
        0,
        "User should be removed from reporters set.",
      );
      console.log("Success: State correctly updated after unreport.");

      await client.close();
    },
  );

  await t.step(
    "Scenario: Attempting to unreport an object that a user has not reported.",
    async () => {
      console.log(
        "\n--- Test: Fail to unreport an object the user hasn't reported. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post-x" as ID;
      const reportingUser = "user-reporter" as ID;
      const nonReportingUser = "user-spectator" as ID;

      console.log(`Setup 1: Initialize object '${objectId}'.`);
      await reporting.InitializeObject({ objectId });
      console.log(`Setup 2: User '${reportingUser}' reports '${objectId}'.`);
      await reporting.Report({ objectId, userId: reportingUser });

      console.log(
        `Action: User '${nonReportingUser}' attempts to unreport '${objectId}'.`,
      );
      const result = await reporting.Unreport({
        objectId,
        userId: nonReportingUser,
      });

      console.log("Verifying 'requires' clause...");
      assertExists((result as { error: string }).error);
      assertEquals(
        (result as { error: string }).error,
        `User '${nonReportingUser}' has not reported objectId '${objectId}'.`,
      );

      console.log("Verifying state is unchanged...");
      const reportInDb = await reporting.reports.findOne({ _id: objectId });
      assertEquals(reportInDb?.count, 1);
      assertEquals(reportInDb?.reporters, [reportingUser]);
      console.log(
        "Success: Requirement fulfilled; unreport prevented and state is stable.",
      );

      await client.close();
    },
  );

  await t.step(
    "Scenario: Attempting to unreport an object that does not exist.",
    async () => {
      console.log("\n--- Test: Fail to unreport a non-existent object. ---");
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "post-never-existed" as ID;
      const userId = "user-z" as ID;

      console.log(`Action: User '${userId}' attempts to unreport '${objectId}'.`);
      const result = await reporting.Unreport({ objectId, userId });

      console.log("Verifying 'requires' clause...");
      assertExists((result as { error: string }).error);
      assertEquals(
        (result as { error: string }).error,
        `Report for objectId '${objectId}' does not exist.`,
      );
      console.log("Success: Requirement fulfilled; cannot unreport non-existent object.");

      await client.close();
    },
  );
});

Deno.test("Reporting Concept: Journeys and Scenarios", async (t) => {
  await t.step(
    "Journey 1 (Operational Principle): A post gets reported and one report is later withdrawn.",
    async () => {
      console.log(
        "\n--- Journey: Standard lifecycle of an object report. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "article-101" as ID;
      const user1 = "user-Alice" as ID;
      const user2 = "user-Bob" as ID;

      console.log(
        `1. An object is created: InitializeObject for '${objectId}'.`,
      );
      await reporting.InitializeObject({ objectId });

      console.log(
        `2. A first user reports it: User '${user1}' reports '${objectId}'.`,
      );
      await reporting.Report({ objectId, userId: user1 });
      let report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 1);
      console.log("State check: Count is 1.");

      console.log(
        `3. A second user also reports it: User '${user2}' reports '${objectId}'.`,
      );
      await reporting.Report({ objectId, userId: user2 });
      report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 2);
      assertEquals(new Set(report?.reporters), new Set([user1, user2]));
      console.log("State check: Count is 2, both users are reporters.");

      console.log(
        `4. The first user changes their mind: User '${user1}' unreports '${objectId}'.`,
      );
      await reporting.Unreport({ objectId, userId: user1 });
      report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 1);
      assertEquals(report?.reporters, [user2]);
      console.log(
        "State check: Count is 1, only the second user remains as a reporter.",
      );

      console.log("Success: The operational principle journey completed as expected.");
      await client.close();
    },
  );

  await t.step(
    "Journey 2 (Report and Regret): A user reports and immediately unreports an object.",
    async () => {
      console.log("\n--- Journey: Report and immediate unreport. ---");
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "comment-456" as ID;
      const userId = "user-Charlie" as ID;

      console.log(`1. Initialize object '${objectId}'.`);
      await reporting.InitializeObject({ objectId });
      let report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 0);
      assertEquals(report?.reporters, []);
      console.log("Initial state: Count is 0.");

      console.log(`2. User '${userId}' reports '${objectId}'.`);
      await reporting.Report({ objectId, userId });
      report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 1);
      assertEquals(report?.reporters, [userId]);
      console.log("State after report: Count is 1.");

      console.log(`3. User '${userId}' unreports '${objectId}'.`);
      await reporting.Unreport({ objectId, userId });
      report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 0);
      assertEquals(report?.reporters, []);
      console.log("Final state: Count is back to 0.");

      console.log("Success: The object's report state was correctly reverted.");
      await client.close();
    },
  );

  await t.step(
    "Journey 3 (Repeated Actions): A user tries to report twice and then unreport twice.",
    async () => {
      console.log(
        "\n--- Journey: Testing idempotency and error handling for repeated actions. ---",
      );
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "video-101" as ID;
      const userId = "user-David" as ID;

      console.log(`1. Initialize object '${objectId}'.`);
      await reporting.InitializeObject({ objectId });

      console.log(`2. User '${userId}' reports '${objectId}' (should succeed).`);
      const report1 = await reporting.Report({ objectId, userId });
      assertEquals(report1, {});

      console.log(`3. User '${userId}' reports '${objectId}' again (should fail).`);
      const report2 = await reporting.Report({ objectId, userId });
      assertExists((report2 as { error: string }).error);
      console.log("Failure confirmed: User has already reported.");

      let report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 1);
      console.log("State check: Count is still 1.");

      console.log(`4. User '${userId}' unreports '${objectId}' (should succeed).`);
      const unreport1 = await reporting.Unreport({ objectId, userId });
      assertEquals(unreport1, {});

      console.log(`5. User '${userId}' unreports '${objectId}' again (should fail).`);
      const unreport2 = await reporting.Unreport({ objectId, userId });
      assertExists((unreport2 as { error: string }).error);
      console.log("Failure confirmed: User is no longer in the reporters set.");

      report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 0);
      console.log("State check: Count is now 0.");

      console.log("Success: The system correctly handled repeated valid and invalid actions.");
      await client.close();
    },
  );

  await t.step(
    "Journey 4 (Invalid Actor): A user who didn't report tries to unreport an object.",
    async () => {
      console.log("\n--- Journey: An invalid user attempts to unreport. ---");
      const [db, client] = await testDb();
      const reporting = new ReportingConcept(db);
      const objectId = "photo-789" as ID;
      const reportingUser = "user-Eve" as ID;
      const invalidUser = "user-Frank" as ID;

      console.log(`1. Initialize object '${objectId}'.`);
      await reporting.InitializeObject({ objectId });

      console.log(`2. User '${reportingUser}' reports '${objectId}'.`);
      await reporting.Report({ objectId, userId: reportingUser });
      let report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 1);
      console.log(`State check: Count is 1, reported by '${reportingUser}'.`);

      console.log(
        `3. User '${invalidUser}' attempts to unreport '${objectId}' (should fail).`,
      );
      const result = await reporting.Unreport({
        objectId,
        userId: invalidUser,
      });
      assertExists((result as { error: string }).error);
      assertEquals(
        (result as { error: string }).error,
        `User '${invalidUser}' has not reported objectId '${objectId}'.`,
      );
      console.log("Failure confirmed: Invalid user cannot unreport.");

      console.log("Verifying state has not changed...");
      report = await reporting.reports.findOne({ _id: objectId });
      assertEquals(report?.count, 1);
      assertEquals(report?.reporters, [reportingUser]);
      console.log("State is unchanged, as expected.");

      console.log("Success: The system correctly prevented an unauthorized unreport.");
      await client.close();
    },
  );
});
```
