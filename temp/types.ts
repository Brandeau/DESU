type fetchedSession = {
  id: string;
  showtime: string;
  formats: any[];
  languages: any[];
  sessionId: string;
};

type fetchedMovie = {
  id: string;
  title: string;
  cinemas: any[];
  isComingSoon: boolean;
};

type fetchedTheatre = {
  ID: string;
  name: string;
  city: string;
};

export async function getShowings(
  cookie: string,
  url: string,
  subKey: string,
): Promise<fetchedSession[]> {
  const response = await fetch(`${url}/api/cache/sessioncache`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": subKey,
      cookie,
    },
  });
  const showings = (await response.json())["sessions"] as fetchedSession[];

  return showings;
}

export async function getMovies(
  cookie: string,
  url: string,
  subKey: string,
): Promise<fetchedMovie[]> {
  const response = await fetch(`${url}/api/cache/moviescache`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": subKey,
      cookie,
    },
  });
  const movies = (await response.json())["movies"] as fetchedMovie[];

  return movies;
}

export async function getTheatres(
  cookie: string,
  url: string,
  subKey: string,
): Promise<fetchedTheatre[]> {
  const response = await fetch(`${url}/api/cache/cinemascache`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": subKey,
      cookie,
    },
  });
  const cinemas = (await response.json())["cinemas"] as fetchedTheatre[];

  return cinemas;
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
