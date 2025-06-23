import fs from "node:fs";
import { inspect } from "node:util";

import { ParsedShowing } from "../clients/cinemark/Cinemark.ts";
import { type Movie, type ParsedCinema, type Showing } from "../clients/types.ts";

function fetchMovies(): Movie[] {
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
    const movie = movies.filter((movie) =>
      movie.title.toLowerCase().includes(title.toLowerCase()),
    );

    return movie;
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
    throw Error("Showings not found");
  }

  const { id, ...rest } = match;

  return rest;
}

function replaceCinemaIdWithName(showing: Showing) {
  const theatre = getCinemaNameById(showing.cinemaId);

  const { cinemaId, ...rest } = showing;
  const sessions = rest.sessions.map((e) => getShowingById(e));

  return {
    cinema: theatre,
    showings: sessions,
  };
}

function expandMovies(movies: Movie[]) {
  const a = movies.forEach((movie) => {
    movie.showings.forEach((showing) => {
      replaceCinemaIdWithName(showing);
    });
  });

  return a;
}

/* const bailarina = [
  {
    id: 1,
    source_id: "HO00001486",
    title: "BAILARINA",
    showings: [
      {
        cinemaId: "0000000004",
        sessions: ["0000000004-121304", "0000000004-121217", "0000000004-121278"],
      },
      {
        cinemaId: "0000000007",
        sessions: [
          "0000000007-126755",
          "0000000007-126656",
          "0000000007-126752",
          "0000000007-126754",
        ],
      },
    ],
    isComingSoon: false,
  },
  {
    id: 38,
    source_id: "368593",
    title: "BAILARINA",
    showings: [
      {
        cinemaId: "511",
        sessions: [
          "249391",
          "249405",
          "249225",
          "249395",
          "249415",
          "249274",
          "249399",
          "249414",
          "249322",
        ],
      },
      {
        cinemaId: "512",
        sessions: ["256013", "256014", "256068", "256069", "256123", "256124"],
      },
      { cinemaId: "548", sessions: ["193802", "193845", "193888"] },
    ],
    isComingSoon: true,
  },
]; */

/* console.log(inspect(expandMovies(bailarina), { depth: 11, colors: true }));
console.log(
  replaceCinemaIdWithName({
    cinemaId: "0000000004",
    sessions: ["0000000004-121304", "0000000004-121217", "0000000004-121278"],
  }),
); */
