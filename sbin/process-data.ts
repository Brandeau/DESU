import fs from "node:fs";

import {
  Cinemark,
  type ParsedCinemarkMovie,
  type ParsedShowing,
} from "../src/clients/cinemark/Cinemark.ts";
import {
  Cineplanet,
  type ParsedCineplanetMovie,
} from "../src/clients/cineplanet/Cineplanet.ts";
import { Cinepolis } from "../src/clients/cinepolis/Cinepolis.ts";
import {
  addId,
  processMovies,
  reduceCinemas,
  reduceCinepolisMovies,
  reduceMovies,
  reduceShowings,
} from "../src/clients/helpers.ts";
import { type ParsedCinema, type ParsedMovie } from "../src/clients/types.ts";

const cineplanet = await Cineplanet.init();
const cinepolis = await Cinepolis.init();

async function fetchTheatresFromCineplanet() {
  const rawTheatres = await cineplanet.getTheatres();
  const theatres: {
    id: string;
    name: string;
    city: string;
  }[] = [];

  for (let i = 0; i < rawTheatres["cinemas"].length; i++) {
    const parsed = Cineplanet.parseTheatres(rawTheatres["cinemas"][i]);

    theatres.push(parsed);
  }

  return theatres;
}

async function fetchMoviesFromCineplanet() {
  const rawMovies = await cineplanet.getMovies();
  const movies: ParsedCineplanetMovie[] = [];

  for (let i = 0; i < rawMovies["movies"].length; i++) {
    const parsed = Cineplanet.parseMovies(rawMovies["movies"][i]);

    movies.push(parsed);
  }

  const reducedMovies = await reduceShowings(movies);

  return reducedMovies;
}

async function fetchShowingsFromCineplanet() {
  const rawShowings = await cineplanet.getShowings();
  const showings: ParsedShowing[] = [];

  for (let i = 0; i < rawShowings["sessions"].length; i++) {
    const raw = rawShowings["sessions"][i];
    const parsed = Cineplanet.parseShowings(raw);
    showings.push(parsed);
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
  const reducedMovies = processMovies(movies.flat());

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

async function fetchTheatresFromCinepolis() {
  const rawTheatres = await cinepolis.getTheatres();

  const parsed = Cinepolis.parseTheatres(rawTheatres);

  return parsed;
}

async function fetchMoviesFromCinepolis() {
  const movies: ParsedMovie[] = [];

  const rawMovies = cinepolis.movies.flat();

  rawMovies.forEach((rawMovie) => {
    rawMovie.Dates.forEach((date) => {
      date.Movies.forEach((movie) => {
        const parsed = Cinepolis.parseMovies(movie);
        movies.push(parsed);
      });
    });
  });

  const reducedShowings = reduceShowings(movies);
  const reducedMovies = reduceCinepolisMovies(reducedShowings);
  const reducedAgain = reduceShowings(reducedMovies);

  return reducedAgain;
}

async function fetchShowingsFromCinepolis() {
  const showings: ParsedShowing[][] = [];

  const rawMovies = cinepolis.movies.flat();

  rawMovies.forEach((rawMovie) => {
    rawMovie.Dates.forEach((date) => {
      const parsed = Cinepolis.parseShowings(date);

      showings.push(parsed);
    });
  });

  return showings;
}

async function consolidateData() {
  const cinemarkTheatres = await fetchTheatresFromCinemark();
  const cineplanetTheatres = await fetchTheatresFromCineplanet();
  const cinepolisTheatres = await fetchTheatresFromCinepolis();
  const cinemarkMovies = await fetchMoviesFromCinemark();
  const cineplanetMovies = await fetchMoviesFromCineplanet();
  const cinepolisMovies = await fetchMoviesFromCinepolis();
  const cinemarkShowings = await fetchShowingsFromCinemark();
  const cineplanetShowings = await fetchShowingsFromCineplanet();
  const cinepolisShowings = await fetchShowingsFromCinepolis();

  const theatres = [...cineplanetTheatres, ...cinemarkTheatres, ...cinepolisTheatres];
  const moviesWithoutId = [...cineplanetMovies, ...cinemarkMovies, ...cinepolisMovies];
  const movies = addId(moviesWithoutId);
  const showings = [
    ...cineplanetShowings,
    ...cinemarkShowings.flat(),
    ...cinepolisShowings.flat(),
  ];

  return { theatres, movies, showings };
}

export async function write(basePath: string) {
  const data = await consolidateData();
  fs.writeFile(
    `${basePath}/theatres.json`,
    JSON.stringify(data.theatres, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );

  fs.writeFile(
    `${basePath}/movies.json`,
    JSON.stringify(data.movies, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );

  fs.writeFile(
    `${basePath}/showings.json`,
    JSON.stringify(data.showings, null, 2),
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
