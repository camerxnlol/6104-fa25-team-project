[@specification](specification.md)

[@implementation](../../../src/concepts/CountryRecommendation/CountryRecommendationConcept.ts)

[@testing-concepts](../../background/testing-concepts.md)

[@current-test-file](../../../src/concepts/CountryRecommendation/CountryRecommendationConcept.test.ts)

# prompt: given the current state of the test file for the CountryRecommendation concept, augment the tests so that they are like playing out a story/journey of actions. You should use all the actions associated with the CountryRecommendation concept. Use the queries when necessary instead of directly querying the database. Be sure to make tests that follow the operational principle of the concept specification. Tests should use a sequence of action executions that corresponds to the operational principle, representing the common expected usage of the concept. These sequence is not required to use all the actions; operational principles often do not include a deletion action, for example. Test sequences of action executions that correspond to less common cases: probing interesting corners of the functionality, undoing actions with deletions and cancellations, repeating actions with the same arguments, etc. In some of these scenarios actions may be expected to throw errors. You should have one test sequence for the operational principle, and 3-5 additional interesting scenarios. Every action should be executed successfully in at least one of the scenarios.

# response:

An excellent approach to testing is to create narratives that trace a user's journey, which helps ensure the concept's actions work together as intended by the operational principle. Here is the augmented test file with a focus on story-driven scenarios.

# file: src/concepts/CountryRecommendation/CountryRecommendationConcept.test.ts

```typescript
import {
  assertEquals,
  assertExists,
  assertNotEquals,
  assert,
} from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import CountryRecommendationConcept from "./CountryRecommendationConcept.ts";
import {
  BASELINE_MULTIPLIER,
  QUERY_QUANTITY,
} from "./CountryRecommendationConcept.ts";

// Helper type for cleaner casting in tests
type RecsResult = { recommendations: { _id: ID }[] };
type RecIdResult = { recId: ID };

Deno.test("Operational Principle: A User's First Discovery Journey", async () => {
  console.log(
    "\nSCENARIO: A user discovers the app and looks for music from a country new to the system.",
  );
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryName = "Japan";

  try {
    console.log(
      `1. User requests recommendations for '${countryName}', which has no data yet.`,
    );
    // This first call should create the country and trigger an LLM fetch because the rec count (0) is below the baseline.
    const result1 = await countryConcept.getSystemRecs({ countryName });
    assert(!("error" in result1), `getSystemRecs failed: ${result1.error}`);
    assertEquals(
      result1.recommendations.length,
      QUERY_QUANTITY,
      "Should return the newly fetched recommendations.",
    );

    console.log(
      "2. Verifying state: The system should now have initial recommendations.",
    );
    const status1 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status1), `_getCountryStatus failed: ${status1.error}`);
    assertEquals(
      status1.systemCount,
      QUERY_QUANTITY,
      `System should have ${QUERY_QUANTITY} recs after the first LLM call.`,
    );
    assertEquals(
      status1.communityCount,
      0,
      "There should be no community recs yet.",
    );

    console.log(
      `3. User requests recommendations for '${countryName}' again.`,
    );
    // The count (QUERY_QUANTITY) is still less than the baseline (QUERY_QUANTITY * BASELINE_MULTIPLIER), so this should trigger another LLM call.
    const result2 = await countryConcept.getSystemRecs({ countryName });
    assert(!("error" in result2), `getSystemRecs failed: ${result2.error}`);

    console.log(
      "4. Verifying state: The system should have fetched more recommendations.",
    );
    const status2 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status2), `_getCountryStatus failed: ${status2.error}`);
    assertEquals(
      status2.systemCount,
      QUERY_QUANTITY * 2,
      `System should have ${QUERY_QUANTITY * 2} recs after the second LLM call.`,
    );

    console.log(
      "5. The user loves a song and adds their own favorite to the community.",
    );
    const addResult = await countryConcept.addCommunityRec({
      countryName,
      songTitle: "Plastic Love",
      artist: "Mariya Takeuchi",
      language: "Japanese",
      youtubeURL: "https://www.youtube.com/watch?v=3bNITQR4Uso",
      genre: "City Pop",
    });
    assert(!("error" in addResult), `addCommunityRec failed: ${addResult.error}`);
    assertExists(addResult.recId, "Should return the ID of the new rec.");

    console.log(
      "6. Verifying state: A community recommendation should now exist.",
    );
    const status3 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status3), `_getCountryStatus failed: ${status3.error}`);
    assertEquals(
      status3.communityCount,
      1,
      "Community rec count should be 1.",
    );
    assertEquals(
      status3.systemCount,
      QUERY_QUANTITY * 2,
      "System rec count should be unchanged.",
    );

    console.log("7. User specifically requests community recommendations.");
    const communityResult = await countryConcept.getCommunityRecs({
      countryName,
    });
    assert(
      !("error" in communityResult),
      `getCommunityRecs failed: ${communityResult.error}`,
    );
    assertEquals(
      communityResult.recommendations.length,
      1,
      "Should return the single community recommendation.",
    );
    assertEquals(communityResult.recommendations[0].songTitle, "Plastic Love");
  } finally {
    await client.close();
  }
});

Deno.test("Interesting Scenario: The Community Curator", async () => {
  console.log(
    "\nSCENARIO: A user builds up community recs for a country, makes a mistake, and corrects it.",
  );
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryName = "South Korea";

  try {
    console.log("1. User adds several community recommendations.");
    const recsToAdd = [
      {
        songTitle: "Hype Boy",
        artist: "NewJeans",
        genre: "K-Pop",
        language: "Korean",
        youtubeURL: "...",
      },
      {
        songTitle: "Ganadara",
        artist: "Jay Park",
        genre: "K-R&B",
        language: "Korean",
        youtubeURL: "...",
      }, // This one will be removed
      {
        songTitle: "Love Dive",
        artist: "IVE",
        genre: "K-Pop",
        language: "Korean",
        youtubeURL: "...",
      },
      {
        songTitle: "Any Song",
        artist: "Zico",
        genre: "K-Hip Hop",
        language: "Korean",
        youtubeURL: "...",
      },
    ];

    const addedRecIds: ID[] = [];
    for (const rec of recsToAdd) {
      const result = await countryConcept.addCommunityRec({
        countryName,
        ...rec,
      });
      assert(!("error" in result), `addCommunityRec failed for ${rec.songTitle}`);
      addedRecIds.push(result.recId);
    }

    console.log("2. Verifying state: All recommendations have been added.");
    const status1 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status1), `_getCountryStatus failed`);
    assertEquals(
      status1.communityCount,
      4,
      "Should have 4 community recs.",
    );

    console.log(
      "3. User requests community recs, expecting a random subset.",
    );
    const getResult = await countryConcept.getCommunityRecs({ countryName });
    assert(!("error" in getResult), "getCommunityRecs failed");
    assertEquals(
      getResult.recommendations.length,
      QUERY_QUANTITY,
      `Should return ${QUERY_QUANTITY} random recs as there are more than that available.`,
    );

    console.log("4. User realizes they added a song by mistake and removes it.");
    const recIdToRemove = addedRecIds[1]; // 'Ganadara'
    const removeResult = await countryConcept.removeCommunityRec({
      recId: recIdToRemove,
    });
    assert(
      removeResult === undefined,
      `removeCommunityRec returned an error: ${
        (removeResult as { error: string })?.error
      }`,
    );

    console.log(
      "5. Verifying state: The recommendation should be gone.",
    );
    const status2 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status2), "_getCountryStatus failed");
    assertEquals(
      status2.communityCount,
      3,
      "Community rec count should be 3 after removal.",
    );
    assert(
      !status2.recIds.includes(recIdToRemove),
      "The removed recId should no longer be in the country's list.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Interesting Scenario: The Redundant Contributor", async () => {
  console.log(
    "\nSCENARIO: Two users try to add the exact same recommendation.",
  );
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryName = "Germany";
  const recDetails = {
    countryName,
    songTitle: "Du Hast",
    artist: "Rammstein",
    language: "German",
    youtubeURL: "https://www.youtube.com/watch?v=W3q8Od5qJio",
    genre: "Neue Deutsche Härte",
  };

  try {
    console.log("1. The first user adds a recommendation.");
    const result1 = await countryConcept.addCommunityRec(recDetails) as RecIdResult;
    assert(!("error" in result1), `First add failed`);
    assertExists(result1.recId);

    const status1 = await countryConcept._getCountryStatus({ countryName });
    assertEquals(status1.communityCount, 1);

    console.log("2. A second user tries to add the exact same recommendation.");
    const result2 = await countryConcept.addCommunityRec(recDetails) as RecIdResult;
    assert(!("error" in result2), `Second add failed`);

    console.log(
      "3. Verifying state: The same ID is returned and no duplicate is created.",
    );
    assertEquals(
      result2.recId,
      result1.recId,
      "Should return the existing recId for an exact duplicate.",
    );
    const status2 = await countryConcept._getCountryStatus({ countryName });
    assertEquals(
      status2.communityCount,
      1,
      "Community count should remain 1, as no duplicate was added.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Interesting Scenario: The Error-Prone User", async () => {
  console.log("\nSCENARIO: A user makes invalid requests to the system.");
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryName = "Mexico";

  try {
    console.log("1. User tries to remove a recommendation that does not exist.");
    const nonExistentId = "rec:non-existent-id" as ID;
    const result1 = await countryConcept.removeCommunityRec({
      recId: nonExistentId,
    });
    assert(
      "error" in result1!,
      "Should return an error for a non-existent ID.",
    );
    assertEquals(
      result1.error,
      `Recommendation ${nonExistentId} not found.`,
    );

    console.log(
      "2. Setting up: Fetching some system recommendations for the country.",
    );
    const systemRecsResult = await countryConcept.getSystemRecs({ countryName }) as RecsResult;
    assert(
      !("error" in systemRecsResult),
      "Failed to get initial system recs.",
    );
    const systemRecId = systemRecsResult.recommendations[0]._id;

    console.log(
      "3. User mistakenly tries to remove a SYSTEM recommendation using the community removal action.",
    );
    const result2 = await countryConcept.removeCommunityRec({
      recId: systemRecId,
    });
    assert(
      "error" in result2!,
      "Should return an error when trying to remove a SYSTEM rec.",
    );
    assertEquals(
      result2.error,
      `Recommendation ${systemRecId} is not COMMUNITY type.`,
    );

    console.log(
      "4. Verifying state: The SYSTEM recommendation should still exist.",
    );
    const status = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status));
    assertEquals(status.systemCount, QUERY_QUANTITY);
    assert(
      status.recIds.includes(systemRecId),
      "System rec should not have been removed.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Interesting Scenario: Forcing an LLM Refresh", async () => {
  console.log(
    "\nSCENARIO: A developer or admin wants to manually fetch new recommendations for a country.",
  );
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryName = "Sweden";

  try {
    console.log(
      "1. First, establish a baseline of recommendations for the country.",
    );
    await countryConcept.getSystemRecs({ countryName }); // First call to populate
    const status1 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status1));
    assertEquals(status1.systemCount, QUERY_QUANTITY);

    console.log("2. Manually trigger a fetch for new recommendations.");
    const newRecsResult = await countryConcept.getNewRecs({ countryName });
    assert(
      !("error" in newRecsResult),
      `getNewRecs failed: ${newRecsResult.error}`,
    );
    assertEquals(
      newRecsResult.recommendations.length,
      QUERY_QUANTITY,
      `getNewRecs should fetch ${QUERY_QUANTITY} new recommendations.`,
    );

    console.log(
      "3. Verifying state: The total count of system recs should have increased.",
    );
    const status2 = await countryConcept._getCountryStatus({ countryName });
    assert(!("error" in status2));
    assertEquals(
      status2.systemCount,
      QUERY_QUANTITY * 2,
      "System count should double after the manual fetch.",
    );
  } finally {
    await client.close();
  }
});
```