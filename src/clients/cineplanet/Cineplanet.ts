type CineplanetTheatre = {
  ID: string;
  name: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  secondAddress: string;
  city: string;
  latitude: string;
  longitude: string;
  description: string;
  showroomQuantity: number;
  formattedCinemaName: string;
  services: {
    name: string;
    icon: string;
    description: string;
  }[];
  formatsRate: {
    name: string;
    rates: {
      type: number;
      generalRate: number;
      specialRate: number;
    }[];
  }[];
  formats: string[];
  img: string;
  loyaltyCode: string;
};

type CineplanetTheatres = {
  cinemas: CineplanetTheatre[];
};

type CineplanetMovie = {
  id: string;
  cast: {
    cast: unknown[];
  };
  director: string;
  formats: string[];
  gallery: unknown;
  isComingSoon: boolean;
  OpeningDate: string;
  restricted: boolean;
  genre: string;
  isNewRelease: boolean;
  isPreSale: boolean;
  isRePremiere: boolean;
  isRemake: boolean;
  festival: string;
  languages: string[];
  posterUrl: string;
  ratingDescription: string;
  runTime: number;
  synopsis: string;
  thumbnailUrl: string[];
  title: string;
  trailer: string;
  cinemas: {
    cinemaId: string;
    dates: {
      date: string;
      sessions: string[];
    }[];
  }[];
  movieDetailsUrl: string;
};

type CineplanetBillboard = {
  idMoviesBookingRestricted: unknown;
  movies: CineplanetMovie[];
};

type CineplanetSession = {
  id: string;
  showtime: string;
  formats: string[];
  languages: string[];
  sessionId: string;
};

type CineplanetSessions = {
  sessions: CineplanetSession[];
};

export type ParsedCineplanetMovie = {
  id: string;
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export class Cineplanet {
  static async getTheatres(
    cookie: string,
    url: string,
    subKey: string,
  ): Promise<CineplanetTheatres> {
    const response = await fetch(`${url}/api/cache/cinemascache`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": subKey,
        cookie,
      },
    });
    const cinemas = (await response.json()) as CineplanetTheatres;

    return cinemas;
  }

  static async getMovies(
    cookie: string,
    url: string,
    subKey: string,
  ): Promise<CineplanetBillboard> {
    const response = await fetch(`${url}/api/cache/moviescache`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": subKey,
        cookie,
      },
    });
    const movies = (await response.json()) as CineplanetBillboard;

    return movies;
  }

  static async getShowings(
    cookie: string,
    url: string,
    subKey: string,
  ): Promise<CineplanetSessions> {
    const response = await fetch(`${url}/api/cache/sessioncache`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": subKey,
        cookie,
      },
    });
    const showings = (await response.json()) as CineplanetSessions;

    return showings;
  }

  static parseTheatres(obj: CineplanetTheatre) {
    return {
      id: obj["ID"],
      name: obj["name"],
      city: obj["city"],
      chain: 1,
    };
  }

  static parseMovies(obj: CineplanetMovie): ParsedCineplanetMovie {
    const showings = [];

    obj["cinemas"].forEach((cinema) => {
      cinema["dates"]?.forEach((date) => {
        date["sessions"]?.forEach((session) => {
          showings.push({
            sessions: session,
            cinemaId: cinema["cinemaId"],
          });
        });
      });
    });

    return {
      id: obj["id"],
      title: obj["title"],
      showings: showings,
      isComingSoon: obj["isComingSoon"],
    } as ParsedCineplanetMovie;
  }
}
