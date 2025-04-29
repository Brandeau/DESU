import { levenshtein } from "./levenshtein.ts";

export function percentageLevenshtein(string1: string, string2: string): number{
    const distance = levenshtein(string1, string2);
    const bigger = string1.length > string2.length? string1.length : string2.length;
    const percentage = (bigger - distance) / bigger;

    return percentage * 100;
}