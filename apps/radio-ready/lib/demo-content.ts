import type { Item } from "./types";
// Newly authored fictional community-festival content. No operational source was imported.
const groups: Record<string, [string, string][]> = {
  "Creative studio": [
    ["FERN", "Paper folding"],
    ["MOSS", "Clay modeling"],
    ["INK", "Stamp printing"],
    ["LOOM", "Ribbon weaving"],
    ["PAPER", "Postcard making"],
    ["BEAD", "Bracelet making"],
    ["BRUSH", "Watercolor painting"],
    ["CHALK", "Pavement drawing"],
    ["THREAD", "Fabric collage"],
  ],
  Performance: [
    ["KITE", "Acoustic music"],
    ["CHIME", "Bell ensemble"],
    ["VERSE", "Poetry reading"],
    ["BEAT", "Drum circle"],
    ["TALE", "Storytelling"],
    ["MIME", "Silent comedy"],
    ["TUNE", "Songwriting"],
    ["STEP", "Dance showcase"],
    ["ECHO", "Vocal harmony"],
  ],
  Gallery: [
    ["REED", "Sketch exhibition"],
    ["FRAME", "Portrait display"],
    ["LENS", "Photo collection"],
    ["SHAPE", "Sculpture display"],
    ["PRINT", "Poster gallery"],
    ["TILE", "Mosaic display"],
    ["LINE", "Illustration wall"],
    ["PAGE", "Artist book display"],
    ["MODEL", "Miniature exhibition"],
  ],
  "Garden activities": [
    ["SEED", "Seed art"],
    ["LEAF", "Leaf rubbing"],
    ["PETAL", "Paper flowers"],
    ["ROOT", "Planter painting"],
    ["GROVE", "Nature journaling"],
    ["BLOOM", "Flower sketching"],
    ["MINT", "Scent matching"],
    ["TWIG", "Stick sculptures"],
    ["MEADOW", "Landscape drawing"],
  ],
  "Atmosphere design": [
    ["DRIZZLE", "Rain soundscape"],
    ["BREEZE", "Ribbon installation"],
    ["CLOUD", "Cloud projection"],
    ["SUNBEAM", "Light pattern"],
    ["FROST", "Ice-inspired texture"],
    ["MIST", "Soft-focus backdrop"],
    ["RAINBOW", "Color spectrum"],
    ["DEW", "Glass bead display"],
    ["SNOW", "Paper snowflakes"],
  ],
};
export const demoItems: Item[] = Object.entries(groups).flatMap(
  ([category, pairs]) =>
    pairs.map(([cue, meaning]) => ({
      id: `demo-${cue.toLowerCase()}`,
      revision: 1,
      category,
      cue: `DEMO–${cue}`,
      meaning,
      scenario: `At the fictional community festival, someone asks for the ${meaning.toLowerCase()} activity. What does this label represent?`,
      explanation: `In this fictional set, DEMO–${cue} labels ${meaning.toLowerCase()}. It has no operational or safety meaning.`,
      kind: "term",
      classification: "fictional",
    })),
);
const scenarios: [string, string, string, string[]][] = [
  [
    "A visitor wants to fold a paper animal. Which activity would you suggest?",
    "Paper folding",
    "Match the activity to what the visitor wants to make.",
    ["Paper folding", "Clay modeling", "Ribbon weaving", "Portrait display"],
  ],
  [
    "A visitor prefers listening to a story over joining a hands-on activity. What fits?",
    "Storytelling",
    "Use the visitor’s stated preference to narrow the choice.",
    ["Storytelling", "Bracelet making", "Planter painting", "Mosaic display"],
  ],
  [
    "A group wants to create something together using rhythm. Which activity fits?",
    "Drum circle",
    "A shared rhythm activity matches the group’s goal.",
    [
      "Drum circle",
      "Photo collection",
      "Artist book display",
      "Flower sketching",
    ],
  ],
  [
    "A visitor wants to see tiny constructed worlds. Which display fits?",
    "Miniature exhibition",
    "The key detail is the small scale of the work.",
    [
      "Miniature exhibition",
      "Vocal harmony",
      "Stamp printing",
      "Light pattern",
    ],
  ],
  [
    "A designer wants the impression of a rainy afternoon using audio. Which element fits?",
    "Rain soundscape",
    "This is a fictional creative design choice, not a weather alert or response procedure.",
    ["Rain soundscape", "Color spectrum", "Paper flowers", "Sculpture display"],
  ],
  [
    "A visitor wants a handmade card they can send to a friend. What fits?",
    "Postcard making",
    "Connect the desired outcome with the activity.",
    [
      "Postcard making",
      "Poetry reading",
      "Silent comedy",
      "Ribbon installation",
    ],
  ],
  [
    "Someone wants to draw plants and record observations in a notebook. What fits?",
    "Nature journaling",
    "Both drawing and observation are central to this activity.",
    ["Nature journaling", "Bell ensemble", "Fabric collage", "Poster gallery"],
  ],
  [
    "A designer wants hanging fabric to suggest moving air. Which element fits?",
    "Ribbon installation",
    "The material and motion point to the ribbon installation. This is a creative exercise only.",
    [
      "Ribbon installation",
      "Glass bead display",
      "Leaf rubbing",
      "Photo collection",
    ],
  ],
];
export const scenarioItems: Item[] = scenarios.map(
  ([scenario, meaning, explanation, choices], i) => ({
    id: `scene-${i + 1}`,
    revision: 1,
    category: "Visitor choices",
    cue: `Situation ${String(i + 1).padStart(2, "0")}`,
    meaning,
    scenario,
    explanation,
    choices,
    kind: "scenario",
    classification: "fictional",
  }),
);
export const allDemoItems = [...demoItems, ...scenarioItems];
