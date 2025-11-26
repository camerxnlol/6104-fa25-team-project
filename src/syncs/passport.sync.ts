import { Passport, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// --- Log Exploration ---
export const LogExplorationRequest: Sync = (
  { request, session, user, song, country },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Passport/logExploration", session, song, country },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Passport.logExploration, { user, song, country }]),
});

export const LogExplorationResponse: Sync = ({ request, entry }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { entry }],
  ),
  then: actions([Requesting.respond, { request, entry }]),
});

export const LogExplorationResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Passport/logExploration" }, { request }],
    [Passport.logExploration, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
