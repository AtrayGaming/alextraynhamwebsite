export type Mode = "learn" | "match" | "scenario" | "trainer";
export type Role = "trainee" | "trainer" | "admin";
export type Item = {
  id: string;
  revision: number;
  category: string;
  cue: string;
  meaning: string;
  explanation: string;
  scenario: string;
  choices?: string[];
  kind: "term" | "scenario";
  classification: "fictional";
};
export type Attempt = {
  itemId: string;
  revision: number;
  correct: boolean;
  at: string;
};
export type Practice = {
  id: string;
  mode: Mode;
  category: string;
  items: Item[];
  queue: string[];
  cleared: string[];
  attempts: Attempt[];
  status: "active" | "completed";
  revision: number;
  startedAt: string;
  updatedAt: string;
  teams: { name: string; score: number }[];
};
export type Feedback = { item: Item; answer: string; correct: boolean };
export type Viewer = { id: string; name: string; role: Role };
