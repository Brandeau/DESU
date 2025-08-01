import fs from "node:fs";
import { inspect } from "node:util";

import { type ParsedShowing } from "../clients/cinemark/Cinemark.ts";
import {
  type Movie,
  type MovieResult,
  type ParsedCinema,
  type Sessions,
  type Showing,
} from "../clients/types.ts";

function fetchMovies(): Movie[] {
  try {
    const data = fs.readFileSync("./var/data/movies.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading movies", error);
  }
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
    throw Error("No movies with that name", error);
  }
}

function fetchShowings(): ParsedShowing[] {
  try {
    const data = fs.readFileSync("./var/data/showings.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading showings", error);
  }
}
function fetchTheatres(): ParsedCinema[] {
  try {
    const data = fs.readFileSync("./var/data/theatres.json", "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw Error("Error loading theatres", error);
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
