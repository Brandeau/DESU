import fs from "node:fs";
import path from "node:path";

import { type ReducedMovie } from "../clients/helpers/parse.ts";

function fetchMovies() {
  try {
    const data = fs.readFileSync("./var/data/movies.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading movies", error);
  }
}

function filterMovies(title: string) {
  const movies = fetchMovies();
  try {
    const movie = movies.filter((movie) => movie.title === title);

    return movie;
  } catch (error) {
    throw Error("No movies with that name", error);
  }
}
