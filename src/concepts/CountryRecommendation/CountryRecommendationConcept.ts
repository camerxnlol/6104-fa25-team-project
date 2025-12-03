import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { GeminiLLM } from "../../../gemini-llm.ts";
import axios from "npm:axios";

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

interface Country {
  _id: string;
  recommendations: recId[];
}

interface RecommendationEntry {
  _id: recId;
  countryName: string;
  songTitle: string;
  artist: string;
  language: string;
  youtubeURL: string;
  recType: "SYSTEM" | "COMMUNITY";
  genre: string;
}

/**
 * @concept CountryRecommendation
 * @purpose provide Users with song recommendations from a specific country.
 * @principle maintain, update, and deliver curated (system) and user-added (community) song recommendations for each country, fetching new recommendations from an LLM when needed.
 */
export default class CountryRecommendationConcept {
  private readonly countryCollection: Collection<Country>;
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
    { countryName }: { countryName: string },
  ): Promise<{ country: Country } | { error: string }> {
    const existing = await this.countryCollection.findOne({ _id: countryName });
    if (existing) {
      return { country: existing };
    }

    await this.countryCollection.insertOne({
      _id: countryName,
      recommendations: [],
    });

    const newCountry = await this.countryCollection.findOne({
      _id: countryName,
    });
    if (!newCountry) return { error: "Failed to create country." };

    console.log(
      `CREATED new entry for country: ${countryName}`,
    );

    return { country: newCountry };
  }

  /**
   * @requires countryName exists
   * @effects call LLM for new song recommendations from countryName and create new recommendation entries
   * @returns list of recIds
   */
  async getNewRecs(
    { countryName }: { countryName: string },
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    // a JSON array of objects with keys: songTitle, artist, language, youtubeURL, genre
    const jsonResponse = await this.llmFetch(countryName, QUERY_QUANTITY);

    const jsonStart = jsonResponse.indexOf("[");
    const jsonEnd = jsonResponse.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      return {
        error: "LLM response parsing error: JSON array not found in response.",
      };
    }

    const jsonString = jsonResponse.substring(jsonStart, jsonEnd);

    let parsed: {
      songTitle: string;
      artist: string;
      language: string;
      youtubeURL: string;
      genre: string;
    }[];

    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return { error: "LLM returned invalid JSON" };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { error: "LLM returned empty or invalid recommendation list" };
    }

    const newRecs: RecommendationEntry[] = [];

    for (const rec of parsed) {
      const youtubeAPIUrl = await this.getYoutubeUrl(rec.songTitle, rec.artist);
      const newRec: RecommendationEntry = {
        _id: freshID() as recId,
        countryName: countryName,
        songTitle: rec.songTitle,
        artist: rec.artist,
        language: rec.language,
        youtubeURL: (youtubeAPIUrl === "") ? rec.youtubeURL : youtubeAPIUrl,
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
  private async llmFetch(
    countryName: string,
    amount: number,
  ): Promise<string> {
    const llm = this.loadLLM();
    const prompt = this.createPrompt(countryName, amount, "");
    // console.log(prompt);

    try {
      console.log(
        `🤖 Requesting sentence generation from Gemini AI...`,
      );
      const response = await llm.executeLLM(prompt);

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

  private async getYoutubeUrl(title: string, artist: string): Promise<string> {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      console.error("YOUTUBE_API_KEY not set in environment variables.");
      return "";
    }

    const query = encodeURIComponent(`${title} ${artist} official music video`);

    const url = `https://www.googleapis.com/youtube/v3/search`;

    try {
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          q: query,
          part: "snippet",
          type: "video",
          maxResults: 1,
          // videoEmbeddable: "true",
        },
      });

      const items = response.data.items;

      if (!items || items.length === 0) {
        console.warn(`No YouTube results found for ${title} by ${artist}.`);
        return "";
      }

      const videoId = items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
      console.error("Error fetching YouTube URL:", (error as Error).message);
      return "";
    }
  }

  /**
   * Create the prompt for Gemini with hardwired preferences
   */
  private createPrompt(
    countryName: string,
    amount: number,
    genre: string,
  ): string {
    const criticalRequirements = [
      `1. Youtube URL must link to the official MV of the song.`,
      `2. Songs and artists must originate from the specified country.`,
      `3. The Youtube URL must be valid and accessible.`,
      `4. The song must have an official MV on YouTube.`,
      `5. The name of the artist must be the name of their Youtube channel, which must match the channel name of the official MV.`,
    ];
    const suffix = (genre !== "") ? `with the genre ${genre}.` : `.`;

    const prompt = `
      You are a helpful AI assistant in the role of a global music curator who specializes
      in providing song recommendations from various countries around the world.

      Given a country name, your task is to suggest ${amount} songs from underground or small music artists originating from that country.
      Provide one song from each artist. For each song, include the song title, artist name (as per their official YouTube channel), the
    language in which the song is sung, YouTube URL to the official MV, and the genre.

    You must strictly adhere to the following critical requirements:
    ${criticalRequirements.join("\n")}

    Your response must be formatted as a JSON array of objects. Each object should be formatted as follows:
    {
      "songTitle": "<Title of the song>",
      "artist": "<Name of the artist's Youtube channel>",
      "language": "<Language of the song>",
      "youtubeURL": "<YouTube URL to the official MV>",
      "genre": "<Genre of the song>"
    }

    An example of a properly formatted response is as follows:
    [
      {
        "songTitle": "Example Song 1",
        "artist": "Example Artist 1",
        "language": "Example Language 1",
        "youtubeURL": "https://www.youtube.com/watch?v=example1",
        "genre": "Example Genre 1"
      },
      {
        "songTitle": "Example Song 2",
        "artist": "Example Artist 2",
        "language": "Example Language 2",
        "youtubeURL": "https://www.youtube.com/watch?v=example2",
        "genre": "Example Genre 2"
      }
    ]
    DO NOT include any additional text, explanations, or commentary outside of the JSON array. DO NOT include line breaks or formatting outside the JSON array.
    In other words, your first character must be "[" and your last character must be "]".

    Now, with all this in mind, provide ${amount} underground or small music artists in ${countryName}` +
      suffix;

    return prompt;
  }

  /**
   * @requires countryName exists
   * @effects filter recs of type "SYSTEM" and choose QUERY_QUANTITY recs, sometimes call LLM
   * @returns randomly chosen rec IDs
   */
  async getSystemRecs(
    { countryName }: { countryName: string },
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    const country = await this.getCountryEntry({ countryName });
    if ("error" in country) {
      return { error: country.error };
    }

    try {
      const systemRecs = await this.recommendationCollection.find({
        _id: { $in: country.country.recommendations },
        recType: "SYSTEM",
      })
        .toArray();

      if (systemRecs.length <= QUERY_QUANTITY * BASELINE_MULTIPLIER) {
        // Call LLM to get new recommendations
        console.log(
          `Not enough SYSTEM recommendations for ${countryName} (${systemRecs.length} found). Calling LLM for new recommendations...`,
        );
        return this.getNewRecs({ countryName });
      }

      // Randomize when to pick recommendations from stored recommendations or call LLM
      const p = LLM_CALL_SCALE / (systemRecs.length + LLM_CALL_SCALE);

      if (Math.random() < p) {
        console.log(
          `Decided to call LLM for new recommendations for ${countryName} (p=${
            p.toFixed(3)
          }).`,
        );
        return this.getNewRecs({ countryName });
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
    { countryName }: { countryName: string },
  ): Promise<{ recommendations: RecommendationEntry[] } | { error: string }> {
    const country = await this.getCountryEntry({ countryName });
    if ("error" in country) {
      return { error: country.error };
    }

    try {
      console.log(
        `Fetching COMMUNITY recommendations for ${countryName}...`,
      );
      const communityRecs = await this.recommendationCollection.find({
        _id: { $in: country.country.recommendations },
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
    { countryName, songTitle, artist, language, youtubeURL, genre }: {
      countryName: string;
      songTitle: string;
      artist: string;
      language: string;
      youtubeURL: string;
      genre: string;
    },
  ): Promise<{ recId: recId } | { error: string }> {
    try {
      // Ensure country exists
      const country = await this.getCountryEntry({ countryName });
      if ("error" in country) {
        return { error: country.error };
      }

      const recDocs = await this.recommendationCollection
        .find({ countryName: countryName })
        .toArray();

      // Check for exact duplicate among COMMUNITY recommendations
      const existing = recDocs.find((rec) =>
        rec.recType === "COMMUNITY" &&
        rec.songTitle === songTitle &&
        rec.artist === artist &&
        rec.language === language &&
        rec.youtubeURL === youtubeURL &&
        rec.genre === genre
      );

      if (existing) {
        return { recId: existing._id };
      }

      // Create and insert new COMMUNITY recommendation
      const newId = freshID() as recId;
      const newRec: RecommendationEntry = {
        _id: newId,
        countryName: countryName,
        songTitle,
        artist,
        language,
        youtubeURL,
        recType: "COMMUNITY",
        genre,
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
  async removeCommunityRec(
    { recId }: { recId: recId },
  ): Promise<void | { error: string }> {
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
        { _id: rec.countryName },
        { $pull: { recommendations: recId } },
      );
      console.log(
        `Removed COMMUNITY recommendation ${recId} from ${rec.countryName}.`,
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
    { countryName }: { countryName: string },
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
    const country = await this.getCountryEntry({ countryName });
    if ("error" in country) return { error: country.error };

    try {
      // All recIds linked to this country
      const recIds = country.country.recommendations;
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

  /**
   * Load configuration from .env
   */
  private loadLLM(): GeminiLLM {
    try {
      const apiKey = Deno.env.get("GEMINI_API_KEY");
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables.");
      }
      return new GeminiLLM(apiKey);
    } catch (error) {
      console.error(
        "❌ Error loading .env. Please ensure GEMINI_API_KEY is set.",
      );
      console.error("Error details:", (error as Error).message);
      Deno.exit(1);
    }
  }
}
