import { CINEMA_CHAIN } from "../../constants.ts";
import { type ParsedShowing } from "../cinemark/Cinemark.ts";
import { normalizeTitle } from "../helpers.ts";
import { getEnv } from "../helpers.ts";
import { type ParsedCinema, type ParsedMovie } from "../types.ts";

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
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export class Cineplanet {
  static url: string = getEnv("CINEPLANET_URL");
  subKey = getEnv("SUBSCRIPTION_KEY");

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
  async getTheatres(): Promise<CineplanetTheatres> {
    const response = await fetch(`${Cineplanet.url}/api/cache/cinemascache`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": this.subKey,
        "cookie": this.cookie,
      },
    });
    const cinemas = (await response.json()) as CineplanetTheatres;

    return cinemas;
  }

  async getMovies(): Promise<CineplanetBillboard> {
    const response = await fetch(`${Cineplanet.url}/api/cache/moviescache`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": this.subKey,
        "cookie": this.cookie,
      },
    });
    const movies = (await response.json()) as CineplanetBillboard;

    return movies;
  }

  async getShowings(): Promise<CineplanetSessions> {
    const response = await fetch(`${Cineplanet.url}/api/cache/sessioncache`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": this.subKey,
        "cookie": this.cookie,
      },
    });
    const showings = (await response.json()) as CineplanetSessions;

    return showings;
  }

  static parseTheatres(obj: CineplanetTheatre): ParsedCinema {
    return {
      id: `${CINEMA_CHAIN.CINEPLANET}-${obj["ID"]}`,
      name: obj["name"],
      city: obj["city"],
    };
  }

  static parseMovies(obj: CineplanetMovie): ParsedMovie {
    const showings: {
      sessions: string[];
      cinemaId: string;
    }[] = [];

    obj["cinemas"].forEach((cinema) => {
      cinema["dates"]?.forEach((date) => {
        date["sessions"]?.forEach((session) => {
          showings.push({
            sessions: [session],
            cinemaId: `${CINEMA_CHAIN.CINEPLANET}-${cinema["cinemaId"]}`,
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
    } as ParsedMovie;
  }

  static parseShowings(session: CineplanetSession): ParsedShowing {
    const dateRe = /.*(?=T)/;
    const dateMatch = session["showtime"].match(dateRe);
    const date = dateMatch ? dateMatch[0] : "";
    const timeRe = /\d+:\d+/;
    const timeMatch = session["showtime"].match(timeRe);
    const time = timeMatch ? timeMatch[0] : "";

    return {
      id: session.id,
      date: date,
      time: time,
      formats: session.formats,
      languages: session.languages,
    } as ParsedShowing;
  }
}
