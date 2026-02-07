export const EXCLUDED_BUILDING_IDS = new Set(["1926", "53"]);

// Fallback name match in case IDs change between datasets.
const EXCLUDED_NAME_SUBSTRINGS = ["hoop greenhouse", "mcpherson"];

export function isExcludedBuildingId(buildingId: string | number | null | undefined) {
  if (buildingId === null || buildingId === undefined) return false;
  return EXCLUDED_BUILDING_IDS.has(String(buildingId));
}

export function isExcludedBuilding(b: {
  building_id: string | number;
  building_name?: string | null;
}) {
  if (isExcludedBuildingId(b.building_id)) return true;

  const name = (b.building_name || "").toLowerCase();
  return EXCLUDED_NAME_SUBSTRINGS.some((s) => name.includes(s));
}
