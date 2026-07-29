const cityVisibleOptionLimit = 160;
let countryOptionsCache: string[] | null = null;
let stateOptionsCache: string[] | null = null;
let cityOptionsCache: string[] | null = null;
let locationModulePromise: Promise<typeof import("country-state-city")> | null =
  null;

export interface PincodeLocation {
  city: string;
  country: string;
  state: string;
}

const pincodeLocationMap: Record<string, PincodeLocation> = {
  "110001": { city: "New Delhi", country: "India", state: "Delhi" },
  "302018": { city: "Jaipur", country: "India", state: "Rajasthan" },
  "380015": { city: "Ahmedabad", country: "India", state: "Gujarat" },
  "380051": { city: "Ahmedabad", country: "India", state: "Gujarat" },
  "382110": { city: "Sanand", country: "India", state: "Gujarat" },
  "382213": { city: "Ahmedabad", country: "India", state: "Gujarat" },
  "382405": { city: "Ahmedabad", country: "India", state: "Gujarat" },
  "394185": { city: "Surat", country: "India", state: "Gujarat" },
  "395002": { city: "Surat", country: "India", state: "Gujarat" },
  "400051": { city: "Mumbai", country: "India", state: "Maharashtra" },
  "700091": { city: "Kolkata", country: "India", state: "West Bengal" },
};

function sortUniqueOptions(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((first, second) => first.localeCompare(second));
}

function loadLocationModule() {
  locationModulePromise ??= import("country-state-city");

  return locationModulePromise;
}

export async function loadLocationCountryOptions() {
  countryOptionsCache ??= sortUniqueOptions(
    (await loadLocationModule()).Country.getAllCountries().map(
      (country) => country.name,
    ),
  );

  return countryOptionsCache;
}

export async function loadLocationStateOptions() {
  stateOptionsCache ??= sortUniqueOptions(
    (await loadLocationModule()).State.getAllStates().map((state) => state.name),
  );

  return stateOptionsCache;
}

export async function loadLocationCityOptions() {
  cityOptionsCache ??= sortUniqueOptions(
    (await loadLocationModule()).City.getAllCities().map((city) => city.name),
  );

  return cityOptionsCache;
}

export function getLocationByPincode(pincode: string) {
  return pincodeLocationMap[pincode.trim()] ?? null;
}

export const locationSearchVisibleOptionLimit = cityVisibleOptionLimit;
