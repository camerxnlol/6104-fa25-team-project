---
timestamp: 'Mon Nov 24 2025 10:37:35 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251124_103735.b998d7ad.md]]'
content_id: 23f47ca926f6a54596d9390cc070bad5eae59df6d32a9b670a4227525ffb4af5
---

# trace:

The principle states: "if a user listens to a song from a country they haven't explored before, then that country is added to their passport, which they can view as a list of explored countries".

To test this principle, we will perform the following trace:

1. **Setup**: Identify User `alice`, Song `s1`, Song `s2`, Song `s3`.
2. **Action**: Alice logs exploration of `s1` from "Japan".
   * *Expectation*: Action succeeds.
3. **Query**: Check explored countries for `alice`.
   * *Expectation*: Returns `["Japan"]`.
4. **Action**: Alice logs exploration of `s2` from "Japan".
   * *Expectation*: Action succeeds.
5. **Query**: Check explored countries for `alice`.
   * *Expectation*: Returns `["Japan"]` (Set uniqueness maintained).
6. **Action**: Alice logs exploration of `s3` from "Brazil".
   * *Expectation*: Action succeeds.
7. **Query**: Check explored countries for `alice`.
   * *Expectation*: Returns `["Japan", "Brazil"]` (New country added).
8. **Query**: Check history for `alice` in "Japan".
   * *Expectation*: Returns 2 entries. The entry for `s2` should be first (most recent), followed by `s1`.
