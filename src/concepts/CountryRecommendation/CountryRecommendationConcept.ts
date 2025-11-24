import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "CountryRecommendation" + ".";

// Declare amount of recommendations to query for get calls, default 3
const QUERY_QUANTITY = 3;

// Multiplier to request more recommendations if number of stored recommendations is less than (QUERY_QUANTITY * MULTIPLIER), default 5 for prod
const BASELINE_MULTIPLIER = 3;

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

  constructor(private readonly db: Db) {
    this.countryCollection = this.db.collection(PREFIX + "countries");
    this.recommendationCollection = this.db.collection(
      PREFIX + "recommendations",
    );
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
   * @effects call LLM for 3 new song recommendations from countryName and create new recommendation entries
   * @returns list of 3 recIds
   */
  async getNewRecs(
    countryName: string,
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    return { recommendations: [] };
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
        return this.getNewRecs(countryName);
      }

      // Randomize when to pick recommendations from stored recommendations or call LLM
      const p = LLM_CALL_SCALE / (systemRecs.length + LLM_CALL_SCALE);

      if (Math.random() < p) {
        return this.getNewRecs(countryName);
      } else {
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
    } catch (e) {
      return { error: `Error removing recommendation: ${e}` };
    }
  }
}
