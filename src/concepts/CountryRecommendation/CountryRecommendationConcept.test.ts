import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import CountryRecommendationConcept from "./CountryRecommendationConcept.ts";

const TEST_QUERY_QUANTITY = 3;
const TEST_BASELINE_MULTIPLIER = 3;

Deno.test("Principle: User views countries with and without stored recommendations", async () => {
  const [db, client] = await testDb();
  const countryConcept = new CountryRecommendationConcept(db);

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
      "CountryRecommendation.countries",
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

  try {
    // Create a country with more community recs than QUERY_QUANTITY
    const countryName = "countryCommunity";
    const communityRecs = [];
    const recsCount = TEST_QUERY_QUANTITY + 2; // More than QUERY_QUANTITY
    for (let i = 0; i < recsCount; i++) {
      communityRecs.push({
        _id: `${i}` as ID,
        songTitle: `title ${i}`,
        artist: `artist ${i}`,
        language: "English",
        youtubeURL: `https://youtube.com/${i}`,
        recType: "COMMUNITY" as const,
      });
    }

    // populate DB
    await db.collection<{ _id: string; recommendations: unknown[] }>(
      "CountryRecommendation.countries",
    ).insertOne({
      _id: countryName,
      recommendations: communityRecs,
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
      `Should return exactly QUERY_QUANTITY (${TEST_QUERY_QUANTITY}) recommendations.`,
    );
  } finally {
    await client.close();
  }
});
