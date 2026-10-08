import { rmSync } from "node:fs";
// Only generated Worker output; never source, credentials, or database files.
rmSync(".open-next", { recursive: true, force: true });
