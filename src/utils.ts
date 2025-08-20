import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import os from "os";

import packageJson from "../package.json" with { type: "json" };

const array: number[] = [];
const characterCodeCache: number[] = [];

//Similarity algorithm between two strings that returns a percentage
export default function levenshtein(first: string, second: string) {
  if (first === second) {
    return 0;
  }

  const swap = first;

  if (first.length > second.length) {
    first = second;
    second = swap;
  }

  let firstLength = first.length;
  let secondLength = second.length;
  const maxLength = second.length;

  if (firstLength === 0) {
    return secondLength;
  }

  let bCharacterCode;
  let result;
  let temporary;
  let temporary2;
  let index = 0;
  let index2 = 0;

  while (index < firstLength) {
    characterCodeCache[index] = first.charCodeAt(index);
    array[index] = ++index;
  }

  while (index2 < secondLength) {
    bCharacterCode = second.charCodeAt(index2);
    temporary = index2++;
    result = index2;

    for (index = 0; index < firstLength; index++) {
      temporary2 =
        bCharacterCode === characterCodeCache[index] ? temporary : temporary + 1;
      temporary = array[index];

      result = array[index] =
        temporary > result
          ? temporary2 > result
            ? result + 1
            : temporary2
          : temporary2 > temporary
            ? temporary + 1
            : temporary2;
    }
  }
  const per = (1 - result / maxLength) * 100;
  return per;
}

/**
 * Checks whether data should be populated.
 *
 * @returns `true if data was populated more than a week ago, if it is Thursday and
 *          has not been populated today, or if paths don't exist; false any other
 *          case`
 */
export function shouldPopulate(): boolean {
  const now = new Date();
  const nowMs = now.getTime();
  const folder = buildPath();
  /**
   * The period of a standard week in milliseconds.
   */
  const weekMs = 604800000;

  const paths = ["theatres.json", "movies.json", "showings.json"].map((file) =>
    path.join(folder, file),
  );

  const hasAtLeastOneMissingFile = paths
    .map((path) => existsSync(path))
    .some((elem) => elem === false);

  if (hasAtLeastOneMissingFile) return true;

  const modifiedTimesMs = paths.map((path) => statSync(path)).map((stat) => stat.mtimeMs);
  const oldestModifiedtimeMs = Math.min(...modifiedTimesMs);
  const timeElapsedSinceLastPopulatedMs = nowMs - oldestModifiedtimeMs;

  if (timeElapsedSinceLastPopulatedMs > weekMs) {
    return true;
  }

  const nowUTC = now.toUTCString();
  const nowTimestamp = now.toISOString().split("T")[0];
  const modifiedTimestamp = new Date(oldestModifiedtimeMs).toISOString().split("T")[0];

  if (nowUTC.startsWith("Thu") && modifiedTimestamp !== nowTimestamp) {
    return true;
  }

  return false;
}

/**
 * Builds correct path for either MacOS or Windows OS.
 */
export function buildPath(): string {
  const oper = os.platform();
  const home = os.homedir();

  const directory = process.env.XDG_DATA_HOME
    ? path.join(process.env.XDG_DATA_HOME, `${packageJson.name}`)
    : oper.startsWith("win")
      ? path.join(process.env.APPDATA!, `${packageJson.name}`)
      : path.join(home, ".config", `${packageJson.name}`);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
  return directory;
}

export function getPackageJsonVersion() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packagePath = path.resolve(__dirname, "..", "package.json");
  const packageData = JSON.parse(readFileSync(packagePath, "utf8"));

  if (Object.keys(packageData).includes("version")) {
    return packageData.version;
  }

  throw Error('Error: "version" key not found in package.json.');
}
