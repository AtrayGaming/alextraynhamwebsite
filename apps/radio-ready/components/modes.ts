import { Layers3, Zap, MessagesSquare, Users } from "lucide-react";
export const modes = [
  {
    id: "learn",
    name: "Learn",
    description: "Flip through the set, one card at a time.",
    icon: Layers3,
    color: "violet",
  },
  {
    id: "match",
    name: "Quick Match",
    description: "Match cues to meanings and clear the set.",
    icon: Zap,
    color: "lime",
  },
  {
    id: "scenario",
    name: "Scenarios",
    description: "Choose the right call in short situations.",
    icon: MessagesSquare,
    color: "peach",
  },
  {
    id: "trainer",
    name: "Trainer Studio",
    description: "Lead a group round with team scoring.",
    icon: Users,
    color: "blue",
  },
] as const;
