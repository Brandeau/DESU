import { type ParsedCinemarkMovie } from "../cinemark/Cinemark.ts";
import { type ParsedCineplanetMovie } from "../cineplanet/Cineplanet.ts";

type ReducedMovies = {
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

type Movie = {
  id: number;
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export async function reduceMovies(
  array: ParsedCinemarkMovie[],
): Promise<ReducedMovies[]> {
  const reducedMovies = array.reduce((accumulator, currentMovie) => {
    const existingMovie = accumulator.find((movie) => movie.title === currentMovie.title);
    //const re = /^.+(?=\s\()/;

    if (existingMovie) {
      existingMovie.showings.push(currentMovie.showings);
    } else {
      accumulator.push({
        //"id": currentMovie.id,
        title: currentMovie.title /*.match(re)[0]*/,
        showings: [currentMovie.showings],
        isComingSoon: currentMovie["isComingSoon"],
      });
    }

    return accumulator;
  }, [] as ReducedMovies[]);

  return reducedMovies;
}

export async function reduceCinemas(array: ReducedMovies[]): Promise<ReducedMovies[]> {
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
      cinemas: reducedShowings, // Replace the original cinemas array with the collapsed one
    } as ReducedMovies;
  });

  return parsed as ReducedMovies[];
}

export async function reduceCineplanetShowings(
  array: ParsedCineplanetMovie[],
): Promise<ReducedMovies[]> {
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
    } as ReducedMovies;
  });

  return parsed as ReducedMovies[];
}

export async function addId(array: ReducedMovies[]): Promise<Movie[]> {
  const newArr: Movie[] = [];

  array.forEach((element, index) => {
    newArr.push({
      id: index,
      ...element,
    });
  });

  return newArr;
}

export async function processMovies(arr: ParsedCinemarkMovie[]): Promise<Movie[]> {
  const reducedMovies = await reduceMovies(arr);
  const reducedCinemas = await reduceCinemas(reducedMovies);
  const cinemasWithId = await addId(reducedCinemas);

  return cinemasWithId;
}
