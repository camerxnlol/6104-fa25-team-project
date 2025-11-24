---
timestamp: 'Mon Nov 24 2025 10:37:35 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_103735.b998d7ad.md]]'
content_id: f11f5452bf3943f09fe5d173b0e2ef9fcea620293729080ff84c3b0dd9f98a6f
---

# file: src/concepts/passport/PassportConcept.test.ts

```typescript
import { assert, assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import PassportConcept from "@concepts/passport/PassportConcept.ts";

Deno.test("Passport Concept - Action: logExploration", async () => {
  const [db, client] = await testDb();
  const passport = new PassportConcept(db);

  const user = "user:1" as ID;
  const song = "song:1" as ID;
  const country = "France";

  console.log("--- Testing logExploration ---");

  // Action: logExploration
  const result = await passport.logExploration({ user, song, country });

  if ("error" in result) {
    console.log(`❌ logExploration failed: ${result.error}`);
    assert(false);
  } else {
    console.log("✅ logExploration returned success with entry ID");
    assert(result.entry);
  }

  // Verify State via Database
  const savedEntry = await passport.historyEntries.findOne({ _id: result.entry });
  if (savedEntry && savedEntry.country === country && savedEntry.user === user) {
    console.log("✅ Database state confirmed: Entry exists with correct data");
  } else {
    console.log("❌ Database state incorrect");
    assert(false);
  }

  await client.close();
});

Deno.test("Passport Concept - Principle Trace", async () => {
  const [db, client] = await testDb();
  const passport = new PassportConcept(db);

  const alice = "user:Alice" as ID;
  const song1 = "song:Japan1" as ID;
  const song2 = "song:Japan2" as ID;
  const song3 = "song:Brazil1" as ID;

  console.log("\n--- Testing Principle Trace ---");

  // 1. Alice listens to a song from Japan (New Country)
  console.log("Action: Alice logs exploration of Japan (song1)");
  const r1 = await passport.logExploration({
    user: alice,
    song: song1,
    country: "Japan",
  });
  assert(!("error" in r1));
  console.log("✅ Action succeeded");

  // 2. Verify Passport shows Japan
  console.log("Query: Get explored countries");
  const c1 = await passport._getExploredCountries({ user: alice });
  const countries1 = c1.map((c) => c.country);
  assertEquals(countries1, ["Japan"]);
  console.log(`✅ Passport contains: ${JSON.stringify(countries1)}`);

  // Wait briefly to ensure timestamp difference for sorting test later
  await new Promise((resolve) => setTimeout(resolve, 10));

  // 3. Alice listens to another song from Japan (Existing Country)
  console.log("Action: Alice logs exploration of Japan (song2)");
  const r2 = await passport.logExploration({
    user: alice,
    song: song2,
    country: "Japan",
  });
  assert(!("error" in r2));
  console.log("✅ Action succeeded");

  // 4. Verify Passport still only shows Japan once
  console.log("Query: Get explored countries");
  const c2 = await passport._getExploredCountries({ user: alice });
  const countries2 = c2.map((c) => c.country);
  assertEquals(countries2.length, 1);
  assertEquals(countries2[0], "Japan");
  console.log(`✅ Passport contains unique entries: ${JSON.stringify(countries2)}`);

  // 5. Alice listens to a song from Brazil (New Country)
  console.log("Action: Alice logs exploration of Brazil (song3)");
  const r3 = await passport.logExploration({
    user: alice,
    song: song3,
    country: "Brazil",
  });
  assert(!("error" in r3));
  console.log("✅ Action succeeded");

  // 6. Verify Passport shows Japan and Brazil
  console.log("Query: Get explored countries");
  const c3 = await passport._getExploredCountries({ user: alice });
  const countries3 = c3.map((c) => c.country).sort(); // Sort for comparison
  assertEquals(countries3, ["Brazil", "Japan"]);
  console.log(`✅ Passport contains: ${JSON.stringify(countries3)}`);

  // 7. Verify History Detail for Japan (Ordering)
  console.log("Query: Get history for Japan");
  const history = await passport._getHistoryForCountry({
    user: alice,
    country: "Japan",
  });
  
  // Expecting song2 (most recent) then song1
  if (history.length === 2 && history[0].entry.song === song2 && history[1].entry.song === song1) {
     console.log("✅ History is ordered by date descending (Song2, then Song1)");
  } else {
     console.log(`❌ History order incorrect or missing entries: ${JSON.stringify(history)}`);
     assert(false);
  }

  await client.close();
});
```
