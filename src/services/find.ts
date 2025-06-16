import { type Movie } from "../clients/cinemark/fetchData.ts";

async function getMovies(): Promise<Movie[]> {
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
