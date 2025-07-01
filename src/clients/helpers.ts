import { type ParsedCinemarkMovie } from "./cinemark/Cinemark.ts";
import { type ParsedCineplanetMovie } from "./cineplanet/Cineplanet.ts";
import { type Movie, type ReducedMovie } from "./types.ts";

export async function reduceMovies(
  array: ParsedCinemarkMovie[],
): Promise<ReducedMovie[]> {
  const reducedMovies = array.reduce((accumulator, currentMovie) => {
    const existingMovie = accumulator.find((movie) => movie.title === currentMovie.title);
    //const re = /^.+(?=\s\()/;

    if (existingMovie) {
      existingMovie.showings.push(currentMovie.showings);
    } else {
      accumulator.push({
        source_id: currentMovie.source_id,
        title: currentMovie.title /*.match(re)[0]*/,
        showings: [currentMovie.showings],
        isComingSoon: currentMovie["isComingSoon"],
      });
    }

    return accumulator;
  }, [] as ReducedMovie[]);

  return reducedMovies;
}

export async function reduceCinemas(array: ReducedMovie[]): Promise<ReducedMovie[]> {
  const parsed = array.map((movie) => {
    // For each movie, reduce its cinemas array
    const reducedShowings = movie.showings.reduce(
      (accumulator, currentShowing) => {
        const existingCinemaIndex = accumulator.findIndex(
          (showing) => showing.cinemaId === currentShowing.cinemaId,
        );

        if (existingCinemaIndex > -1) {
          // If cinemaId exists, merge the dates array
          accumulator[existingCinemaIndex].sessions.push(...currentShowing.sessions);
        } else {
          // If cinemaId doesn't exist, add the current cinema entry
          accumulator.push({
            cinemaId: currentShowing.cinemaId,
            // Create a new array for dates to avoid modifying original data
            sessions: [...currentShowing.sessions],
          });
        }

        return accumulator;
      },
      [] as { cinemaId: string; sessions: string[] }[],
    ); // Start with an empty array for the accumulator

    // Return a new movie object with the collapsed cinemas array
    return {
      ...movie, // Spread the original movie properties
      showings: reducedShowings, // Replace the original cinemas array with the collapsed one
    } as ReducedMovie;
  });

  return parsed as ReducedMovie[];
}

export async function reduceCineplanetShowings(
  array: ParsedCineplanetMovie[],
): Promise<ReducedMovie[]> {
  const parsed = array.map((movie) => {
    const reducedShowings = movie.showings.reduce(
      (acc, curr) => {
        const existingCinemaIndex = acc.findIndex(
          (showing) => showing.cinemaId === curr.cinemaId,
        );

        if (existingCinemaIndex > -1) {
          acc[existingCinemaIndex].sessions.push(...curr.sessions);
        } else {
          acc.push({
            cinemaId: curr.cinemaId,
            sessions: curr.sessions,
          });
        }

        return acc;
      },
      [] as { cinemaId: string; sessions: string[] }[],
    );

    return {
      ...movie,
      showings: reducedShowings,
    } as ReducedMovie;
  });

  return parsed as ReducedMovie[];
}

export function addId(array: ReducedMovie[]): Movie[] {
  const newArr: Movie[] = [];

  array.forEach((element, index) => {
    newArr.push({
      id: index,
      ...element,
    });
  });

  return newArr;
}

export async function processMovies(arr: ParsedCinemarkMovie[]): Promise<ReducedMovie[]> {
  const reducedMovies = await reduceMovies(arr);
  const reducedCinemas = await reduceCinemas(reducedMovies);
  //const cinemasWithId = await addId(reducedCinemas);

  return reducedCinemas;
}

export function getEnv(key: string, fallback?: string): string {
  const env = process.env[key] ?? fallback;

  if (env === undefined) {
    throw Error("Env not found");
  }

  return env;
}

export function normalizeTitle(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
