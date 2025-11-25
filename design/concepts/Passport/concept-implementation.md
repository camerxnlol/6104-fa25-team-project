[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-spec](concept-spec.md)

# prompt: Create a concept implementation in TypeScript for the Passport concept


# response:

# concept: Passport

* **concept**: Passport [User, Song]
* **purpose**: track a user's musical exploration across different countries to encourage broader cultural discovery
* **principle**: if a user listens to a song from a country they haven't explored before, then that country is added to their passport, which they can view as a list of explored countries
* **state**:
  * a set of HistoryEntries with
    * a user User
    * a song Song
    * a country String
    * a date Date
* **actions**:
  * `logExploration (user: User, song: Song, country: String): (entry: HistoryEntry)`
    * **requires**: true
    * **effects**: creates a new HistoryEntry `e` with the given `user`, `song`, and `country`, sets its `date` to the current time, and returns the ID of `e` as `entry`
* **queries**:
  * `_getExploredCountries (user: User): (country: String)`
    * **requires**: user has one or more HistoryEntries
    * **effects**: returns the set of unique countries from all HistoryEntries associated with the given user
  * `_getHistoryForCountry (user: User, country: String): (entry: {song: Song, date: Date})`
    * **requires**: user has one or more HistoryEntries for the given country
    * **effects**: returns all song and date pairs from HistoryEntries associated with the given user and country, ordered by most recent date first

# file: src/concepts/passport/PassportConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Generic types of this concept
type User = ID;
type Song = ID;
type HistoryEntryID = ID;

/**
 * a set of HistoryEntries with
 *   a user User
 *   a song Song
 *   a country String
 *   a date Date
 */
interface HistoryEntry {
  _id: HistoryEntryID;
  user: User;
  song: Song;
  country: string;
  date: Date;
}

/**
 * concept: Passport [User, Song]
 * 
 * purpose: track a user's musical exploration across different countries to
 * encourage broader cultural discovery
 * 
 * principle: if a user listens to a song from a country they haven't
 * explored before, then that country is added to their passport, which they can
 * view as a list of explored countries
 */
export default class PassportConcept {
  historyEntries: Collection<HistoryEntry>;

  constructor(private readonly db: Db) {
    // Declare collection prefix, use concept name
    const PREFIX = "Passport" + ".";
    this.historyEntries = this.db.collection(PREFIX + "historyEntries");
  }

  /**
   * logExploration (user: User, song: Song, country: String): (entry: HistoryEntry)
   *
   * **requires** true
   *
   * **effects** creates a new HistoryEntry `e` with the given `user`, `song`,
   * and `country`, sets its `date` to the current time, and returns the ID of
   * `e` as `entry`
   */
  async logExploration(
    { user, song, country }: { user: User; song: Song; country: string },
  ): Promise<{ entry: HistoryEntryID } | { error: string }> {
    const _id = freshID();
    const newEntry: HistoryEntry = {
      _id,
      user,
      song,
      country,
      date: new Date(),
    };

    await this.historyEntries.insertOne(newEntry);

    return { entry: _id };
  }

  /**
   * _getExploredCountries (user: User): (country: String)
   *
   * **requires** user has one or more HistoryEntries
   *
   * **effects** returns the set of unique countries from all HistoryEntries
   * associated with the given user
   */
  async _getExploredCountries(
    { user }: { user: User },
  ): Promise<Array<{ country: string }>> {
    // Use aggregation to group by country and ensure uniqueness
    const pipeline = [
      { $match: { user } },
      { $group: { _id: "$country" } },
      { $project: { _id: 0, country: "$_id" } },
    ];

    // The return type of aggregate().toArray() is any[], so we cast strictly
    return (await this.historyEntries.aggregate(pipeline).toArray()) as Array<
      { country: string }
    >;
  }

  /**
   * _getHistoryForCountry (user: User, country: String): (entry: {song: Song, date: Date})
   *
   * **requires** user has one or more HistoryEntries for the given country
   *
   * **effects** returns all song and date pairs from HistoryEntries
   * associated with the given user and country, ordered by most recent date
   * first
   */
  async _getHistoryForCountry(
    { user, country }: { user: User; country: string },
  ): Promise<Array<{ entry: { song: Song; date: Date } }>> {
    const entries = await this.historyEntries
      .find(
        { user, country },
        { sort: { date: -1 } },
      )
      .toArray();

    return entries.map((e) => ({
      entry: {
        song: e.song,
        date: e.date,
      },
    }));
  }
}
```