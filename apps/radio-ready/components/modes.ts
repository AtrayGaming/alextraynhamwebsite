import { Layers3, Zap, MessagesSquare, Users } from "lucide-react";
export const modes = [
  {
    id: "learn",
    name: "Learn",
    description: "One concept. Both sides.",
    icon: Layers3,
    color: "violet",
  },
  {
    id: "match",
    name: "Quick Match",
    description: "Build recall. Clear the set.",
    icon: Zap,
    color: "lime",
  },
  {
    id: "scenario",
    name: "Scenarios",
    description: "Put the idea into context.",
    icon: MessagesSquare,
    color: "peach",
  },
  {
    id: "trainer",
    name: "Trainer Studio",
    description: "Lead a round together.",
    icon: Users,
    color: "blue",
  },
] as const;
