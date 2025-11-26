import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { GeminiLLM } from "../../../gemini-llm.ts";

// Declare collection prefix, use concept name
const PREFIX = "CountryRecommendation" + ".";

// Declare amount of recommendations to query for get calls, default 3
export const QUERY_QUANTITY = 3;

// Multiplier to request more recommendations if number of stored recommendations is less than (QUERY_QUANTITY * MULTIPLIER), default 5 for prod
export const BASELINE_MULTIPLIER = 3;

// Scale for deciding LLM call probability (control how quickly the probability decays as database grows)
const LLM_CALL_SCALE = 20;

// Internal entity types, represented as IDs
type recId = ID;

interface CountryEntry {
  _id: string;
  recommendations: recId[];
}

interface RecommendationEntry {
  _id: recId;
  country: string;
  songTitle: string;
  artist: string;
  language: string;
  youtubeURL: string;
  recType: "SYSTEM" | "COMMUNITY";
  genre?: string;
}

/**
 * @concept CountryRecommendation
 * @purpose provide Users with song recommendations from a specific country.
 * @principle maintain, update, and deliver curated (system) and user-added (community) song recommendations for each country, fetching new recommendations from an LLM when needed.
 */
export default class CountryRecommendationConcept {
  private readonly countryCollection: Collection<CountryEntry>;
  private readonly recommendationCollection: Collection<RecommendationEntry>;
  private llm: GeminiLLM;

  constructor(private readonly db: Db) {
    this.countryCollection = this.db.collection(PREFIX + "countries");
    this.recommendationCollection = this.db.collection(
      PREFIX + "recommendations",
    );
    this.llm = new GeminiLLM();
  }

  /**
   * @effects if countryName doesn't already exist, create new Country with empty recs
   */
  private async getCountryEntry(
    countryName: string,
  ): Promise<CountryEntry | { error: string }> {
    const existing = await this.countryCollection.findOne({ _id: countryName });
    if (existing) {
      return existing;
    }

    await this.countryCollection.insertOne({
      _id: countryName,
      recommendations: [],
    });

    const newCountryEntry = await this.countryCollection.findOne({
      _id: countryName,
    });
    if (!newCountryEntry) return { error: "Failed to create country." };

    console.log(
      `CREATED new entry for country: ${countryName}`,
    );

    return newCountryEntry;
  }

  /**
   * @requires countryName exists
   * @effects call LLM for new song recommendations from countryName and create new recommendation entries
   * @returns list of recIds
   */
  async getNewRecs(
    countryName: string,
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    // a JSON array of objects with keys: songTitle, artist, language, youtubeURL, genre?
    const jsonResponse = await this.llmFetch(countryName, QUERY_QUANTITY);

    let parsed: {
      songTitle: string;
      artist: string;
      language: string;
      youtubeURL: string;
      genre?: string;
    }[];

    try {
      parsed = JSON.parse(jsonResponse);
    } catch (err) {
      return { error: "LLM returned invalid JSON" };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { error: "LLM returned empty or invalid recommendation list" };
    }

    const newRecs: RecommendationEntry[] = [];

    for (const rec of parsed) {
      const newRec: RecommendationEntry = {
        _id: freshID() as recId,
        country: countryName,
        songTitle: rec.songTitle,
        artist: rec.artist,
        language: rec.language,
        youtubeURL: rec.youtubeURL,
        recType: "SYSTEM",
        genre: rec.genre,
      };

      newRecs.push(newRec);
    }

    // Check for duplicates before inserting
    const finalRecs: RecommendationEntry[] = [];

    for (const rec of newRecs) {
      const existing = await this.recommendationCollection.findOne({
        country: countryName,
        songTitle: rec.songTitle,
        artist: rec.artist,
      });

      if (existing) {
        // is a duplicate, use the existing one in database
        finalRecs.push(existing);
      } else {
        // Not a duplicate → insert the new one
        await this.recommendationCollection.insertOne(rec);

        // Add its ID to the country doc
        await this.countryCollection.updateOne(
          { _id: countryName },
          { $push: { recommendations: rec._id } },
        );

        finalRecs.push(rec);
      }
    }

    return { recommendations: finalRecs };
  }

  /**
   * Helper to execute LLM request and parse response.
   */
  public async llmFetch(
    countryName: string,
    amount: number,
  ): Promise<string> {
    const prompt = this.createPrompt(countryName, amount);
    // console.log(prompt);

    try {
      console.log(
        `🤖 Requesting sentence generation from Gemini AI...`,
      );
      const response = await this.llm.executeLLM(prompt);

      console.log("✅ Received response from Gemini AI!");
      console.log("\n🤖 RAW GEMINI RESPONSE");
      console.log("======================");
      console.log(response);
      console.log("======================\n");

      return response;
    } catch (error) {
      // Non-retryable errors propagate immediately
      console.error("❌ Unexpected error:", (error as Error).message);
      throw error;
    }
  }

  /**
   * Create the prompt for Gemini with hardwired preferences
   */
  public createPrompt(
    countryName: string,
    amount: number,
    genre?: string,
  ): string {
    return genre
      ? `give me ${amount} underground/small music artists in ${countryName} with the genre ${genre}. 
    Provide one song from each artist. For each song, include the song title, artist, 
    language in which the song is sung, and YouTube URL to the official MV. Format the response as 
    a JSON array of objects with keys: songTitle, artist, language, youtubeURL.`
      : `give me ${amount} underground/small music artists in ${countryName}. 
    Provide one song from each artist. For each song, include the song title, artist, 
    language in which the song is sung, YouTube URL to the official MV, and the genre. Format the response as 
    a JSON array of objects with keys: songTitle, artist, language, youtubeURL, genre.`;
  }

  /**
   * @requires countryName exists
   * @effects filter recs of type "SYSTEM" and choose QUERY_QUANTITY recs, sometimes call LLM
   * @returns randomly chosen rec IDs
   */
  async getSystemRecs(
    countryName: string,
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    const countryEntry = await this.getCountryEntry(countryName);
    if ("error" in countryEntry) {
      return { error: countryEntry.error };
    }

    try {
      const systemRecs = await this.recommendationCollection.find({
        _id: { $in: countryEntry.recommendations },
        recType: "SYSTEM",
      })
        .toArray();

      if (systemRecs.length <= QUERY_QUANTITY * BASELINE_MULTIPLIER) {
        // Call LLM to get new recommendations
        console.log(
          `Not enough SYSTEM recommendations for ${countryName} (${systemRecs.length} found). Calling LLM for new recommendations...`,
        );
        return this.getNewRecs(countryName);
      }

      // Randomize when to pick recommendations from stored recommendations or call LLM
      const p = LLM_CALL_SCALE / (systemRecs.length + LLM_CALL_SCALE);

      if (Math.random() < p) {
        console.log(
          `Decided to call LLM for new recommendations for ${countryName} (p=${
            p.toFixed(3)
          }).`,
        );
        return this.getNewRecs(countryName);
      } else {
        console.log(
          `Using stored SYSTEM recommendations for ${countryName} (p=${
            p.toFixed(3)
          }).`,
        );
        // Pick QUERY_QUANTITY random recommendations from stored ones
        const shuffled = systemRecs.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, QUERY_QUANTITY);
        return { recommendations: selected };
      }
    } catch (e) {
      return { error: `Error retrieving system recommendations. ERROR: ${e}` };
    }
  }

  /**
   * @requires countryName exists
   * @effects filter recs of type "COMMUNITY" and choose QUERY_QUANTITY recs or all community recs, whichever is smaller
   * @returns randomly chosen rec IDs
   */
  async getCommunityRecs(
    countryName: string,
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    const countryEntry = await this.getCountryEntry(countryName);
    if ("error" in countryEntry) {
      return { error: countryEntry.error };
    }

    try {
      console.log(
        `Fetching COMMUNITY recommendations for ${countryName}...`,
      );
      const communityRecs = await this.recommendationCollection.find({
        _id: { $in: countryEntry.recommendations },
        recType: "COMMUNITY",
      })
        .toArray();

      if (communityRecs.length <= QUERY_QUANTITY) {
        return { recommendations: communityRecs };
      }

      const shuffled = communityRecs.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, QUERY_QUANTITY);
      return { recommendations: selected };
    } catch (e) {
      return {
        error: `Error retrieving community recommendations. ERROR: ${e}`,
      };
    }
  }

  /**
   * @requires countryName exists
   * @effects create new community Recommendation
   * @returns recId
   */
  async addCommunityRec(
    countryName: string,
    songTitle: string,
    artist: string,
    language: string,
    youtubeURL: string,
    genre?: string,
  ): Promise<{ recId: recId } | { error: string }> {
    try {
      // Ensure country exists
      const countryEntry = await this.getCountryEntry(countryName);
      if ("error" in countryEntry) {
        return { error: countryEntry.error };
      }

      const recDocs = await this.recommendationCollection
        .find({ country: countryName })
        .toArray();

      // Check for exact duplicate among COMMUNITY recommendations
      const existing = recDocs.find((rec) =>
        rec.recType === "COMMUNITY" &&
        rec.songTitle === songTitle &&
        rec.artist === artist &&
        rec.language === language &&
        rec.youtubeURL === youtubeURL &&
        (genre === undefined ? rec.genre === undefined : rec.genre === genre)
      );

      if (existing) {
        return { recId: existing._id };
      }

      // Create and insert new COMMUNITY recommendation
      const newId = freshID() as recId;
      const newRec: RecommendationEntry = {
        _id: newId,
        country: countryName,
        songTitle,
        artist,
        language,
        youtubeURL,
        recType: "COMMUNITY",
        ...(genre !== undefined ? { genre } : {}),
      };

      await this.recommendationCollection.insertOne(newRec);
      await this.countryCollection.updateOne(
        { _id: countryName },
        { $push: { recommendations: newId } },
      );

      console.log(
        `Added new COMMUNITY recommendation ${newId} for ${countryName}.`,
      );
      return { recId: newId };
    } catch (e) {
      return { error: `Error adding community recommendation. ERROR: ${e}` };
    }
  }

  /**
   * @requires recId exists, recId.type == "COMMUNITY"
   * @effects remove recId database
   */
  async removeCommunityRec(recId: recId): Promise<void | { error: string }> {
    try {
      // 1. Lookup the recommendation by ID
      const rec = await this.recommendationCollection.findOne({ _id: recId });

      if (!rec) {
        return { error: `Recommendation ${recId} not found.` };
      }

      // 2. Ensure it's a COMMUNITY recommendation
      if (rec.recType !== "COMMUNITY") {
        return { error: `Recommendation ${recId} is not COMMUNITY type.` };
      }

      // 3. Remove the recommendation document
      await this.recommendationCollection.deleteOne({ _id: recId });

      // 4. Remove reference from the country’s recommendations list
      await this.countryCollection.updateOne(
        { _id: rec.country },
        { $pull: { recommendations: recId } },
      );
      console.log(
        `Removed COMMUNITY recommendation ${recId} from ${rec.country}.`,
      );
    } catch (e) {
      return { error: `Error removing recommendation: ${e}` };
    }
  }

  /**
   * @requires countryName exists
   * @returns counts and optional lists of recommendations for debugging/inspection
   */
  async _getCountryStatus(
    countryName: string,
  ): Promise<
    | {
      country: string;
      total: number;
      systemCount: number;
      communityCount: number;
      recIds: recId[];
      systemRecs?: RecommendationEntry[];
      communityRecs?: RecommendationEntry[];
    }
    | { error: string }
  > {
    const countryEntry = await this.getCountryEntry(countryName);
    if ("error" in countryEntry) return { error: countryEntry.error };

    try {
      // All recIds linked to this country
      const recIds = countryEntry.recommendations;

      if (recIds.length === 0) {
        return {
          country: countryName,
          total: 0,
          systemCount: 0,
          communityCount: 0,
          recIds: [],
        };
      }

      // Fetch all recommendation docs
      const recs = await this.recommendationCollection
        .find({ _id: { $in: recIds } })
        .toArray();

      // Categorize
      const systemRecs = recs.filter((r) => r.recType === "SYSTEM");
      const communityRecs = recs.filter((r) => r.recType === "COMMUNITY");

      return {
        country: countryName,
        total: recs.length,
        systemCount: systemRecs.length,
        communityCount: communityRecs.length,
        recIds,
        systemRecs,
        communityRecs,
      };
    } catch (e) {
      return { error: `Error inspecting database. ERROR: ${e}` };
    }
  }
}
