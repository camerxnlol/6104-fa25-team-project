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
  recommendations: RecommendationEntry[];
}

interface RecommendationEntry {
  _id: recId;
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
  private async createCountry(
    countryName: string,
  ): Promise<Empty | { error: string }> {
    const existing = await this.countryCollection.findOne({ _id: countryName });
    if (existing) {
      console.log(`Country ${countryName} already exists.`);
      return { error: `Country ${countryName} already exists` };
    }

    await this.countryCollection.insertOne({
      _id: countryName,
      recommendations: [],
    });

    console.log(
      `CREATED new entry for country: ${countryName}`,
    );

    return {};
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
    let countryEntry = await this.countryCollection.findOne({
      _id: countryName,
    });
    if (!countryEntry) {
      this.createCountry(countryName);
      countryEntry = await this.countryCollection.findOne({
        _id: countryName,
      });
    }

    try {
      const systemRecs = countryEntry!.recommendations.filter(
        (rec) => rec.recType === "SYSTEM",
      );

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
    let countryEntry = await this.countryCollection.findOne({
      _id: countryName,
    });
    if (!countryEntry) {
      this.createCountry(countryName);
      countryEntry = await this.countryCollection.findOne({
        _id: countryName,
      });
    }

    try {
      const communityRecs = countryEntry!.recommendations.filter(
        (rec) => rec.recType === "COMMUNITY",
      );

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
    const recId = freshID() as recId;

    return { recId };
  }

  /**
   * @requires recId exists, recId.type == "COMMUNITY"
   * @effects remove recId database
   */
  async removeCommunityRec(recId: recId): Promise<Empty | { error: string }> {
    return {};
  }
}
