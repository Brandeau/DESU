import fs from "node:fs";

import { type Movie } from "../clients/helpers/parse.ts";

type Showings = {
  cinemaId: string;
  sessions: string[];
}[];

function fetchMovies(): Movie[] {
  try {
    const data = fs.readFileSync("./var/data/movies.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading movies", error);
  }
}

function filterMovies(title: string): Movie[] {
  const movies = fetchMovies();
  try {
    const movie = movies.filter((movie) =>
      movie.title.toLowerCase().includes(title.toLowerCase()),
    );

    return movie;
  } catch (error) {
    throw Error("No movies with that name", error);
  }
}

function showShowings(title: string): Showings {
  const movies = filterMovies(title);

  const showings: Showings[] = [];

  movies.forEach((movie) => showings.push(movie.showings));

  return showings.flat();
}

console.log(showShowings("Bailar"));
