---
timestamp: 'Mon Nov 24 2025 10:23:33 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_102333.96d885e1.md]]'
content_id: c2ea4097af6bd72a4404eb9e8973c740902135598008e0de17bf6cd04e0f7d29
---

# file: src/Sessioning/SessioningConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";

import { testDb, freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

import SessioningConcept from "./SessioningConcept.ts";

// Define concept-specific types for clarity
type User = ID;

Deno.test("Sessioning Concept", async (t) => {
  const [db, client] = await testDb();
  const concept = new SessioningConcept(db);

  // A common user ID for tests
  const testUser = freshID() as User;

  await t.step("Action: create", async (t) => {
    await t.step(
      "effects: creates a new session, associates it with a user, and returns the session ID",
      async () => {
        console.log("  Attempting to create a session for user:", testUser);
        const result = await concept.create({ user: testUser });
        console.log("  Action returned:", result);

        assertExists(result.session, "❌ The result should contain a session ID");
        assertNotEquals(result.session, "", "❌ Session ID should not be empty");
        console.log("  ✅ Returned a valid session ID:", result.session);

        // Verify the effect in the database
        const doc = await concept.sessions.findOne({ _id: result.session });
        console.log("  Verifying session in database...");
        assertExists(doc, "❌ Session document was not created in the database");
        assertEquals(
          doc.user,
          testUser,
          "❌ The created session is not associated with the correct user",
        );
        console.log(
          "  ✅ Session found in database and correctly associated with user:",
          doc.user,
        );
      },
    );
  });

  await t.step("Action: _getUser", async (t) => {
    // Setup: Create a session to test against
    const { session: existingSession } = await concept.create({
      user: testUser,
    });

    await t.step(
      "requires: should fail if the session does not exist",
      async () => {
        const nonExistentSession = freshID();
        console.log(
          "  Attempting to get user for non-existent session:",
          nonExistentSession,
        );
        const result = await concept._getUser({ session: nonExistentSession });
        console.log("  Action returned:", result);

        const response = result[0];
        if ("error" in response) {
            assertExists(response.error, "❌ Expected an error message");
            console.log("  ✅ Received expected error for non-existent session.");
        } else {
            assertEquals(true, false, "❌ Expected an error object, but got a user object.");
        }
      },
    );

    await t.step(
      "effects: returns the user associated with an existing session",
      async () => {
        console.log(
          "  Attempting to get user for existing session:",
          existingSession,
        );
        const result = await concept._getUser({ session: existingSession });
        console.log("  Action returned:", result);

        assertEquals(result.length, 1, "❌ Expected a single user object");
        
        const response = result[0];
        if ("error" in response) {
             assertEquals(true, false, "❌ Did not expect an error for an existing session");
        } else {
             // TypeScript now knows this is { user: User }
             assertEquals(
                response.user,
                testUser,
                "❌ Returned user does not match the expected user",
             );
             console.log("  ✅ Correctly returned user:", response.user);
        }
      },
    );
  });

  await t.step("Action: delete", async (t) => {
    // Setup: Create a session to delete
    const { session: sessionToDelete } = await concept.create({
      user: testUser,
    });

    await t.step(
      "requires: should fail if the session does not exist",
      async () => {
        const nonExistentSession = freshID();
        console.log(
          "  Attempting to delete non-existent session:",
          nonExistentSession,
        );
        const result = await concept.delete({ session: nonExistentSession });
        console.log("  Action returned:", result);

        if ("error" in result) {
            assertExists(result.error, "❌ Expected an error message");
            console.log("  ✅ Received expected error for non-existent session.");
        } else {
            assertEquals(true, false, "❌ Expected error result but got success.");
        }
      },
    );

    await t.step("effects: removes an existing session", async () => {
      console.log("  Attempting to delete existing session:", sessionToDelete);
      const result = await concept.delete({ session: sessionToDelete });
      console.log("  Action returned:", result);

      assertEquals(
        "error" in result,
        false,
        "❌ Did not expect an error when deleting an existing session",
      );
      console.log("  ✅ Session deleted successfully without error.");

      // Verify the effect in the database
      console.log("  Verifying session is removed from database...");
      const doc = await concept.sessions.findOne({ _id: sessionToDelete });
      assertEquals(doc, null, "❌ Session document was not removed from the database");
      console.log("  ✅ Session document confirmed to be deleted.");
    });
  });

  await t.step(
    "Principle: Maintains a user's logged-in state across requests",
    async (t) => {
      console.log(
        "\n--- Testing Session Lifecycle Principle ---",
      );
      const principleUser = freshID() as User;
      console.log("A user logs in. User ID:", principleUser);

      console.log("\n1. Create session (login)");
      const { session } = await concept.create({ user: principleUser });
      console.log("  > Action: create({ user:", principleUser, "})");
      console.log("  > Result: New session created:", session);
      assertExists(session, "❌ Session creation failed");
      console.log("  ✅ User is now considered logged in.");

      console.log("\n2. First authenticated request");
      console.log("  > Action: _getUser({ session:", session, "})");
      let userResult = await concept._getUser({ session });
      console.log("  > Result:", userResult);
      
      // Type Guard for step 2
      if ("error" in userResult[0]) {
          assertEquals(true, false, "❌ First request returned an error unexpectedly.");
      } else {
          assertEquals(
            userResult[0].user,
            principleUser,
            "❌ First request failed to identify the correct user.",
          );
      }
      console.log("  ✅ User state is correctly maintained.");

      console.log("\n3. Second authenticated request");
      console.log("  > Action: _getUser({ session:", session, "})");
      userResult = await concept._getUser({ session });
      console.log("  > Result:", userResult);
      
      // Type Guard for step 3
      if ("error" in userResult[0]) {
          assertEquals(true, false, "❌ Second request returned an error unexpectedly.");
      } else {
          assertEquals(
            userResult[0].user,
            principleUser,
            "❌ Second request failed to identify the correct user.",
          );
      }
      console.log("  ✅ User state is persistent across multiple requests.");

      console.log("\n4. Delete session (logout)");
      console.log("  > Action: delete({ session:", session, "})");
      const deleteResult = await concept.delete({ session });
      console.log("  > Result:", deleteResult);
      assertEquals(
        "error" in deleteResult,
        false,
        "❌ Session deletion failed.",
      );
      console.log("  ✅ User is now logged out.");

      console.log("\n5. Post-logout request (should fail)");
      console.log("  > Action: _getUser({ session:", session, "})");
      const finalResult = await concept._getUser({ session });
      console.log("  > Result:", finalResult);
      
      const finalItem = finalResult[0];
      if ("error" in finalItem) {
        assertExists(
            finalItem.error,
            "❌ Error property missing on failure result."
        );
        console.log("  ✅ User is correctly denied access after logout (Error returned).");
      } else {
          assertEquals(true, false, "❌ Request was successful after logout, which is incorrect.");
      }
      console.log("--- Principle Test Complete ---\n");
    },
  );

  await client.close();
});
```
