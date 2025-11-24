import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "CountryRecommendation" + ".";

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
  recType: "system" | "community";
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
   * **action** createCountry (countryName: String)
   * @effects if countryName doesn't already exist, create new Country with empty recs
   */
  async createCountry(countryName: string) {
    const existing = await this.countryCollection.findOne({ _id: countryName });
    if (existing) {
      console.log(`Country ${countryName} already exists.`);
      return;
    }

    await this.countryCollection.insertOne({
      _id: countryName,
      recommendations: [],
    });

    console.log(
      `CREATED new entry for country: ${countryName}`,
    );
  }

  /**
   * **action** getNewRecs (countryName: String): (recs: ID[ ])
   *
   * @requires
   * @effects
   * @returns
   */
  async getNewRecs(countryName: string): Promise<RecommendationEntry[]> {
    return [];
  }

  async getSystemRecs(countryName: string): Promise<RecommendationEntry[]> {
    return [];
  }

  async getCommunityRecs(countryName: string): Promise<RecommendationEntry[]> {
    return [];
  }

  async addCommunityRec(
    countryName: string,
    songTitle: string,
    artist: string,
    language: string,
    youtubeURL: string,
    genre?: string,
  ): Promise<recId> {
    const recId = freshID() as recId;

    return recId;
  }

  async removeCommunityRec(recId: recId): Promise<void> {
  }
}
