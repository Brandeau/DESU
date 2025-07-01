import { CINEMA_CHAIN } from "../../constants.ts";
import { normalizeTitle } from "../helpers.ts";
import { getEnv } from "../helpers.ts";
import { type ParsedCinema } from "../types.ts";

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

export type CineplanetSession = {
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
  source_id: string;
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export class Cineplanet {
  static url: string = getEnv("CINEPLANET_URL");

  private constructor(readonly cookie: string) {}

  static async init() {
    const cookie = await this.getCookies(this.url);

    return new Cineplanet(cookie);
  }

  static async getCookies(url: string): Promise<string> {
    const response = await fetch(url);
    const cookie = response.headers.getSetCookie()[0].split(";")[0];

    return cookie;
  }
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

  static parseTheatres(obj: CineplanetTheatre): ParsedCinema {
    return {
      id: obj["ID"],
      name: obj["name"],
      city: obj["city"],
      chain: CINEMA_CHAIN.CINEPLANET,
    };
  }

  static parseMovies(obj: CineplanetMovie): ParsedCineplanetMovie {
    const showings: {
      sessions: string[];
      cinemaId: string;
    }[] = [];

    obj["cinemas"].forEach((cinema) => {
      cinema["dates"]?.forEach((date) => {
        date["sessions"]?.forEach((session) => {
          showings.push({
            sessions: [session],
            cinemaId: cinema["cinemaId"],
          });
        });
      });
    });

    const title = obj["title"];
    const normalizedTitle = normalizeTitle(title);

    return {
      source_id: obj["id"],
      title: normalizedTitle,
      showings: showings,
      isComingSoon: obj["isComingSoon"],
    } as ParsedCineplanetMovie;
  }
}
