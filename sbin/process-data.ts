import fs from "node:fs";

import {
  Cinemark,
  type ParsedCinemarkMovie,
  type ParsedShowing,
} from "../src/clients/cinemark/Cinemark.ts";
import {
  Cineplanet,
  type CineplanetSession,
  type ParsedCineplanetMovie,
} from "../src/clients/cineplanet/Cineplanet.ts";
import { getCookies } from "../src/clients/cineplanet/getCookies.ts";
import {
  addId,
  getEnv,
  processMovies,
  reduceCineplanetShowings,
} from "../src/clients/helpers.ts";
import { type ParsedCinema } from "../src/clients/types.ts";

const subKey = getEnv("SUBSCRIPTION_KEY");
const cineplanet = getEnv("CINEPLANET_URL");
const cookie = await getCookies(cineplanet);

async function fetchTheatresFromCineplanet() {
  const rawTheatres = await Cineplanet.getTheatres(cookie, cineplanet, subKey);
  const theatres: {
    id: string;
    name: string;
    city: string;
    chain: number;
  }[] = [];

  for (let i = 0; i < rawTheatres["cinemas"].length; i++) {
    const parsed = Cineplanet.parseTheatres(rawTheatres["cinemas"][i]);

    theatres.push(parsed);
  }

  return theatres;
}

async function fetchMoviesFromCineplanet() {
  const rawMovies = await Cineplanet.getMovies(cookie, cineplanet, subKey);
  const movies: ParsedCineplanetMovie[] = [];

  for (let i = 0; i < rawMovies["movies"].length; i++) {
    const parsed = Cineplanet.parseMovies(rawMovies["movies"][i]);

    movies.push(parsed);
  }

  const reducedMovies = await reduceCineplanetShowings(movies);

  return reducedMovies;
}

async function fetchShowingsFromCineplanet() {
  const rawShowings = await Cineplanet.getShowings(cookie, cineplanet, subKey);
  const showings: CineplanetSession[] = [];

  for (let i = 0; i < rawShowings["sessions"].length; i++) {
    showings.push(rawShowings["sessions"][i]);
  }

  return showings;
}

async function fetchTheatresFromCinemark() {
  const rawTheatres = await Cinemark.getTheatres();
  const theatres: ParsedCinema[] = [];

  for (let i = 0; i < rawTheatres.length; i++) {
    for (let j = 0; j < rawTheatres[i]["cinemas"].length; j++) {
      const parsed = Cinemark.parseTheatres(rawTheatres[i]["cinemas"][j]);

      theatres.push(parsed);
    }
  }

  return theatres;
}

async function fetchMoviesFromCinemark() {
  const cinema_ids = [
    2305, 2302, 2306, 2308, 520, 2309, 2301, 2304, 2303, 2300, 517, 2307, 511, 512, 513,
    519, 572, 548, 514, 570,
  ];
  const movies: ParsedCinemarkMovie[][] = [];

  for (let i = 0; i < cinema_ids.length; i++) {
    const rawMovies = await Cinemark.getBillboard(cinema_ids[i]);

    const parsed = Cinemark.parseMovies(rawMovies);

    movies.push(parsed);
  }
  const reducedMovies = await processMovies(movies.flat());

  return reducedMovies;
}

async function fetchShowingsFromCinemark() {
  const cinema_ids = [
    2305, 2302, 2306, 2308, 520, 2309, 2301, 2304, 2303, 2300, 517, 2307, 511, 512, 513,
    519, 572, 548, 514, 570,
  ];
  const showings: ParsedShowing[][] = [];

  for (let i = 0; i < cinema_ids.length; i++) {
    const rawMovies = await Cinemark.getBillboard(cinema_ids[i]);

    const parsed = Cinemark.parseShowings(rawMovies);

    showings.push(parsed);
  }

  return showings;
}

async function handler() {
  const cinemarkTheatres = await fetchTheatresFromCinemark();
  const cineplanetTheatres = await fetchTheatresFromCineplanet();
  const cinemarkMovies = await fetchMoviesFromCinemark();
  const cineplanetMovies = await fetchMoviesFromCineplanet();
  const cinemarkShowings = await fetchShowingsFromCinemark();
  const cineplanetShowings = await fetchShowingsFromCineplanet();

  const theatres = [...cineplanetTheatres, ...cinemarkTheatres];

  fs.writeFile(
    "var/data/theatres.json",
    JSON.stringify(theatres, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );

  const movies = [...cineplanetMovies, ...cinemarkMovies];
  const moviesWithId = addId(movies);

  fs.writeFile(
    "var/data/movies.json",
    JSON.stringify(moviesWithId, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );

  const showings = [...cineplanetShowings, ...cinemarkShowings.flat()];

  fs.writeFile(
    "var/data/showings.json",
    JSON.stringify(showings, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );
}

handler();
