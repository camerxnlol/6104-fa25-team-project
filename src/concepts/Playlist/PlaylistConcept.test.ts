import { assertEquals, assertNotEquals, assertExists, assertArrayIncludes, assert } from "jsr:@std/assert";
import { testDb, freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import PlaylistConcept from "./PlaylistConcept.ts";
import { Db, MongoClient } from "npm:mongodb";

type Playlist = ID;

Deno.test("Playlist Concept Tests", async (test) => {
  // Setup: Initialize database and concept
  const [db, client] = await testDb();
  const playlistConcept = new PlaylistConcept(db);
  console.log("Database and PlaylistConcept initialized for testing.");

  // Define test users and songs
  const userA: ID = "user:Alice" as ID;
  const userB: ID = "user:Bob" as ID;
  const song1: ID = "song:BohemianRhapsody" as ID;
  const song2: ID = "song:HotelCalifornia" as ID;
  const song3: ID = "song:StairwayToHeaven" as ID;
  const song4: ID = "song:SweetChildOMine" as ID;

  try {

  await test.step("Action: createPlaylist", async () => {
    console.log("\n--- Testing createPlaylist ---");

    // Test Case 1: Valid playlist creation
    console.log("Trace: UserA creates a playlist named 'My First Playlist'.");
    const result1 = await playlistConcept.createPlaylist({ owner: userA, name: "My First Playlist" });
    assertExists(result1, "Result should not be null or undefined");
    assert("playlist" in result1, `Expected playlist ID, got error: ${("error" in result1 ? result1.error : "N/A")}`);
    const playlistId1 = (result1 as { playlist: Playlist }).playlist;
    assertNotEquals(playlistId1, "", "Playlist ID should not be empty");
    console.log(`Effect: Playlist '${playlistId1}' created for UserA.`);

    // Verify state with query
    const queriedPlaylist1 = await playlistConcept._getPlaylist({ playlist: playlistId1 });
    assertEquals(queriedPlaylist1.length, 1, "Should find one playlist");
    assertEquals(queriedPlaylist1[0].name, "My First Playlist", "Playlist name should match");
    assertEquals(queriedPlaylist1[0].owner, userA, "Playlist owner should match");
    assertEquals(queriedPlaylist1[0].songs.length, 0, "New playlist should have no songs");
    console.log("Confirmation: Playlist details verified via _getPlaylist query.");

    // Test Case 2: Create a second playlist for the same user
    console.log("Trace: UserA creates another playlist named 'Another Playlist'.");
    const result2 = await playlistConcept.createPlaylist({ owner: userA, name: "Another Playlist" });
    assert("playlist" in result2, `Expected playlist ID, got error: ${("error" in result2 ? result2.error : "N/A")}`);
    const playlistId2 = (result2 as { playlist: Playlist }).playlist;
    assertNotEquals(playlistId2, playlistId1, "Should create a different playlist ID");
    console.log(`Effect: Another playlist '${playlistId2}' created for UserA.`);

    // Test Case 3: Create a playlist for a different user with the same name
    console.log("Trace: UserB creates a playlist named 'My First Playlist'.");
    const result3 = await playlistConcept.createPlaylist({ owner: userB, name: "My First Playlist" });
    assert("playlist" in result3, `Expected playlist ID, got error: ${("error" in result3 ? result3.error : "N/A")}`);
    const playlistId3 = (result3 as { playlist: Playlist }).playlist;
    assertNotEquals(playlistId3, "", "Playlist ID should not be empty");
    console.log(`Effect: UserB successfully created a playlist with a name also used by UserA.`);

    // Test Case 4: Attempt to create a playlist with an empty name (requires check)
    console.log("Trace: UserA attempts to create a playlist with an empty name.");
    const errorResult1 = await playlistConcept.createPlaylist({ owner: userA, name: "" });
    assert("error" in errorResult1, "Expected an error for empty name");
    assertEquals(errorResult1.error, "Playlist name cannot be empty.", "Error message should match");
    console.log("Requirement Check: Empty name correctly rejected.");

    // Test Case 5: Attempt to create a playlist with a name that already exists for the same user (requires check)
    console.log("Trace: UserA attempts to create a playlist with a duplicate name 'My First Playlist'.");
    const errorResult2 = await playlistConcept.createPlaylist({ owner: userA, name: "My First Playlist" });
    assert("error" in errorResult2, "Expected an error for duplicate name");
    assertEquals(
      errorResult2.error,
      "Playlist with name 'My First Playlist' already exists for this user.",
      "Error message should match for duplicate name",
    );
    console.log("Requirement Check: Duplicate name for same user correctly rejected.");

    // Clean up playlists created in this test
    await playlistConcept.deletePlaylist({ playlist: playlistId1, user: userA });
    await playlistConcept.deletePlaylist({ playlist: playlistId2, user: userA });
    await playlistConcept.deletePlaylist({ playlist: playlistId3, user: userB });
  });

  await test.step("Action: deletePlaylist", async () => {
    console.log("\n--- Testing deletePlaylist ---");
    // Setup: Create a playlist to delete
    const createResult = await playlistConcept.createPlaylist({ owner: userA, name: "Playlist to Delete" });
    assert("playlist" in createResult, "Setup: Expected playlist ID");
    const playlistToDeleteId = (createResult as { playlist: Playlist }).playlist;
    console.log(`Setup: Created playlist '${playlistToDeleteId}' for UserA.`);

    // Test Case 1: Valid deletion by owner
    console.log(`Trace: UserA deletes playlist '${playlistToDeleteId}'.`);
    const deleteResult1 = await playlistConcept.deletePlaylist({ playlist: playlistToDeleteId, user: userA });
    assert("error" in deleteResult1 === false, `Expected no error, got: ${("error" in deleteResult1 ? deleteResult1.error : "N/A")}`);
    assertEquals(deleteResult1, {}, "Expected empty success object");
    console.log(`Effect: Playlist '${playlistToDeleteId}' successfully deleted.`);

    // Verify deletion with query
    const queriedPlaylist1 = await playlistConcept._getPlaylist({ playlist: playlistToDeleteId });
    assertEquals(queriedPlaylist1.length, 0, "Expected empty array as playlist should no longer exist");
    console.log("Confirmation: Playlist confirmed as deleted via _getPlaylist query.");

    // Test Case 2: Attempt to delete a non-existent playlist (requires check)
    console.log("Trace: UserA attempts to delete a non-existent playlist.");
    const nonExistentPlaylistId: ID = freshID();
    const errorResult1 = await playlistConcept.deletePlaylist({ playlist: nonExistentPlaylistId, user: userA });
    assert("error" in errorResult1, "Expected an error for non-existent playlist");
    assertEquals(errorResult1.error, `Playlist with ID '${nonExistentPlaylistId}' not found.`, "Error message should match");
    console.log("Requirement Check: Deletion of non-existent playlist correctly rejected.");

    // Test Case 3: Attempt to delete a playlist by a non-owner (requires check)
    const createResult2 = await playlistConcept.createPlaylist({ owner: userA, name: "Another Playlist to Delete" });
    assert("playlist" in createResult2, "Setup: Expected playlist ID");
    const playlistToDeleteId2 = (createResult2 as { playlist: Playlist }).playlist;
    console.log(`Setup: Created playlist '${playlistToDeleteId2}' for UserA.`);

    console.log(`Trace: UserB attempts to delete playlist '${playlistToDeleteId2}' owned by UserA.`);
    const errorResult2 = await playlistConcept.deletePlaylist({ playlist: playlistToDeleteId2, user: userB });
    assert("error" in errorResult2, "Expected an error for non-owner deletion");
    assertEquals(errorResult2.error, `User '${userB}' is not the owner of playlist '${playlistToDeleteId2}'.`, "Error message should match");
    console.log("Requirement Check: Non-owner deletion correctly rejected.");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistToDeleteId2, user: userA });
  });

  await test.step("Action: renamePlaylist", async () => {
    console.log("\n--- Testing renamePlaylist ---");
    // Setup: Create a playlist
    const createResult1 = await playlistConcept.createPlaylist({ owner: userA, name: "Original Name" });
    assert("playlist" in createResult1, "Setup: Expected playlist ID");
    const playlistId1 = (createResult1 as { playlist: Playlist }).playlist;
    console.log(`Setup: Created playlist '${playlistId1}' for UserA.`);

    const createResult2 = await playlistConcept.createPlaylist({ owner: userA, name: "Other Playlist for UserA" });
    assert("playlist" in createResult2, "Setup: Expected playlist ID");
    const playlistId2 = (createResult2 as { playlist: Playlist }).playlist;
    console.log(`Setup: Created playlist '${playlistId2}' for UserA.`);

    // Test Case 1: Valid rename by owner
    console.log(`Trace: UserA renames playlist '${playlistId1}' from 'Original Name' to 'New Name'.`);
    const renameResult1 = await playlistConcept.renamePlaylist({ playlist: playlistId1, newName: "New Name", user: userA });
    assert("error" in renameResult1 === false, `Expected no error, got: ${("error" in renameResult1 ? renameResult1.error : "N/A")}`);
    assertEquals(renameResult1, {}, "Expected empty success object");
    console.log(`Effect: Playlist '${playlistId1}' renamed to 'New Name'.`);

    // Verify rename with query
    const queriedPlaylist1 = await playlistConcept._getPlaylist({ playlist: playlistId1 });
    assertEquals(queriedPlaylist1[0].name, "New Name", "Playlist name should be updated");
    console.log("Confirmation: Playlist name change verified via _getPlaylist query.");

    // Test Case 2: Attempt to rename with empty name (requires check)
    console.log(`Trace: UserA attempts to rename playlist '${playlistId1}' to an empty string.`);
    const errorResult1 = await playlistConcept.renamePlaylist({ playlist: playlistId1, newName: "", user: userA });
    assert("error" in errorResult1, "Expected an error for empty new name");
    assertEquals(errorResult1.error, "New playlist name cannot be empty.", "Error message should match");
    console.log("Requirement Check: Empty new name correctly rejected.");

    // Test Case 3: Attempt to rename by non-owner (requires check)
    console.log(`Trace: UserB attempts to rename playlist '${playlistId1}' owned by UserA.`);
    const errorResult2 = await playlistConcept.renamePlaylist({ playlist: playlistId1, newName: "Illegal Rename", user: userB });
    assert("error" in errorResult2, "Expected an error for non-owner rename");
    assertEquals(errorResult2.error, `User '${userB}' is not the owner of playlist '${playlistId1}'.`, "Error message should match");
    console.log("Requirement Check: Non-owner rename correctly rejected.");

    // Test Case 4: Attempt to rename to a name already used by another playlist of the same user (requires check)
    console.log(`Trace: UserA attempts to rename playlist '${playlistId1}' to 'Other Playlist for UserA', which already exists.`);
    const errorResult3 = await playlistConcept.renamePlaylist({ playlist: playlistId1, newName: "Other Playlist for UserA", user: userA });
    assert("error" in errorResult3, "Expected an error for duplicate name for same user");
    assertEquals(
      errorResult3.error,
      `User '${userA}' already has another playlist named 'Other Playlist for UserA'.`,
      "Error message should match for duplicate name",
    );
    console.log("Requirement Check: Rename to existing name for same user rejected.");

    // Test Case 5: Rename to the same name (should succeed and make no change)
    console.log(`Trace: UserA renames playlist '${playlistId1}' to its current name 'New Name'.`);
    const renameResult2 = await playlistConcept.renamePlaylist({ playlist: playlistId1, newName: "New Name", user: userA });
    assert("error" in renameResult2 === false, "Expected no error when renaming to the same name");
    assertEquals(renameResult2, {}, "Expected empty success object");
    console.log("Effect: Renaming to the same name succeeded without error (no functional change).");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistId1, user: userA });
    await playlistConcept.deletePlaylist({ playlist: playlistId2, user: userA });
  });

  await test.step("Action: addSong", async () => {
    console.log("\n--- Testing addSong ---");
    // Setup: Create a playlist
    const createResult = await playlistConcept.createPlaylist({ owner: userA, name: "Song Addition Playlist" });
    assert("playlist" in createResult, "Setup: Expected playlist ID");
    const playlistId = (createResult as { playlist: Playlist }).playlist;
    console.log(`Setup: Created playlist '${playlistId}' for UserA.`);

    // Test Case 1: Add a single song
    console.log(`Trace: UserA adds song '${song1}' to playlist '${playlistId}'.`);
    const addResult1 = await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA });
    assert("error" in addResult1 === false, `Expected no error, got: ${("error" in addResult1 ? addResult1.error : "N/A")}`);
    assertEquals(addResult1, {}, "Expected empty success object");
    console.log(`Effect: Song '${song1}' added to playlist '${playlistId}'.`);

    // Verify state
    const queriedPlaylist1 = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist1[0].songs, [song1], "Playlist should contain song1");
    console.log("Confirmation: Playlist songs updated correctly.");

    // Test Case 2: Add another song
    console.log(`Trace: UserA adds song '${song2}' to playlist '${playlistId}'.`);
    await playlistConcept.addSong({ playlist: playlistId, song: song2, user: userA });
    const queriedPlaylist2 = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist2[0].songs, [song1, song2], "Playlist should contain song1 and song2 in order");
    console.log(`Effect: Song '${song2}' added. Confirmation: Playlist now has [${song1}, ${song2}].`);

    // Test Case 3: Add the same song again (sequences allow duplicates)
    console.log(`Trace: UserA adds song '${song1}' again to playlist '${playlistId}'.`);
    await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA });
    const queriedPlaylist3 = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist3[0].songs, [song1, song2, song1], "Playlist should contain song1, song2, then song1 again");
    console.log(`Effect: Song '${song1}' added again. Confirmation: Playlist now has [${song1}, ${song2}, ${song1}].`);

    // Test Case 4: Attempt to add song by non-owner (requires check)
    console.log(`Trace: UserB attempts to add song '${song3}' to playlist '${playlistId}' owned by UserA.`);
    const errorResult1 = await playlistConcept.addSong({ playlist: playlistId, song: song3, user: userB });
    assert("error" in errorResult1, "Expected an error for non-owner add song");
    assertEquals(errorResult1.error, `User '${userB}' is not the owner of playlist '${playlistId}'.`, "Error message should match");
    console.log("Requirement Check: Non-owner add song correctly rejected.");

    // Test Case 5: Attempt to add song to non-existent playlist (requires check)
    console.log("Trace: UserA attempts to add song to a non-existent playlist.");
    const nonExistentPlaylistId: ID = freshID();
    const errorResult2 = await playlistConcept.addSong({ playlist: nonExistentPlaylistId, song: song3, user: userA });
    assert("error" in errorResult2, "Expected an error for non-existent playlist");
    assertEquals(errorResult2.error, `Playlist with ID '${nonExistentPlaylistId}' not found.`, "Error message should match");
    console.log("Requirement Check: Add song to non-existent playlist correctly rejected.");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistId, user: userA });
  });

  await test.step("Action: removeSong", async () => {
    console.log("\n--- Testing removeSong ---");
    // Setup: Create a playlist with songs
    const createResult = await playlistConcept.createPlaylist({ owner: userA, name: "Song Removal Playlist" });
    assert("playlist" in createResult, "Setup: Expected playlist ID");
    const playlistId = (createResult as { playlist: Playlist }).playlist;
    await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA });
    await playlistConcept.addSong({ playlist: playlistId, song: song2, user: userA });
    await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA }); // Add song1 twice
    await playlistConcept.addSong({ playlist: playlistId, song: song3, user: userA });
    console.log(`Setup: Created playlist '${playlistId}' for UserA with songs: [${song1}, ${song2}, ${song1}, ${song3}].`);

    // Test Case 1: Remove an existing song (all occurrences)
    console.log(`Trace: UserA removes song '${song1}' from playlist '${playlistId}'.`);
    const removeResult1 = await playlistConcept.removeSong({ playlist: playlistId, song: song1, user: userA });
    assert("error" in removeResult1 === false, `Expected no error, got: ${("error" in removeResult1 ? removeResult1.error : "N/A")}`);
    assertEquals(removeResult1, {}, "Expected empty success object");
    console.log(`Effect: All occurrences of song '${song1}' removed.`);

    // Verify state
    const queriedPlaylist1 = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist1[0].songs, [song2, song3], "Playlist should now contain only song2 and song3");
    console.log("Confirmation: Playlist songs updated correctly after removing all song1s.");

    // Test Case 2: Attempt to remove a non-existent song (requires check)
    console.log(`Trace: UserA attempts to remove non-existent song '${song4}' from playlist '${playlistId}'.`);
    const errorResult1 = await playlistConcept.removeSong({ playlist: playlistId, song: song4, user: userA });
    assert("error" in errorResult1, "Expected an error for non-existent song in playlist");
    assertEquals(errorResult1.error, `Song '${song4}' is not found in playlist '${playlistId}'.`, "Error message should match");
    console.log("Requirement Check: Removing non-existent song correctly rejected.");

    // Test Case 3: Attempt to remove song by non-owner (requires check)
    console.log(`Trace: UserB attempts to remove song '${song2}' from playlist '${playlistId}' owned by UserA.`);
    const errorResult2 = await playlistConcept.removeSong({ playlist: playlistId, song: song2, user: userB });
    assert("error" in errorResult2, "Expected an error for non-owner remove song");
    assertEquals(errorResult2.error, `User '${userB}' is not the owner of playlist '${playlistId}'.`, "Error message should match");
    console.log("Requirement Check: Non-owner remove song correctly rejected.");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistId, user: userA });
  });

  await test.step("Action: reorderSongs", async () => {
    console.log("\n--- Testing reorderSongs ---");
    // Setup: Create a playlist with songs
    const createResult = await playlistConcept.createPlaylist({ owner: userA, name: "Song Reorder Playlist" });
    assert("playlist" in createResult, "Setup: Expected playlist ID");
    const playlistId = (createResult as { playlist: Playlist }).playlist;
    await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA });
    await playlistConcept.addSong({ playlist: playlistId, song: song2, user: userA });
    await playlistConcept.addSong({ playlist: playlistId, song: song3, user: userA });
    console.log(`Setup: Created playlist '${playlistId}' for UserA with songs: [${song1}, ${song2}, ${song3}].`);

    // Test Case 1: Valid reorder (same multiset)
    const newOrder1 = [song3, song1, song2];
    console.log(`Trace: UserA reorders playlist '${playlistId}' to [${newOrder1.join(", ")}].`);
    const reorderResult1 = await playlistConcept.reorderSongs({ playlist: playlistId, songs: newOrder1, user: userA });
    assert("error" in reorderResult1 === false, `Expected no error, got: ${("error" in reorderResult1 ? reorderResult1.error : "N/A")}`);
    assertEquals(reorderResult1, {}, "Expected empty success object");
    console.log(`Effect: Playlist '${playlistId}' songs reordered.`);

    // Verify state
    const queriedPlaylist1 = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist1[0].songs, newOrder1, "Playlist songs should be in the new order");
    console.log("Confirmation: Playlist songs reordered correctly.");

    // Test Case 2: Attempt to reorder with a missing song (requires check)
    const newOrder2 = [song1, song2]; // Missing song3
    console.log(`Trace: UserA attempts to reorder playlist '${playlistId}' to [${newOrder2.join(", ")}] (missing song).`);
    const errorResult1 = await playlistConcept.reorderSongs({ playlist: playlistId, songs: newOrder2, user: userA });
    assert("error" in errorResult1, "Expected an error for missing song in reorder");
    assertEquals(errorResult1.error, "Multiset of new songs is not identical to existing songs.", "Error message should match");
    console.log("Requirement Check: Reorder with missing song correctly rejected.");

    // Test Case 3: Attempt to reorder with an extra song (requires check)
    const newOrder3 = [song1, song2, song3, song4]; // Extra song4
    console.log(`Trace: UserA attempts to reorder playlist '${playlistId}' to [${newOrder3.join(", ")}] (extra song).`);
    const errorResult2 = await playlistConcept.reorderSongs({ playlist: playlistId, songs: newOrder3, user: userA });
    assert("error" in errorResult2, "Expected an error for extra song in reorder");
    assertEquals(errorResult2.error, "Multiset of new songs is not identical to existing songs.", "Error message should match");
    console.log("Requirement Check: Reorder with extra song correctly rejected.");

    // Test Case 4: Attempt to reorder with different counts of a song (requires check)
    await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA }); // Add song1 again
    console.log(`Setup: Playlist now has [${song3}, ${song1}, ${song2}, ${song1}].`);
    const newOrder4 = [song1, song2, song3]; // Missing one song1
    console.log(`Trace: UserA attempts to reorder playlist '${playlistId}' to [${newOrder4.join(", ")}] (incorrect count).`);
    const errorResult3 = await playlistConcept.reorderSongs({ playlist: playlistId, songs: newOrder4, user: userA });
    assert("error" in errorResult3, "Expected an error for incorrect song count in reorder");
    assertEquals(errorResult3.error, "Multiset of new songs is not identical to existing songs.", "Error message should match");
    console.log("Requirement Check: Reorder with incorrect song count correctly rejected.");

    // Valid reorder with duplicates
    const currentSongsWithDuplicates = [song3, song1, song2, song1];
    const newOrderWithDuplicates = [song1, song1, song2, song3];
    console.log(`Trace: UserA performs valid reorder of playlist '${playlistId}' to [${newOrderWithDuplicates.join(", ")}].`);
    const reorderResult2 = await playlistConcept.reorderSongs({ playlist: playlistId, songs: newOrderWithDuplicates, user: userA });
    assert("error" in reorderResult2 === false, `Expected no error, got: ${("error" in reorderResult2 ? reorderResult2.error : "N/A")}`);
    assertEquals(reorderResult2, {}, "Expected empty success object");
    const queriedPlaylist2 = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist2[0].songs, newOrderWithDuplicates, "Playlist songs should be in the new order with duplicates");
    console.log("Confirmation: Reorder with duplicates successful.");

    // Test Case 5: Attempt to reorder by non-owner (requires check)
    console.log(`Trace: UserB attempts to reorder playlist '${playlistId}' owned by UserA.`);
    const errorResult4 = await playlistConcept.reorderSongs({ playlist: playlistId, songs: [song1, song2, song3, song1], user: userB });
    assert("error" in errorResult4, "Expected an error for non-owner reorder");
    assertEquals(errorResult4.error, `User '${userB}' is not the owner of playlist '${playlistId}'.`, "Error message should match");
    console.log("Requirement Check: Non-owner reorder correctly rejected.");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistId, user: userA });
  });

  await test.step("Query: _getPlaylistsForUser", async () => {
    console.log("\n--- Testing _getPlaylistsForUser ---");
    // Setup: Create multiple playlists for different users
    const pA1Result = await playlistConcept.createPlaylist({ owner: userA, name: "UserA Playlist One" });
    assert("playlist" in pA1Result, "Setup: Expected playlist ID");
    const pA1 = (pA1Result as { playlist: Playlist }).playlist;
    const pA2Result = await playlistConcept.createPlaylist({ owner: userA, name: "UserA Playlist Two" });
    assert("playlist" in pA2Result, "Setup: Expected playlist ID");
    const pA2 = (pA2Result as { playlist: Playlist }).playlist;
    const pB1Result = await playlistConcept.createPlaylist({ owner: userB, name: "UserB Playlist One" });
    assert("playlist" in pB1Result, "Setup: Expected playlist ID");
    const pB1 = (pB1Result as { playlist: Playlist }).playlist;
    console.log(`Setup: Created playlists: ${pA1}, ${pA2} for UserA; ${pB1} for UserB.`);

    // Test Case 1: Retrieve playlists for UserA
    console.log(`Trace: Retrieve playlists for UserA.`);
    const userAPlaylists = await playlistConcept._getPlaylistsForUser({ user: userA });
    assertEquals(userAPlaylists.length, 2, "Should retrieve 2 playlists for UserA");
    assertArrayIncludes(
      userAPlaylists.map((p) => p.name),
      ["UserA Playlist One", "UserA Playlist Two"],
      "Playlist names for UserA should match",
    );
    assertArrayIncludes(
      userAPlaylists.map((p) => p.playlist),
      [pA1, pA2],
      "Playlist IDs for UserA should match",
    );
    console.log("Confirmation: UserA's playlists retrieved correctly.");

    // Test Case 2: Retrieve playlists for UserB
    console.log(`Trace: Retrieve playlists for UserB.`);
    const userBPlaylists = await playlistConcept._getPlaylistsForUser({ user: userB });
    assertEquals(userBPlaylists.length, 1, "Should retrieve 1 playlist for UserB");
    assertEquals(userBPlaylists[0].name, "UserB Playlist One", "Playlist name for UserB should match");
    assertEquals(userBPlaylists[0].playlist, pB1, "Playlist ID for UserB should match");
    console.log("Confirmation: UserB's playlists retrieved correctly.");

    // Test Case 3: Retrieve playlists for a user with no playlists
    console.log("Trace: Retrieve playlists for a user with no playlists.");
    const userC: ID = "user:Charlie" as ID;
    const userCPlaylists = await playlistConcept._getPlaylistsForUser({ user: userC });
    assertEquals(userCPlaylists.length, 0, "Should retrieve 0 playlists for user with no playlists");
    console.log("Confirmation: Correctly returned empty array for user with no playlists.");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: pA1, user: userA });
    await playlistConcept.deletePlaylist({ playlist: pA2, user: userA });
    await playlistConcept.deletePlaylist({ playlist: pB1, user: userB });
  });

  await test.step("Query: _getPlaylist", async () => {
    console.log("\n--- Testing _getPlaylist ---");
    // Setup: Create a playlist with songs
    const createResult = await playlistConcept.createPlaylist({ owner: userA, name: "Detailed Playlist" });
    assert("playlist" in createResult, "Setup: Expected playlist ID");
    const playlistId = (createResult as { playlist: Playlist }).playlist;
    await playlistConcept.addSong({ playlist: playlistId, song: song1, user: userA });
    await playlistConcept.addSong({ playlist: playlistId, song: song2, user: userA });
    console.log(`Setup: Created playlist '${playlistId}' for UserA with songs: [${song1}, ${song2}].`);

    // Test Case 1: Retrieve all information for an existing playlist
    console.log(`Trace: Retrieve detailed information for playlist '${playlistId}'.`);
    const queriedPlaylist = await playlistConcept._getPlaylist({ playlist: playlistId });
    assertEquals(queriedPlaylist.length, 1, "Should return a single playlist record");
    assertEquals(queriedPlaylist[0]._id, playlistId, "Playlist ID should match");
    assertEquals(queriedPlaylist[0].name, "Detailed Playlist", "Playlist name should match");
    assertEquals(queriedPlaylist[0].owner, userA, "Playlist owner should match");
    assertEquals(queriedPlaylist[0].songs, [song1, song2], "Playlist songs should match");
    console.log("Confirmation: All playlist details retrieved correctly.");

    // Test Case 2: Attempt to retrieve a non-existent playlist
    console.log("Trace: Attempt to retrieve a non-existent playlist.");
    const nonExistentPlaylistId: ID = freshID();
    const emptyResult = await playlistConcept._getPlaylist({ playlist: nonExistentPlaylistId });
    assertEquals(emptyResult.length, 0, "Expected empty array for non-existent playlist");
    console.log("Confirmation: Retrieval of non-existent playlist returns empty array.");

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistId, user: userA });
  });

  await test.step("Principle Trace: 'Road Trip Jams' scenario", async () => {
    console.log("\n--- Principle Trace: 'Road Trip Jams' scenario ---");
    const playlistOwner: ID = "user:PrincipleUser" as ID;
    const principleSong1: ID = "song:HighwayToHell" as ID;
    const principleSong2: ID = "song:BornToRun" as ID;
    const principleSong3: ID = "song:SweetHomeAlabama" as ID;
    const principleSong4: ID = "song:TakeItEasy" as ID;

    let playlistId: Playlist;

    // Step 1: User creates a playlist, names it "Road Trip Jams"
    console.log("Trace Step 1: PrincipleUser creates 'Road Trip Jams'.");
    const createResult = await playlistConcept.createPlaylist({ owner: playlistOwner, name: "Road Trip Jams" });
    assert("playlist" in createResult, "Expected playlist ID from creation");
    playlistId = (createResult as { playlist: Playlist }).playlist;
    console.log(`Effect: Playlist '${playlistId}' created.`);
    let currentPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(currentPlaylist.name, "Road Trip Jams");
    assertEquals(currentPlaylist.songs.length, 0);
    console.log("Confirmation: Playlist 'Road Trip Jams' exists and is empty.");

    // Step 2: Adds several songs
    console.log(`Trace Step 2: PrincipleUser adds '${principleSong1}', '${principleSong2}', '${principleSong3}'.`);
    await playlistConcept.addSong({ playlist: playlistId, song: principleSong1, user: playlistOwner });
    await playlistConcept.addSong({ playlist: playlistId, song: principleSong2, user: playlistOwner });
    await playlistConcept.addSong({ playlist: playlistId, song: principleSong3, user: playlistOwner });
    currentPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(currentPlaylist.songs, [principleSong1, principleSong2, principleSong3]);
    console.log(`Effect: Songs added. Confirmation: Playlist now has: [${currentPlaylist.songs.join(", ")}].`);

    // Step 3: They can later retrieve that specific list of songs.
    console.log("Trace Step 3: PrincipleUser retrieves the playlist.");
    const retrievedPlaylists = await playlistConcept._getPlaylistsForUser({ user: playlistOwner });
    assertArrayIncludes(retrievedPlaylists.map(p => p.playlist), [playlistId]);
    const retrievedPlaylistInfo = retrievedPlaylists.find(p => p.playlist === playlistId);
    assertExists(retrievedPlaylistInfo);
    assertEquals(retrievedPlaylistInfo.name, "Road Trip Jams");
    const fullRetrievedPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(fullRetrievedPlaylist.songs, [principleSong1, principleSong2, principleSong3]);
    console.log("Confirmation: Playlist and its songs retrieved successfully.");

    // Step 4: If they then remove a song, reorder the remaining songs, and rename the playlist to "Classic Rock", the playlist will reflect all of these changes.

    // Remove a song
    console.log(`Trace Step 4a: PrincipleUser removes '${principleSong2}'.`);
    await playlistConcept.removeSong({ playlist: playlistId, song: principleSong2, user: playlistOwner });
    currentPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(currentPlaylist.songs, [principleSong1, principleSong3]);
    console.log(`Effect: Song removed. Confirmation: Playlist now has: [${currentPlaylist.songs.join(", ")}].`);

    // Reorder the remaining songs
    const reorderedSongs = [principleSong3, principleSong1];
    console.log(`Trace Step 4b: PrincipleUser reorders songs to [${reorderedSongs.join(", ")}].`);
    await playlistConcept.reorderSongs({ playlist: playlistId, songs: reorderedSongs, user: playlistOwner });
    currentPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(currentPlaylist.songs, reorderedSongs);
    console.log(`Effect: Songs reordered. Confirmation: Playlist now has: [${currentPlaylist.songs.join(", ")}].`);

    // Rename the playlist to "Classic Rock"
    const newPlaylistName = "Classic Rock";
    console.log(`Trace Step 4c: PrincipleUser renames playlist to '${newPlaylistName}'.`);
    await playlistConcept.renamePlaylist({ playlist: playlistId, newName: newPlaylistName, user: playlistOwner });
    currentPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(currentPlaylist.name, newPlaylistName);
    console.log(`Effect: Playlist renamed. Confirmation: Playlist name is now '${newPlaylistName}'.`);

    // The playlist will reflect all of these changes.
    console.log("Confirmation of all changes in final state:");
    const finalPlaylist = (await playlistConcept._getPlaylist({ playlist: playlistId }))[0];
    assertEquals(finalPlaylist.name, newPlaylistName, "Final playlist name mismatch");
    assertEquals(finalPlaylist.songs, reorderedSongs, "Final playlist song order mismatch");
    console.log(`Final state: Name: '${finalPlaylist.name}', Songs: [${finalPlaylist.songs.join(", ")}]. Principle fully demonstrated.`);

    // Clean up
    await playlistConcept.deletePlaylist({ playlist: playlistId, user: playlistOwner });
  });
  } finally {
    // Teardown: Close database connection
    await client.close();
    console.log("Database client closed.");
  }
});