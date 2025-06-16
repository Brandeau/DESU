import { type Movie } from "../clients/cinemark/fetchData.ts";

async function fetchMovies(): Promise<Movie[]> {
  try {
    const response = await fetch("../../var/data/movies.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    return data as Movie[];
  } catch (error) {
    throw Error("Error loading movies", error);
  }
}

async function filterMovies(title: string): Promise<Movie[]> {
  const movies = await fetchMovies();
  try {
    const movie = movies.filter((movie) => movie.title === title);

    return movie;
  } catch (error) {
    throw Error("No movies with that name", error);
  }
}

console.log(filterMovies("BAILARINA"));
