import { type ParsedCinemarkMovie } from "./cinemark/Cinemark.ts";
import { type Movie, type ParsedMovie } from "./types.ts";

export function reduceMovies(array: ParsedCinemarkMovie[]): ParsedMovie[] {
  const reducedMovies = array.reduce((accumulator, currentMovie) => {
    const existingMovie = accumulator.find((movie) => movie.title === currentMovie.title);
    //const re = /^.+(?=\s\()/;

    if (existingMovie) {
      existingMovie.showings.push(currentMovie.showings);
    } else {
      accumulator.push({
        title: currentMovie.title /*.match(re)[0]*/,
        showings: [currentMovie.showings],
        isComingSoon: currentMovie["isComingSoon"],
      });
    }

    return accumulator;
  }, [] as ParsedMovie[]);

  return reducedMovies;
}

export function reduceCinepolisMovies(array: ParsedMovie[]): ParsedMovie[] {
  const reducedMovies = array.reduce((accumulator, currentMovie) => {
    const existingMovie = accumulator.find((movie) => movie.title === currentMovie.title);
    //const re = /^.+(?=\s\()/;

    if (existingMovie) {
      const showings: {
        cinemaId: string;
        sessions: string[];
      }[] = [];

      showings.push(...existingMovie.showings, ...currentMovie.showings);

      existingMovie.showings = showings;
    } else {
      accumulator.push({
        title: currentMovie.title /*.match(re)[0]*/,
        showings: currentMovie.showings,
        isComingSoon: currentMovie["isComingSoon"],
      });
    }

    return accumulator;
  }, [] as ParsedMovie[]);

  return reducedMovies;
}

export function reduceCinemas(array: ParsedMovie[]): ParsedMovie[] {
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
    } as ParsedMovie;
  });

  return parsed as ParsedMovie[];
}

export function reduceShowings(array: ParsedMovie[]): ParsedMovie[] {
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
    } as ParsedMovie;
  });

  return parsed as ParsedMovie[];
}

export function addId(array: ParsedMovie[]): Movie[] {
  const newArr: Movie[] = [];

  array.forEach((element, index) => {
    newArr.push({
      id: index,
      ...element,
    });
  });

  return newArr;
}

export function processMovies(arr: ParsedCinemarkMovie[]): ParsedMovie[] {
  const reducedMovies = reduceMovies(arr);
  const reducedCinemas = reduceCinemas(reducedMovies);
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

export function getKeyFromValue<T extends Record<PropertyKey, number[]>>(
  value: number,
  obj: T,
): keyof T | "" {
  for (const key in obj) {
    if (obj[key].includes(value)) return key;
  }
  return "";
}

export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  }

  return str;
}

export async function customFetch(...args: Parameters<typeof fetch>): Promise<Response> {
  const response = await fetch(...args);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}}`, {
      cause: {
        headers: Object.fromEntries(response.headers.entries()),
        statusText: response.statusText,
        url: response.url,
        body: truncateString(await response.text(), 100),
      },
    });
  }
  return response;
}
