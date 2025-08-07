import { existsSync, mkdirSync } from "node:fs";

import os from "os";

import { write } from "../sbin/process-data.ts";

const array: number[] = [];
const characterCodeCache: number[] = [];

//Similarity algorithm between two strings that returns a percentage
export default function levenshtein(first, second) {
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

export function populateData() {
  const oper = os.platform();
  const home = os.homedir();
  let path = "";

  if (oper.startsWith("win")) {
    path = `${home}/.local/var/desu`;
  } else if (oper.startsWith("dar")) {
    path = `${home}/Local/AppData`;
  }

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  write(path);
}
