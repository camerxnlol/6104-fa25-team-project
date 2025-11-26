import { Requesting, Sessioning, UserAuthentication } from "@concepts";
import { actions, Sync } from "@engine";

// --- Registration ---
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

// On successful registration, create a session and respond with both user and session.
export const RegisterResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions(
    [Sessioning.create, { user }],
  ),
});

// Once session is created, send the response
export const RegisterRespondWithSession: Sync = ({ request, user, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
    [Sessioning.create, { user }, { session }],
  ),
  then: actions([Requesting.respond, { request, user, session }]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Login ---
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

// On successful login, create a session.
export const LoginResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions(
    [Sessioning.create, { user }],
  ),
});

// Once session is created, send the response
export const LoginRespondWithSession: Sync = ({ request, user, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
    [Sessioning.create, { user }, { session }],
  ),
  then: actions([Requesting.respond, { request, user, session }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Logout ---
// We define a custom /logout route that uses the Sessioning.delete action.
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/logout", session },
      { request },
    ],
  ),
  then: actions(
    [Sessioning.delete, { session }],
  ),
});

export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions(
    [Requesting.respond, { request, status: "logged_out" }],
  ),
});

export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});
