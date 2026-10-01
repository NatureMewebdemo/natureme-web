// Sample catalogue for the Listener view. Place names and creator credits are
// placeholders until real creator uploads exist.

export type FormatId = "story" | "course" | "audiobook" | "summary" | "podcast" | "meditation" | "music";

export interface Format {
  name: string;
  plural: string;
  short: string;
  /** CSS custom property holding this format's colour. */
  color: string;
  description: string;
}

export const FORMATS: Record<FormatId, Format> = {
  story: { name: "Audio Story", plural: "Audio Stories", short: "Story", color: "--moss", description: "Short narratives about a species, a river, a season or a place." },
  course: { name: "Course", plural: "Courses", short: "Course", color: "--sky", description: "Multi-lesson series that teach a skill or a practice around nature." },
  audiobook: { name: "Audiobook", plural: "Audiobooks", short: "Audiobook", color: "--clay", description: "Full-length nature writing, narrated by authors or licensed readers." },
  summary: { name: "Audiobook summary", plural: "Audiobook summaries", short: "Summary", color: "--signal", description: "The core ideas of a nature book, in the time of a short walk." },
  podcast: { name: "Podcast", plural: "Podcasts", short: "Podcast", color: "--plum", description: "Episodic shows and conversations with the people who know the outdoors." },
  meditation: { name: "Meditation", plural: "Meditations", short: "Meditation", color: "--teal", description: "Guided sessions from many schools of thought." },
  music: { name: "Music", plural: "Music", short: "Music", color: "--rose", description: "Songs, ambient pieces and soundscapes made with or for the outdoors." },
};

export interface Piece {
  id: string;
  format: FormatId;
  title: string;
  /** Display length, e.g. "14 min", "6 lessons", "6 h 20 min". */
  length: string;
  by: string;
  placeId?: string;
  /** Made by NatureMe with Wilderness Awareness School. */
  was?: boolean;
  collection?: boolean;
  /** Exact length in seconds, when known (creator uploads). */
  seconds?: number;
  /** Playable audio URL; sample pieces have none and play simulated. */
  audio?: string;
  /** Published by a creator from the Studio. */
  uploaded?: boolean;
  /** Price in US dollars set by the creator; free when absent or 0. */
  price?: number;
  /** Explore traditions a creator tagged; sample pieces are listed in WAYS instead. */
  traditionIds?: string[];
}

const list: Piece[] = [
  // Schools of thought
  { id: "five-sounds", format: "meditation", title: "Five sounds, near to far", length: "12 min", by: "By a mindfulness teacher" },
  { id: "noticing", format: "course", title: "Noticing: a 7-day practice", length: "7 lessons", by: "By a meditation teacher and ecologist" },
  { id: "stream-sit", format: "meditation", title: "A short sit by the stream", length: "8 min", by: "By a Zen practitioner", placeId: "lindenwood" },
  { id: "kinhin", format: "meditation", title: "Kinhin on a forest path", length: "15 min", by: "By a Zen teacher" },
  { id: "canopy", format: "meditation", title: "Invitations under the canopy", length: "22 min", by: "By a certified forest therapy guide" },
  { id: "forests-heart", format: "podcast", title: "Why forests slow the heart", length: "34 min", by: "A conversation with a forest-medicine researcher" },
  { id: "sit-spot-seasons", format: "course", title: "Your sit spot, season by season", length: "8 lessons", by: "Wilderness Awareness School", was: true },
  { id: "expanding-senses", format: "meditation", title: "Expanding the senses", length: "14 min", by: "Wilderness Awareness School", was: true },
  { id: "owl-eyes", format: "meditation", title: "Owl eyes: wide-angle vision", length: "10 min", by: "Wilderness Awareness School", was: true },
  { id: "ecological-self", format: "summary", title: "The ecological self, in 18 minutes", length: "18 min", by: "By a psychology lecturer" },
  { id: "grief-hope", format: "podcast", title: "Grief, hope and the living world", length: "41 min", by: "Episode 12 of Rooted Minds" },
  // Cultures
  { id: "ahupuaa", format: "story", title: "The ahupuaʻa, mountain to sea", length: "16 min", by: "By a Hawaiian cultural practitioner" },
  { id: "loi-kalo", format: "podcast", title: "Loʻi kalo and the return of water", length: "38 min", by: "A conversation with taro farmers" },
  { id: "lavvu", format: "story", title: "A night in the lavvu", length: "19 min", by: "By a Norwegian outdoor educator" },
  { id: "friluftsliv", format: "course", title: "Friluftsliv for city dwellers", length: "5 lessons", by: "By an outdoor-life instructor" },
  { id: "fire-country", format: "story", title: "Fire, seasons and Country", length: "17 min", by: "Shared with permission by a community ranger program" },
  { id: "songlines", format: "podcast", title: "Reading the land through songlines", length: "44 min", by: "A conversation with a Traditional Owner" },
  { id: "high-pass", format: "story", title: "Offerings at the high pass", length: "13 min", by: "By a Quechua storyteller" },
  { id: "mountains", format: "meditation", title: "Gratitude to the mountains", length: "9 min", by: "By an Andean guide" },
  { id: "wadi-rum", format: "story", title: "Navigating by the stars of Wadi Rum", length: "15 min", by: "By a desert guide" },
  { id: "desert-keeps", format: "podcast", title: "What the desert keeps", length: "36 min", by: "A conversation with a Bedouin elder" },
  // Faiths
  { id: "ayat", format: "story", title: "Āyāt: reading the signs in rain and wind", length: "14 min", by: "By a scholar of Islamic environmental ethics" },
  { id: "tafakkur", format: "meditation", title: "Tafakkur under the open sky", length: "10 min", by: "By an Islamic chaplain" },
  { id: "canticle", format: "summary", title: "Francis of Assisi and the Canticle of the Creatures", length: "20 min", by: "By a theology teacher" },
  { id: "examen", format: "meditation", title: "A walking examen", length: "12 min", by: "By a spiritual director" },
  { id: "seder-fruits", format: "story", title: "The seder of fruits", length: "11 min", by: "By a rabbi and gardener" },
  { id: "shmita", format: "podcast", title: "Shmita and resting the land", length: "39 min", by: "A conversation on Jewish agriculture" },
  { id: "sacred-groves", format: "story", title: "The sacred groves of the Western Ghats", length: "18 min", by: "By an ecologist and storyteller" },
  { id: "rivers-edge", format: "meditation", title: "At the river's edge", length: "11 min", by: "By a yoga teacher" },
  { id: "tao-water", format: "summary", title: "The Tao Te Ching on water, in 15 minutes", length: "15 min", by: "By a philosophy teacher" },
  { id: "camphor", format: "story", title: "Kami of the old camphor tree", length: "12 min", by: "By a Shinto priest" },
  { id: "metta", format: "meditation", title: "Metta for all beings", length: "13 min", by: "By a Buddhist teacher" },
  // Top Picks
  { id: "old-cedars", format: "story", title: "What the old cedars remember", length: "14 min", by: "By a wilderness naturalist" },
  { id: "birdsong", format: "course", title: "Birdsong by ear", length: "6 lessons", by: "By an ornithologist and field recordist" },
  { id: "walden", format: "summary", title: "Walden in twenty minutes", length: "20 min", by: "By a literature teacher" },
  { id: "first-light", format: "audiobook", title: "First light", length: "9 pieces", by: "Seasonal collection for early mornings", collection: true },
  // Pinned to places
  { id: "oaks-lean", format: "story", title: "Why the oaks here lean the way they do", length: "11 min", by: "By a local naturalist", placeId: "lindenwood" },
  { id: "canopy-birds", format: "course", title: "Birds of the Lindenwood canopy", length: "9 min", by: "By an ornithologist and field recordist", placeId: "lindenwood" },
  { id: "tide-line", format: "story", title: "Reading the tide line", length: "9 min", by: "By a marine biologist", placeId: "gull-point" },
  { id: "waves", format: "meditation", title: "Breathing with the waves", length: "10 min", by: "By a mindfulness teacher", placeId: "gull-point" },
  { id: "tracks", format: "course", title: "Tracks and sign on the Ridgeback", length: "4 lessons", by: "Wilderness Awareness School", placeId: "ridgeback", was: true },
  { id: "switchbacks", format: "podcast", title: "Trail talk: the switchbacks", length: "28 min", by: "Episode 3 of Out on the Ridge", placeId: "ridgeback" },
  { id: "otters", format: "story", title: "The otters who came back", length: "8 min", by: "By a keeper at the zoo", placeId: "riverside-zoo" },
  { id: "aviary", format: "story", title: "Night sounds of the aviary", length: "7 min", by: "By a field recordist", placeId: "riverside-zoo" },
  { id: "dawn-chorus", format: "meditation", title: "Dawn chorus sit", length: "16 min", by: "By the lodge naturalist", placeId: "fernhollow" },
  { id: "edge-woods", format: "audiobook", title: "A year at the edge of the woods", length: "6 h 20 min", by: "Narrated by the author", placeId: "fernhollow" },
  { id: "watershed", format: "course", title: "The valley, watershed to ridge", length: "6 lessons", by: "By a hydrologist", placeId: "sorrel-valley" },
  { id: "beavers", format: "story", title: "How the beavers remade Sorrel Creek", length: "15 min", by: "By a restoration ecologist", placeId: "sorrel-valley" },
  { id: "rainbow-falls", format: "story", title: "Rainbow Falls and the moʻo", length: "12 min", by: "By a Hawaiian cultural practitioner", placeId: "wailuku" },
  { id: "fishponds", format: "podcast", title: "Loko iʻa: the fishponds", length: "33 min", by: "A conversation with fishpond restorers", placeId: "hilo-bay" },
  { id: "ohia", format: "story", title: "ʻŌhiʻa and lehua", length: "10 min", by: "By a forest ecologist", placeId: "upland-reserve" },
];

export const PIECES: Record<string, Piece> = Object.fromEntries(list.map((p) => [p.id, p]));

// Creator uploads published from the Studio, kept beside the sample catalogue.
const uploads = new Map<string, Piece>();

export function setUploadedPieces(pieces: Piece[]): void {
  uploads.clear();
  for (const p of pieces) uploads.set(p.id, p);
}

export function uploadedPieces(): Piece[] {
  return [...uploads.values()];
}

/** A tradition's pieces: the sample ones, then creator uploads tagged with it. */
export function traditionPieceIds(t: Tradition): string[] {
  return [...t.pieceIds, ...uploadedPieces().filter((p) => p.traditionIds?.includes(t.id)).map((p) => p.id)];
}

/** Like `piece`, but undefined for an unknown id (an upload deleted while it was playing). */
export function findPiece(id: string): Piece | undefined {
  return PIECES[id] ?? uploads.get(id);
}

export function piece(id: string): Piece {
  const p = findPiece(id);
  if (!p) throw new Error(`Unknown piece: ${id}`);
  return p;
}

export interface Tradition {
  id: string;
  name: string;
  line: string;
  pieceIds: string[];
  natureMeOriginal?: boolean;
}

export type WayId = "schools" | "cultures" | "faiths";

export interface Way {
  label: string;
  sub: string;
  color: string;
  traditions: Tradition[];
}

export const WAYS: Record<WayId, Way> = {
  schools: {
    label: "Schools of thought",
    sub: "How different contemplative practices meet the natural world.",
    color: "--teal",
    traditions: [
      { id: "mindfulness", name: "Mindfulness", line: "Attention to what's here", pieceIds: ["five-sounds", "noticing"] },
      { id: "zen", name: "Zen", line: "Walking and sitting practice outdoors", pieceIds: ["stream-sit", "kinhin"] },
      { id: "shinrin-yoku", name: "Shinrin-yoku", line: "Forest bathing, from Japan", pieceIds: ["canopy", "forests-heart"] },
      { id: "sit-spot", name: "Sit spot", line: "Returning to one place over time", pieceIds: ["sit-spot-seasons", "expanding-senses", "owl-eyes"], natureMeOriginal: true },
      { id: "ecopsychology", name: "Ecopsychology", line: "The mind as part of the land", pieceIds: ["ecological-self", "grief-hope"] },
    ],
  },
  cultures: {
    label: "Cultures",
    sub: "What peoples around the world say about land, sea and sky.",
    color: "--clay",
    traditions: [
      { id: "hawaiian", name: "Hawaiian", line: "Mālama ʻāina, caring for the land", pieceIds: ["ahupuaa", "loi-kalo"] },
      { id: "nordic", name: "Nordic", line: "Friluftsliv, open-air living", pieceIds: ["lavvu", "friluftsliv"] },
      { id: "aboriginal", name: "Aboriginal Australian", line: "Caring for Country", pieceIds: ["fire-country", "songlines"] },
      { id: "andean", name: "Andean", line: "Pachamama, Mother Earth", pieceIds: ["high-pass", "mountains"] },
      { id: "bedouin", name: "Bedouin", line: "Desert and star knowledge", pieceIds: ["wadi-rum", "desert-keeps"] },
    ],
  },
  faiths: {
    label: "Faiths",
    sub: "How religious traditions speak about creation and the living world.",
    color: "--plum",
    traditions: [
      { id: "islam", name: "Islam", line: "The natural world as signs", pieceIds: ["ayat", "tafakkur"] },
      { id: "christianity", name: "Christianity", line: "Care for creation", pieceIds: ["canticle", "examen"] },
      { id: "judaism", name: "Judaism", line: "Tu BiShvat, the new year for trees", pieceIds: ["seder-fruits", "shmita"] },
      { id: "hinduism", name: "Hinduism", line: "Sacred rivers and groves", pieceIds: ["sacred-groves", "rivers-edge"] },
      { id: "more", name: "Buddhism, Taoism, Shinto and more", line: "Many traditions, one living world", pieceIds: ["tao-water", "camphor", "metta"] },
    ],
  },
};

export const TOP_PICKS = ["old-cedars", "birdsong", "walden", "first-light"];

export interface Place {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  /** Radius of the pinned area in metres; a whole valley is large. */
  radius: number;
}

export interface Region {
  label: string;
  center: [lng: number, lat: number];
  zoom: number;
  places: Place[];
}

export type RegionId = "near" | "hilo";

export const REGIONS: Record<RegionId, Region> = {
  near: {
    label: "Near me",
    center: [-122.335, 47.625],
    zoom: 11.5,
    places: [
      { id: "lindenwood", name: "Lindenwood Park", kind: "Park", lat: 47.6255, lng: -122.3372, radius: 250 },
      { id: "gull-point", name: "Gull Point Beach", kind: "Beach", lat: 47.662, lng: -122.405, radius: 300 },
      { id: "ridgeback", name: "Ridgeback Trail", kind: "Trail", lat: 47.668, lng: -122.29, radius: 600 },
      { id: "riverside-zoo", name: "Riverside Zoo", kind: "Zoo", lat: 47.6, lng: -122.305, radius: 300 },
      { id: "fernhollow", name: "Fernhollow Eco Lodge", kind: "Eco resort", lat: 47.585, lng: -122.39, radius: 400 },
      { id: "sorrel-valley", name: "Sorrel Valley", kind: "Whole valley", lat: 47.64, lng: -122.25, radius: 3000 },
    ],
  },
  hilo: {
    label: "Trip: Hilo, Hawaiʻi",
    center: [-155.1, 19.715],
    zoom: 12,
    places: [
      { id: "wailuku", name: "Wailuku River", kind: "River", lat: 19.7195, lng: -155.108, radius: 400 },
      { id: "hilo-bay", name: "Hilo Bay", kind: "Beach", lat: 19.728, lng: -155.075, radius: 800 },
      { id: "upland-reserve", name: "Upland forest reserve", kind: "Forest", lat: 19.69, lng: -155.14, radius: 1500 },
    ],
  },
};

export const ALL_PLACES: Place[] = Object.values(REGIONS).flatMap((r) => r.places);

export function piecesAt(placeId: string): Piece[] {
  return [...list, ...uploads.values()].filter((p) => p.placeId === placeId);
}

/** Where the listener is when the browser can't share a location. */
export const SAMPLE_LOCATION = { lat: 47.6232, lng: -122.3335 };
