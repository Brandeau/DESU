import fs from "node:fs";

import {
  Cinemark,
  type ParsedCinema,
  type ParsedCinemarkMovie,
  type ParsedShowing,
} from "./cinemark/Cinemark.ts";
import {
  Cineplanet,
  type CineplanetSession,
  type ParsedCineplanetMovie,
} from "./cineplanet/Cineplanet.ts";
import { getCookies } from "./cineplanet/helpers/getCookies.ts";
import { getEnv, processMovies, reduceCineplanetShowings } from "./helpers/parse.ts";

const subKey = getEnv("SUBSCRIPTION_KEY");
const cineplanet = getEnv("CINEPLANET_URL");
const cinemark = getEnv("CINEMARK_URL");
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
    const parsed = await Cineplanet.parseMovies(rawMovies["movies"][i]);

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
  const rawTheatres = await Cinemark.getTheatres(cinemark);
  const theatres: ParsedCinema[] = [];

  for (let i = 0; i < rawTheatres.length; i++) {
    for (let j = 0; j < rawTheatres[i]["cinemas"].length; j++) {
      const parsed = await Cinemark.parseTheatres(rawTheatres[i]["cinemas"][j]);

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
    const rawMovies = await Cinemark.getBillboard(cinemark, cinema_ids[i]);

    const parsed = await Cinemark.parseMovies(rawMovies);

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
    const rawMovies = await Cinemark.getBillboard(cinemark, cinema_ids[i]);

    const parsed = await Cinemark.parseShowings(rawMovies);

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

  await fs.writeFile(
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

  await fs.writeFile(
    "var/data/movies.json",
    JSON.stringify(movies, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );

  const showings = [...cineplanetShowings, ...cinemarkShowings];

  await fs.writeFile(
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
