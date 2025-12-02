import { CountryRecommendation, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

// Note: All requests are authenticated by checking for a valid session.

// --- Get New Recommendations ---
export const GetNewRecsRequest: Sync = (
  { request, session, user, countryName },
) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/getNewRecs", session, countryName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.getNewRecs, { countryName }]),
});

export const GetNewRecsResponse: Sync = ({ request, recommendations }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getNewRecs" }, {
      request,
    }],
    [CountryRecommendation.getNewRecs, {}, { recommendations }],
  ),
  then: actions([Requesting.respond, { request, recommendations }]),
});

export const GetNewRecsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getNewRecs" }, {
      request,
    }],
    [CountryRecommendation.getNewRecs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Get System Recommendations ---
export const GetSystemRecsRequest: Sync = (
  { request, session, user, countryName },
) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/getSystemRecs", session, countryName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.getSystemRecs, { countryName }]),
});

export const GetSystemRecsResponse: Sync = ({ request, recommendations }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getSystemRecs" }, {
      request,
    }],
    [CountryRecommendation.getSystemRecs, {}, { recommendations }],
  ),
  then: actions([Requesting.respond, { request, recommendations }]),
});

export const GetSystemRecsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getSystemRecs" }, {
      request,
    }],
    [CountryRecommendation.getSystemRecs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Get Community Recommendations ---
export const GetCommunityRecsRequest: Sync = (
  { request, session, user, countryName },
) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/getCommunityRecs", session, countryName },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.getCommunityRecs, { countryName }]),
});

export const GetCommunityRecsResponse: Sync = (
  { request, recommendations },
) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getCommunityRecs" }, {
      request,
    }],
    [CountryRecommendation.getCommunityRecs, {}, { recommendations }],
  ),
  then: actions([Requesting.respond, { request, recommendations }]),
});

export const GetCommunityRecsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/getCommunityRecs" }, {
      request,
    }],
    [CountryRecommendation.getCommunityRecs, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Add Community Recommendation ---
export const AddCommunityRecRequest: Sync = (
  { request, session, user, countryName, title, artist, genre, language, url },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/CountryRecommendation/addCommunityRec",
      session,
      countryName,
      title,
      artist,
      genre,
      language,
      url,
    },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.addCommunityRec, {
    countryName,
    title,
    artist,
    genre,
    language,
    url,
  }]),
});

export const AddCommunityRecResponse: Sync = ({ request, recId }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/addCommunityRec" }, {
      request,
    }],
    [CountryRecommendation.addCommunityRec, {}, { recId }],
  ),
  then: actions([Requesting.respond, { request, recId }]),
});

export const AddCommunityRecResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CountryRecommendation/addCommunityRec" }, {
      request,
    }],
    [CountryRecommendation.addCommunityRec, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Remove Community Recommendation ---
export const RemoveCommunityRecRequest: Sync = (
  { request, session, user, recId },
) => ({
  when: actions([
    Requesting.request,
    { path: "/CountryRecommendation/removeCommunityRec", session, recId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([CountryRecommendation.removeCommunityRec, { recId }]),
});

export const RemoveCommunityRecResponse: Sync = ({ request }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/CountryRecommendation/removeCommunityRec" },
      { request },
    ],
    [CountryRecommendation.removeCommunityRec, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveCommunityRecResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/CountryRecommendation/removeCommunityRec" },
      { request },
    ],
    [CountryRecommendation.removeCommunityRec, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
