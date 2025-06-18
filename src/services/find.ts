import fs from "node:fs";

import { type Movie, type ParsedCinema, type Showing } from "../clients/types.ts";

async function fetchMovies(): Promise<Movie[]> {
  try {
    const data = fs.readFileSync("./var/data/movies.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading movies", error);
  }
}

async function filterMovies(title: string): Promise<Movie[]> {
  const movies = await fetchMovies();
  try {
    const movie = movies.filter((movie) =>
      movie.title.toLowerCase().includes(title.toLowerCase()),
    );

    return movie;
  } catch (error) {
    throw Error("No movies with that name", error);
  }
}

async function fetchShowings(title: string): Promise<Showing[]> {
  const movies = await filterMovies(title);

  const showings: Showing[][] = [];

  movies.forEach((movie) => showings.push(movie.showings));

  return showings.flat();
}

async function fetchTheatres(): Promise<ParsedCinema[]> {
  try {
    const data = fs.readFileSync("./var/data/theatres.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading theatres", error);
  }
}

async function matchIdToName(id: string): Promise<string> {
  const theatres = await fetchTheatres();

  const match = theatres.find((theatre) => theatre.id === id);

  if (!match) {
    throw Error("Theatre not found");
  }

  return match.name;
}

console.log(await filterMovies("bailar"));
