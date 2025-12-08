import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import type { ObjectId } from "npm:mongodb";

/**
 * concept Playlist [User, Song]
 *
 * purpose: organize collections of songs for personal use or sharing
 *
 * principle: If a user creates a playlist, names it "Road Trip Jams", and
 * adds several songs, they can later retrieve that specific list of songs. If
 * they then remove a song, reorder the remaining songs, and rename the playlist
 * to "Classic Rock", the playlist will reflect all of these changes.
 */

// Declare collection prefix, use concept name
const PREFIX = "Playlist" + ".";

// Generic types of this concept
type User = ID;
type Song = ID;
type Playlist = ID;

/**
 * a set of Playlists with
 *   owner: User
 *   name: String
 *   songs: sequence of Song
 */
interface PlaylistsCollection {
  _id: Playlist;
  owner: User;
  name: string;
  songs: Song[];
}

export default class PlaylistConcept {
  playlists: Collection<PlaylistsCollection>;
  private readonly recommendationCollection: Collection;

  constructor(private readonly db: Db) {
    this.playlists = this.db.collection(PREFIX + "playlists");
    this.recommendationCollection = this.db.collection("CountryRecommendation.recommendations");
  }

  /**
   * createPlaylist (owner: User, name: String): (playlist: Playlist)
   *
   * **requires**: `name` is not an empty string; the `owner` does not already
   *   have a playlist with that `name`
   *
   * **effects**: creates a new `Playlist` `p`; sets `owner` of `p` to `owner`;
   *   sets `name` of `p` to `name`; sets `songs` of `p` to an empty sequence;
   *   returns `p` as `playlist`
   */
  async createPlaylist(
    { owner, name }: { owner: User; name: string },
  ): Promise<{ playlist: Playlist } | { error: string }> {
    if (!name || name.trim() === "") {
      return { error: "Playlist name cannot be empty." };
    }

    const existingPlaylist = await this.playlists.findOne({ owner, name });
    if (existingPlaylist) {
      return {
        error: `Playlist with name '${name}' already exists for this user.`,
      };
    }

    const newPlaylistId = freshID();
    const newPlaylist: PlaylistsCollection = {
      _id: newPlaylistId,
      owner,
      name,
      songs: [],
    };

    await this.playlists.insertOne(newPlaylist);
    return { playlist: newPlaylistId };
  }

  /**
   * deletePlaylist (playlist: Playlist, user: User)
   *
   * **requires**: a `Playlist` with id `playlist` exists; the `owner` of
   *   `playlist` is `user`
   *
   * **effects**: deletes the `Playlist` `playlist`
   */
  async deletePlaylist(
    { playlist, user }: { playlist: Playlist; user: User },
  ): Promise<Empty | { error: string }> {
    const existingPlaylist = await this.playlists.findOne({ _id: playlist });
    if (!existingPlaylist) {
      return { error: `Playlist with ID '${playlist}' not found.` };
    }
    if (existingPlaylist.owner !== user) {
      return {
        error: `User '${user}' is not the owner of playlist '${playlist}'.`,
      };
    }

    await this.playlists.deleteOne({ _id: playlist });
    return {};
  }

  /**
   * renamePlaylist (playlist: Playlist, newName: String, user: User)
   *
   * **requires**: a `Playlist` with id `playlist` exists; the `owner` of
   *   `playlist` is `user`; `newName` is not an empty string; the `user` does
   *   not already have another playlist with `newName`
   *
   * **effects**: updates the `name` of `playlist` to `newName`
   */
  async renamePlaylist(
    { playlist, newName, user }: {
      playlist: Playlist;
      newName: string;
      user: User;
    },
  ): Promise<Empty | { error: string }> {
    if (!newName || newName.trim() === "") {
      return { error: "New playlist name cannot be empty." };
    }

    const existingPlaylist = await this.playlists.findOne({ _id: playlist });
    if (!existingPlaylist) {
      return { error: `Playlist with ID '${playlist}' not found.` };
    }
    if (existingPlaylist.owner !== user) {
      return {
        error: `User '${user}' is not the owner of playlist '${playlist}'.`,
      };
    }

    const playlistWithNewName = await this.playlists.findOne({
      owner: user,
      name: newName,
    });
    if (playlistWithNewName && playlistWithNewName._id !== playlist) {
      return {
        error:
          `User '${user}' already has another playlist named '${newName}'.`,
      };
    }

    await this.playlists.updateOne(
      { _id: playlist },
      { $set: { name: newName } },
    );
    return {};
  }

  /**
   * addSong (playlist: Playlist, song: Song, user: User)
   *
   * **requires**: a `Playlist` with id `playlist` exists; the `owner` of
   *   `playlist` is `user`; `song` does not already exist in the `songs`
   *   sequence of `playlist`
   *
   * **effects**: appends `song` to the `songs` sequence of `playlist`
   */
  async addSong(
    { playlist, song, user }: { playlist: Playlist; song: Song; user: User },
  ): Promise<Empty | { error: string }> {
    const existingPlaylist = await this.playlists.findOne({ _id: playlist });
    if (!existingPlaylist) {
      return { error: `Playlist with ID '${playlist}' not found.` };
    }
    if (existingPlaylist.owner !== user) {
      return {
        error: `User '${user}' is not the owner of playlist '${playlist}'.`,
      };
    }
    if (existingPlaylist.songs.includes(song)) {
      console.log("Duplicate song", song, "in playlist", playlist);
      return {
        error:
          `DUPLICATE_SONG: Song '${song}' is already in playlist '${playlist}'.`,
      };
    }

    console.log("Adding song", song, "to playlist", playlist);
    await this.playlists.updateOne(
      { _id: playlist },
      { $push: { songs: song } },
    );
    return {};
  }

  /**
   * removeSong (playlist: Playlist, song: Song, user: User)
   *
   * **requires**: a `Playlist` with id `playlist` exists; the `owner` of
   *   `playlist` is `user`; `song` exists in the `songs` sequence of `playlist`
   *
   * **effects**: removes all occurrences of `song` from the `songs` sequence
   *   of `playlist`
   */
  async removeSong(
    { playlist, song, user }: { playlist: Playlist; song: Song; user: User },
  ): Promise<Empty | { error: string }> {
    const existingPlaylist = await this.playlists.findOne({ _id: playlist });
    if (!existingPlaylist) {
      return { error: `Playlist with ID '${playlist}' not found.` };
    }
    if (existingPlaylist.owner !== user) {
      return {
        error: `User '${user}' is not the owner of playlist '${playlist}'.`,
      };
    }
    if (!existingPlaylist.songs.includes(song)) {
      return {
        error: `Song '${song}' is not found in playlist '${playlist}'.`,
      };
    }

    await this.playlists.updateOne(
      { _id: playlist },
      { $pull: { songs: song } }, // Removes all occurrences of the song
    );
    return {};
  }

  /**
   * reorderSongs (playlist: Playlist, songs: sequence of Song, user: User)
   *
   * **requires**: a `Playlist` with id `playlist` exists; the `owner` of
   *   `playlist` is `user`; the multiset of `songs` in the new sequence is
   *   identical to the multiset of songs currently in the playlist
   *
   * **effects**: updates the `songs` sequence of `playlist` to be the new
   *   `songs` sequence
   */
  async reorderSongs(
    { playlist, songs, user }: {
      playlist: Playlist;
      songs: Song[];
      user: User;
    },
  ): Promise<Empty | { error: string }> {
    const existingPlaylist = await this.playlists.findOne({ _id: playlist });
    if (!existingPlaylist) {
      return { error: `Playlist with ID '${playlist}' not found.` };
    }
    if (existingPlaylist.owner !== user) {
      return {
        error: `User '${user}' is not the owner of playlist '${playlist}'.`,
      };
    }

    // Check multiset identity
    const oldSongsMap = new Map<Song, number>();
    for (const s of existingPlaylist.songs) {
      oldSongsMap.set(s, (oldSongsMap.get(s) || 0) + 1);
    }

    const newSongsMap = new Map<Song, number>();
    for (const s of songs) {
      newSongsMap.set(s, (newSongsMap.get(s) || 0) + 1);
    }

    if (oldSongsMap.size !== newSongsMap.size) {
      return {
        error: "Multiset of new songs is not identical to existing songs.",
      };
    }

    for (const [s, count] of oldSongsMap.entries()) {
      if ((newSongsMap.get(s) || 0) !== count) {
        return {
          error: "Multiset of new songs is not identical to existing songs.",
        };
      }
    }

    await this.playlists.updateOne(
      { _id: playlist },
      { $set: { songs: songs } },
    );
    return {};
  }

  /**
   * _getPlaylistsForUser (user: User): (playlist: Playlist, name: String)
   *
   * **requires**: true
   *
   * **effects**: returns a set of records, each containing the id and name of
   *   a playlist owned by `user`
   */
  async _getPlaylistsForUser(
    { user }: { user: User },
  ): Promise<Array<{ playlist: Playlist; name: string }>> {
    const userPlaylists = await this.playlists.find({ owner: user }).project({
      _id: 1,
      name: 1,
    }).toArray();
    return userPlaylists.map((p) => ({ playlist: p._id, name: p.name }));
  }

  /**
   * _getPlaylist (playlist: Playlist): (playlist: { _id: Playlist, name: String, owner: User, songs: sequence of Song })
   *
   * **requires**: `playlist` exists
   *
   * **effects**: returns all information for the given `playlist`, with songs enriched with full recommendation data
   */
  async _getPlaylist(
    { playlist }: { playlist: Playlist },
  ): Promise<
    Array<{ _id: Playlist; name: string; owner: User; songs: any[] }>
  > {
    const foundPlaylist = await this.playlists.findOne({ _id: playlist });
    if (!foundPlaylist) {
      return [];
    }

    // Enrich song IDs with full song data from CountryRecommendation collection
    const enrichedSongs = await Promise.all(
      foundPlaylist.songs.map(async (songId) => {
        const songData = await this.recommendationCollection.findOne({ _id: songId });
        if (songData) {
          return {
            _id: songData._id,
            songTitle: songData.songTitle,
            artist: songData.artist,
            language: songData.language,
            youtubeURL: songData.youtubeURL,
            genre: songData.genre,
            countryName: songData.countryName,
            recType: songData.recType,
          };
        }
        // If song data not found, return just the ID
        return songId;
      })
    );

    return [{
      _id: foundPlaylist._id,
      name: foundPlaylist.name,
      owner: foundPlaylist.owner,
      songs: enrichedSongs,
    }];
  }
}
