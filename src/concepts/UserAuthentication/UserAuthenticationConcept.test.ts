import { assertEquals, assert, assertExists } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";

Deno.test("UserAuthenticationConcept", async (t) => {
  const [db, client] = await testDb();
  const userAuthentication = new UserAuthenticationConcept(db);

  await t.step("Action: register", async (t) => {
    await t.step(
      "✅ should register a new user successfully when the username is unique",
      async () => {
        console.log("  Attempting to register a new user 'testuser'...");
        const result = await userAuthentication.register({
          username: "testuser",
          password: "password123",
        });

        console.log("  > Action 'register' returned:", result);

        // Confirm effect: returns a user ID
        assert("user" in result, "Expected a user object on success");
        const userId = result.user;

        // Confirm effect: user is created in the database
        const userDoc = await userAuthentication.users.findOne({
          _id: userId,
        });
        console.log("  > Verifying user in database:", userDoc);
        assertExists(userDoc, "User document should exist in the database");
        assertEquals(
          userDoc.username,
          "testuser",
          "Username in database should match",
        );
        console.log(
          "  ✅ Effect confirmed: User 'testuser' was created successfully.",
        );
      },
    );

    await t.step(
      "✅ should return an error when trying to register with an existing username",
      async () => {
        const username = "existinguser";
        console.log(
          `  First, registering user '${username}' to satisfy requirement...`,
        );
        await userAuthentication.register({
          username,
          password: "password123",
        });

        console.log(
          `  Attempting to register another user with the same username '${username}'...`,
        );
        // Requirement is not met: a user with this username already exists
        const result = await userAuthentication.register({
          username,
          password: "anotherpassword",
        });

        console.log("  > Action 'register' returned:", result);

        // Confirm effect: returns an error
        assert("error" in result, "Expected an error object on failure");
        assertEquals(
          result.error,
          "Username already exists",
          "Error message should indicate username exists",
        );
        console.log(
          "  ✅ Effect confirmed: Correct error was returned for duplicate username.",
        );
      },
    );
  });

  await t.step("Action: login", async (t) => {
    const username = "loginuser";
    const password = "securepassword";

    // Setup: Register a user to test login against
    console.log(`  Setup: Registering user '${username}'...`);
    const registerResult = await userAuthentication.register({
      username,
      password,
    });
    assert("user" in registerResult, "Setup failed: could not register user");
    const registeredUserId = registerResult.user;

    await t.step(
      "✅ should log in a user successfully with correct credentials",
      async () => {
        console.log(
          `  Attempting to log in as '${username}' with the correct password...`,
        );
        // Requirement is satisfied: user exists and password matches
        const result = await userAuthentication.login({ username, password });
        console.log("  > Action 'login' returned:", result);

        // Confirm effect: returns the correct user ID
        assert("user" in result, "Expected a user object on successful login");
        assertEquals(
          result.user,
          registeredUserId,
          "Logged in user ID should match registered user ID",
        );
        console.log("  ✅ Effect confirmed: Login was successful.");
      },
    );

    await t.step(
      "✅ should return an error when logging in with an incorrect password",
      async () => {
        console.log(
          `  Attempting to log in as '${username}' with an incorrect password...`,
        );
        // Requirement is not met: password does not match
        const result = await userAuthentication.login({
          username,
          password: "wrongpassword",
        });
        console.log("  > Action 'login' returned:", result);

        // Confirm effect: returns an error
        assert("error" in result, "Expected an error object on failed login");
        assertEquals(
          result.error,
          "Invalid username or password",
          "Error message should be generic for incorrect password",
        );
        console.log(
          "  ✅ Effect confirmed: Correct error was returned for incorrect password.",
        );
      },
    );

    await t.step(
      "✅ should return an error when logging in with a non-existent username",
      async () => {
        const nonExistentUsername = "nosuchuser";
        console.log(
          `  Attempting to log in as non-existent user '${nonExistentUsername}'...`,
        );
        // Requirement is not met: no user with this username exists
        const result = await userAuthentication.login({
          username: nonExistentUsername,
          password: "anypassword",
        });
        console.log("  > Action 'login' returned:", result);

        // Confirm effect: returns an error
        assert("error" in result, "Expected an error object on failed login");
        assertEquals(
          result.error,
          "Invalid username or password",
          "Error message should be generic for non-existent user",
        );
        console.log(
          "  ✅ Effect confirmed: Correct error was returned for non-existent user.",
        );
      },
    );
  });

  await t.step("Principle: User Registration and Authentication", async (t) => {
    await t.step(
      "✅ A user can register and then subsequently log in",
      async () => {
        const username = "principaluser";
        const password = "passwordForPrinciple";

        console.log("\n--- Testing Principle Trace ---");
        console.log(
          `1. A new user, '${username}', signs up for the service.`,
        );
        const registerResult = await userAuthentication.register({
          username,
          password,
        });
        console.log("  > Register result:", registerResult);
        assert(
          "user" in registerResult,
          "❌ Principle failed at step 1: Registration was unsuccessful.",
        );
        const registeredUserId = registerResult.user;
        console.log(
          `  > ✅ Step 1 complete. User '${username}' created with ID: ${registeredUserId}.`,
        );

        console.log(
          `2. The user, '${username}', attempts to log in with their new credentials.`,
        );
        const loginResult = await userAuthentication.login({
          username,
          password,
        });
        console.log("  > Login result:", loginResult);
        assert(
          "user" in loginResult,
          "❌ Principle failed at step 2: Login was unsuccessful.",
        );
        const loggedInUserId = loginResult.user;
        console.log(
          `  > ✅ Step 2 complete. User '${username}' logged in successfully.`,
        );

        console.log("3. Verifying the identity of the logged-in user.");
        assertEquals(
          loggedInUserId,
          registeredUserId,
          "❌ The ID from login does not match the ID from registration.",
        );
        console.log(
          "  > ✅ Verification complete. The logged-in user is the same as the registered user.",
        );

        console.log(
          "--- ✅ Principle Confirmed: The registration and login flow works as expected. ---\n",
        );
      },
    );
  });

  await client.close();
});