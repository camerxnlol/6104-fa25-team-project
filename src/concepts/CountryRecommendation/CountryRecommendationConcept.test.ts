import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import CountryRecommendationConcept from "./CountryRecommendationConcept.ts";

const TEST_QUERY_QUANTITY = 3;
const TEST_BASELINE_MULTIPLIER = 3;

Deno.test("Principle: User views countries with and without stored recommendations", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryCollection = "CountryRecommendation.countries";
  const recommendationCollection = "CountryRecommendation.recommendations";

  try {
    // 1. User views country A that has no stored recommendations (should call LLM)
    const countryAResult = await countryConcept.getSystemRecs("CountryA");

    // TODO: Verify that LLM call was made

    // 2. User views country B with stored recommendations
    // First, manually populate country B with some recommendations
    const countryBName = "CountryB";
    const countryBRecs = [];
    for (
      let i = 0;
      i < TEST_QUERY_QUANTITY * TEST_BASELINE_MULTIPLIER + 5;
      i++
    ) {
      countryBRecs.push({
        _id: `rec:${i}` as ID,
        songTitle: `Song ${i}`,
        artist: `Artist ${i}`,
        language: "English",
        youtubeURL: `https://youtube.com/${i}`,
        recType: "SYSTEM" as const,
      });
    }
    await db.collection<{ _id: string; recommendations: unknown[] }>(
      countryCollection,
    ).insertOne({
      _id: countryBName,
      recommendations: countryBRecs,
    });

    const countryBResult = await countryConcept.getSystemRecs(countryBName);
    // Due to randomization, we might get an LLM call or stored recs

    // TODO: verify success

    // 3. User goes back to view country A (new recs, should call LLM again because recs have not reached baseline)
    const countryAResult2 = await countryConcept.getSystemRecs("CountryA");

    // TODO: verify LLM call was made
  } finally {
    await client.close();
  }
});

Deno.test("getCommunityRecs: with stored recs greater than QUERY_QUANTITY", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);
  const countryCollection = "CountryRecommendation.countries";
  const recommendationCollection = "CountryRecommendation.recommendations";

  try {
    // Create a country with more community recs than QUERY_QUANTITY
    const countryName = "countryCommunity";
    const communityRecs = [];
    const recIds = [];
    const recsCount = TEST_QUERY_QUANTITY + 2; // More than QUERY_QUANTITY
    for (let i = 0; i < recsCount; i++) {
      const recId = `rec:${i}` as ID;
      recIds.push(recId);
      communityRecs.push({
        _id: recId,
        country: countryName,
        songTitle: `title ${i}`,
        artist: `artist ${i}`,
        language: "English",
        youtubeURL: `https://youtube.com/${i}`,
        recType: "COMMUNITY" as const,
      });
    }

    // Insert recommendation documents into recommendations collection
    await db.collection(recommendationCollection).insertMany(
      communityRecs as unknown as Record<string, unknown>[],
    );

    // Insert country with rec IDs in the recommendations array
    await db.collection<{ _id: string; recommendations: ID[] }>(
      countryCollection,
    ).insertOne({
      _id: countryName,
      recommendations: recIds,
    });

    const result = await countryConcept.getCommunityRecs(countryName);
    assertNotEquals(
      "error" in result,
      true,
      "Should successfully return community recs.",
    );
    assertEquals(
      (result as { recommendations: unknown[] }).recommendations.length,
      TEST_QUERY_QUANTITY,
      `Should return exactly QUERY_QUANTITY (${TEST_QUERY_QUANTITY}) recommendations, got ${
        (result as { recommendations: unknown[] }).recommendations.length
      }.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("addCommunityRec: with exact duplicate (returns existing recId)", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);

  try {
    const countryName = "TestCountry";
    const songTitle = "Test Song";
    const artist = "Test Artist";
    const language = "English";
    const youtubeURL = "https://youtube.com/test";
    const genre = "Pop";

    // Add the first recommendation
    const result1 = await countryConcept.addCommunityRec(
      countryName,
      songTitle,
      artist,
      language,
      youtubeURL,
      genre,
    );
    assertNotEquals("error" in result1, true, "First add should succeed.");
    assertExists((result1 as { recId: ID }).recId, "Should return a recId.");

    const firstRecId = (result1 as { recId: ID }).recId;

    // Try to add the exact same recommendation again
    const result2 = await countryConcept.addCommunityRec(
      countryName,
      songTitle,
      artist,
      language,
      youtubeURL,
      genre,
    );
    assertNotEquals("error" in result2, true, "Duplicate add should succeed.");
    assertEquals(
      (result2 as { recId: ID }).recId,
      firstRecId,
      "Should return the same recId for duplicate.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("removeCommunityRec: with valid COMMUNITY rec (successfully removes)", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);

  try {
    const countryName = "RemoveTestCountry";

    // First, add a community recommendation
    const addResult = await countryConcept.addCommunityRec(
      countryName,
      "Song to Remove",
      "Artist",
      "English",
      "https://youtube.com/remove",
    );
    assertNotEquals("error" in addResult, true, "Should successfully add rec.");
    const recId = (addResult as { recId: ID }).recId;

    // Now remove it
    const removeResult = await countryConcept.removeCommunityRec(recId);
    assertEquals(
      removeResult,
      undefined,
      "Should successfully remove without error.",
    );

    // Verify it's actually removed by checking the database
    const rec = await db.collection("CountryRecommendation.recommendations")
      .findOne({ _id: recId });
    assertEquals(rec, null, "Recommendation should be deleted from database.");
  } finally {
    await client.close();
  }
});

Deno.test("removeCommunityRec: with non-existent recId (returns error)", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);

  try {
    const fakeRecId = "nonexistent:123" as ID;

    const result = await countryConcept.removeCommunityRec(fakeRecId);
    assertEquals(
      "error" in result!,
      true,
      "Should return an error for non-existent recId.",
    );
    assertEquals(
      (result as { error: string }).error,
      `Recommendation ${fakeRecId} not found.`,
      "Error message should indicate rec not found.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("removeCommunityRec: with SYSTEM rec (returns error, cannot remove SYSTEM recs)", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);

  try {
    const countryName = "SystemRecTestCountry";
    const systemRecId = "system:rec:1" as ID;

    // Manually insert a SYSTEM recommendation into the database
    await db.collection("CountryRecommendation.recommendations").insertOne({
      _id: systemRecId,
      country: countryName,
      songTitle: "System Song",
      artist: "System Artist",
      language: "English",
      youtubeURL: "https://youtube.com/system",
      recType: "SYSTEM",
    } as unknown as Record<string, unknown>);

    // Try to remove the SYSTEM recommendation
    const result = await countryConcept.removeCommunityRec(systemRecId);
    assertEquals(
      "error" in result!,
      true,
      "Should return an error when trying to remove SYSTEM rec.",
    );
    assertEquals(
      (result as { error: string }).error,
      `Recommendation ${systemRecId} is not COMMUNITY type.`,
      "Error message should indicate rec is not COMMUNITY type.",
    );

    // Verify the SYSTEM rec is still in the database
    const rec = await db.collection("CountryRecommendation.recommendations")
      .findOne({ _id: systemRecId } as unknown as Record<string, unknown>);
    assertExists(rec, "SYSTEM recommendation should still exist in database.");
  } finally {
    await client.close();
  }
});
