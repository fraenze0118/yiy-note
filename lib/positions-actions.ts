"use server";

import { savePositions } from "./positions";
import type { PositionMap } from "./positions";

export async function persistPositions(
  domainKey: string,
  positions: PositionMap
) {
  await savePositions(domainKey, positions);
}
