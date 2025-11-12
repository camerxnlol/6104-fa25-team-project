# Problem Framing

## Domain

### Music

Our group likes to listen to a wide variety of music, ranging across many genres, cultural backgrounds, and styles. Some of us enjoy performing it as well. We’ve even made friends through musical experiences.

---

## Problem

Many people find it difficult to connect with others from different countries because of cultural differences and unfamiliar traditions. Limited exposure to global perspectives creates barriers. Although music is one of the most universal and relatable forms of expression, most apps focus on personal listening rather than helping users explore the world’s cultures. Users lack an engaging way to use music as a bridge for understanding and connecting with people around the world.

---

## Evidence

1. **Study on Platform Affordances and Diversity of Consumption**
   [https://www.nature.com/articles/s41598-024-75967-0](https://www.nature.com/articles/s41598-024-75967-0)
   Indicates that different on-platform affordances lead to different levels of listening diversity, showing how algorithms can narrow or widen discovery.

2. **Auralist: Introducing Serendipity into Music Recommendation**
   [https://dl.acm.org/doi/10.1145/2124295.2124300](https://dl.acm.org/doi/10.1145/2124295.2124300)
   Injecting serendipity (randomness) improves user satisfaction and discovery, supporting one of the goals of the project — balancing novelty and relevance.

3. **MIDiA: Music Discovery is Not Dead, Just Evolving**
   [https://www.midiaresearch.com/blog/music-discovery-is-not-dead-just-evolving-the-industry-needs-to-evolve-with-it](https://www.midiaresearch.com/blog/music-discovery-is-not-dead-just-evolving-the-industry-needs-to-evolve-with-it)
   Industry analysis shows discovery paths shifting to TikTok, YouTube, and streaming — users’ music journeys are increasingly fragmented.

4. **Luminate: 2024 Year-End Music Industry Report**
   [https://luminatedata.com/reports/yearend-music-industry-report-2024/](https://luminatedata.com/reports/yearend-music-industry-report-2024/)
   Highlights cross-market shifts and rising non-English genres (e.g., K-pop, Afrobeats), indicating a growing appetite for global music.

5. **Spotify: Nearly 2 Billion Discoveries Happen Every Day**
   [https://newsroom.spotify.com/2023-07-20/nearly-2-billion-music-discoveries-happen-on-spotify-every-day-heres-what-listeners-are-finding/](https://newsroom.spotify.com/2023-07-20/nearly-2-billion-music-discoveries-happen-on-spotify-every-day-heres-what-listeners-are-finding/)
   Demonstrates enormous demand for music discovery — our project can focus on global music.

6. **Survey on Fairness & Diversity in Recommender Systems**
   [https://www.researchgate.net/publication/380771856_Fairness_and_Diversity_in_Recommender_Systems_A_Survey](https://www.researchgate.net/publication/380771856_Fairness_and_Diversity_in_Recommender_Systems_A_Survey)
   Synthesizes literature calling for value-aware objectives (diversity, fairness) rather than pure accuracy.

---

## Comparables

1. **Spotify RADAR (Global Emerging-Artist Program)**
   [https://newsroom.spotify.com/radar/](https://newsroom.spotify.com/radar/)
   Editorial + data-driven program spotlighting new artists. Validates demand for structured new-artist discovery. However, there isn't a way to explicitly search for music from a specific place or choose between mainstream and underground.

2. **Apple Music Up Next (Monthly Rising-Artist Program)**
   [https://music.apple.com/us/curator/apple-music-up-next/1532467784](https://music.apple.com/us/curator/apple-music-up-next/1532467784)
   Global editorial program elevating rising artists, showing that users value curated entry points into unfamiliar acts. However, there isn't a way to explicitly search for music from a specific place or choose between mainstream and underground.

3. **Bandcamp Daily (Scene-Based Editorial)**
   [https://daily.bandcamp.com/](https://daily.bandcamp.com/)
   New artists can upload their songs for discovery, demonstrating appetite for context beyond charts.

4. **Shazam Global & City Charts**
   [https://www.shazam.com/charts/top-200/world](https://www.shazam.com/charts/top-200/world)
   Real-time, location-aware charts showing what people are discovering globally — however, most of the songs are from the U.S.

5. **Against Filter Bubbles: Diversified Music Recommendation (2024)**
   [https://arxiv.org/abs/2402.16299](https://arxiv.org/abs/2402.16299)
   Algorithmic approach to improve music recommendations by increasing artist/genre diversity without sacrificing accuracy. Our focus is on global diversity instead.

6. **WebLab Dine and Dash**
   [https://dine-and-dash.onrender.com/](https://dine-and-dash.onrender.com/)
   An exploration game where users learn about countries through their popular dishes. Similar exploration idea, but our focus is on exploring cultures through music.

---

## Features

* **Friends**: Users can add each other as friends, creating a personal network to share and discover music together. This helps people connect through shared songs and builds relationships that cross geographical borders.
* **Community Recommendation**: Users can contribute their favorite songs from each country and see others’ picks ranked by popularity. This collective sharing exposes listeners to authentic cultural favorites and fosters global community.
* **System Recommendation**: An AI feature suggests lesser-known or emerging artists from each country, including indigenous musicians. This expands users’ exposure to diverse sounds beyond mainstream playlists.
* **Recommendation Flagging**: Users can flag incorrect or inappropriate song recommendations to ensure accuracy and cultural respect. This keeps the platform trustworthy and protects against misinformation.
* **Passport**: A visual tracker that shows all the countries a user has explored through music. It gamifies cultural exploration and encourages users to experience new sounds.
* **Public and Private Playlists**: Users can organize songs they love into playlists, choosing to keep them private or share them publicly. Sharing playlists spreads cultural appreciation and connects listeners.
* **Cultural Deep Dive**: For each country, users can access a page explaining its musical history and indigenous traditions. This deepens cultural understanding and provides context for the music.
* **Safety Filter**: Users can toggle this feature to avoid explicit songs, allowing younger audiences to safely use the app.

---

## Ethical Analysis

### Stakeholders – Non-Targeted Use

* **Observation:** Bad actors could weaponize recommendations (e.g., suggest music to promote nationalist or hateful narratives). LLMs could miscategorize artists by culture.
* **Design Response:** Add safety filters such as song flagging so users can report problematic recommendations.

### Time – Reappropriation

* **Observation:** Schools and educators might reappropriate the app as a classroom resource for teaching world cultures, languages, or music appreciation.
* **Design Response:** Include a safety filter to block explicit content, allowing safe use in educational settings.

### Pervasiveness – Widespread Use

* **Observation:** At scale, the app can provide richer catalogs and foster global understanding but may face algorithmic bias, moderation challenges, or user overconfidence in cultural intelligence.
* **Design Response:** Use community-submitted suggestions to counter algorithmic and LLM bias.

---

## Values

* **Autonomy:** Users choose what to listen to.
* **Inclusivity:** Represent many cultures and artists.
* **Cooperation:** Users contribute suggestions to expand recommendations.

**Design Response:** Users can freely select countries to listen to. The app provides global coverage and lets users suggest songs.

---

## Environmental Sustainability

* **Observation:** LLM usage has carbon costs. As the app grows, personalized AI recommendations could increase environmental impact.
* **Design Response:** Cache recommendations in a cloud database and integrate user suggestions to reduce reliance on LLM calls over time.
