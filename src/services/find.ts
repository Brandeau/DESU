import fs from "node:fs";
import path from "node:path";
import { inspect } from "node:util";

import { type ParsedShowing } from "../clients/cinemark/Cinemark.ts";
import {
  type Movie,
  type MovieResult,
  type ParsedCinema,
  type Sessions,
  type Showing,
} from "../clients/types.ts";
import { buildPath } from "../utils.ts";

export function fetchMovies(): Movie[] {
  const directory = buildPath();
  const filePath = path.join(directory, "movies.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading movies", { cause: error });
  }
}

export function fetchMovieTitles(): string[] {
  const data: Movie[] = fetchMovies();

  const titles = data.map((movie) => {
    return movie.title;
  });

  const parsed = titles.reduce((accumulator, current) => {
    if (!accumulator.includes(current)) {
      accumulator.push(current);
    }

    return accumulator;
  }, [] as string[]);

  return parsed;
}

export function searchMovieByTitle(title: string) {
  const movies = fetchMovies();
  try {
    const movie = movies.filter((movie) =>
      movie.title.toLowerCase().includes(title.toLowerCase()),
    );

    const fullMovie = replaceAllShowings(movie);

    return fullMovie;
  } catch (error) {
    throw Error("No movies with that name", { cause: error });
  }
}

function fetchShowings(): ParsedShowing[] {
  const directory = buildPath();
  const filePath = path.join(directory, "showings.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading showings", { cause: error });
  }
}
function fetchTheatres(): ParsedCinema[] {
  const directory = buildPath();
  const filePath = path.join(directory, "theatres.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading theatres", { cause: error });
  }
}

function getCinemaNameById(id: string): string {
  const theatres = fetchTheatres();

  const match = theatres.find((theatre) => theatre.id === id);

  if (!match) {
    throw Error("Theatre not found");
  }

  return match.name;
}

function getShowingById(showingId: string) {
  const showings = fetchShowings();

  const match = showings.find((showing) => showing.id === showingId);

  if (!match) {
    return null;
  }

  const { id, ...rest } = match;

  return rest;
}

function replaceCinemaIdWithName(showing: Showing) {
  const theatre = getCinemaNameById(showing.cinemaId);

  const { cinemaId, ...rest } = showing;
  const sessions: Sessions = rest.sessions.map((e) => getShowingById(e));

  return {
    cinema: theatre,
    sessions: sessions,
  };
}

function replaceAllShowings(movies: Movie[]) {
  const arr: MovieResult[][] = [];

  movies.forEach((movie) => {
    const mappedShowings = movie.showings.map((showing) =>
      replaceCinemaIdWithName(showing),
    );

    arr.push(mappedShowings);
  });

  return arr;
}
