import { CINEMA_CHAIN, URLS } from "../../constants.ts";
import { type ParsedShowing } from "../cinemark/Cinemark.ts";
import { getEnv, getKeyFromValue } from "../helpers.ts";
import { customFetch } from "../helpers.ts";
import { type ParsedCinema, type ParsedMovie } from "../types.ts";

type CinepolisMovieForOneCity = {
  CityKey: string;
  CityName: string;
  Dates: CinepolisDate[];
  Status: number;
  Id: number;
  VistaId: string;
  Key: string;
  Name: string;
  IsPresale: boolean;
  Children: string;
  Order: number;
  TimeZoneDifference: number;
};

type CinepolisDate = {
  Movies: CinepolisMovie[];
  FilterDate: string;
  ShowtimeDate: string;
};

type CinepolisShowtimes = {
  CinemaId: number;
  VistaCinemaId: string;
  ShowtimeId: string;
  TimeFilter: string;
  Time: string;
  ShowtimeAMPM: string;
};

type CinepolisFormats = {
  Showtimes: CinepolisShowtimes[];
  VistaId: string;
  Name: string;
  IsExperience: boolean;
  SegobPermission: string | null;
  Language: string;
};

type CinepolisMovie = {
  Formats: CinepolisFormats[];
  Id: number;
  Title: string;
  Key: string;
  OriginalTitle: string;
  Rating: string;
  RatingDescription: string;
  RunTime: string;
  Poster: string;
  Trailer: string;
  Director: string;
  Gender: string;
  Distributor: string;
  Order: number;
  Actors: string[];
};

type CinepolisComplex = {
  Nombre: string;
  Clave: string;
};

type CinepolisComplexes = CinepolisComplex[];

type CinepolisZoneShort = {
  Complexes: CinepolisComplexes;
  Nombre: string;
  Clave: string;
  GeoX: string;
  GeoY: string;
};

type CinepolisZonesShort = CinepolisZoneShort[];

type CinepolisZoneFull = {
  id: number;
  name: string;
  uris: string;
  lat: string;
  lng: string;
  country: {
    name: string;
    code: string;
  };
  region: {
    id: number;
    name: string;
  };
  settings: {
    has_food_sales: boolean;
  };
  cinemas: CinepolisCinema[];
  message: unknown;
  status_code: number;
  error: unknown;
  error_description: unknown;
};

type CinepolisCinema = {
  id: number;
  vista_id: string;
  uris: string;
  city_id: number;
  name: string;
  lat: string;
  lng: string;
  phone: string;
  address: string;
  position: number;
  settings: {
    is_special_prices: boolean;
    type_food_sales: unknown;
    cs_merchant_id: unknown;
    vco_merchant_id: unknown;
  };
};

export class Cinepolis {
  static url: string = Buffer.from(URLS.CINEPOLIS, "base64url").toString("utf-8");

  static cities = {
    "Antofagasta": [466, 467],
    "Calama": [468],
    "Quillota": [570],
    "Coquimbo": [572],
    "Ovalle": [623],
    "Santiago": [
      461, 560, 499, 450, 456, 457, 458, 459, 460, 507, 551, 552, 453, 464, 465, 680, 729,
      736, 452, 462, 463, 592, 617,
    ],
    "Talca": [455],
    "Los Ángeles": [470],
    "Temuco": [471, 622],
    "Chillán": [475],
    "San Fernando": [514],
    "Chiloé": [620],
    "Puerto Montt": [702, 761],
  };

  private constructor(readonly movies: CinepolisMovieForOneCity[][]) {}

  static async init() {
    const movies = await this.getAllMovies();

    return new Cinepolis(movies);
  }

  static async getMoviesByZone(zone: string): Promise<CinepolisMovieForOneCity[]> {
    const response = await customFetch(
      `${Cinepolis.url}/Cartelera.aspx/GetNowPlayingByCity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ claveCiudad: zone, esVIP: false }),
      },
    );

    const data = ((await response.json()) as any)["d"]["Cinemas"];

    return data as CinepolisMovieForOneCity[];
  }

  static async getComplexes(): Promise<CinepolisZonesShort> {
    const response = await customFetch(
      `${Cinepolis.url}/manejadores/CiudadesComplejos.ashx?EsVIP=false`,
    );

    const data = (await response.json()) as CinepolisZoneShort[];

    return data;
  }

  async getTheatres(): Promise<CinepolisZoneFull[]> {
    const response = await customFetch(
      "https://sls-api-compra.cinepolis.com/api/location/cities?countryCode=CL",
      {
        headers: {
          "sec-ch-ua-mobile": "?0",
        },
      },
    );

    const data = (await response.json()) as CinepolisZoneFull[];

    return data;
  }

  static async getAllMovies(): Promise<CinepolisMovieForOneCity[][]> {
    const movies: CinepolisMovieForOneCity[][] = [];
    const zones = await this.getComplexes();
    const zoneKey = zones.map((e) => e.Clave);

    for (let i = 0; i < zoneKey.length; i++) {
      if (zoneKey[i]) {
        const cityMovie = await this.getMoviesByZone(zoneKey[i]);
        movies.push(cityMovie);
      }
    }
    return movies;
  }

  static parseTheatres(zones: CinepolisZoneFull[]): ParsedCinema[] {
    const cinemas: ParsedCinema[] = [];

    zones.forEach((zone) => {
      zone.cinemas.forEach((cinema) => {
        cinemas.push({
          id: `${CINEMA_CHAIN.CINEPOLIS}-${String(cinema.id)}`,
          name: cinema.name,
          city: getKeyFromValue(cinema.id, Cinepolis.cities),
        });
      });
    });

    return cinemas;
  }

  static parseMovies(movie: CinepolisMovie): ParsedMovie {
    const showings: {
      cinemaId: string;
      sessions: string[];
    }[] = [];

    movie.Formats.forEach((format) => {
      format.Showtimes.forEach((showtime) => {
        showings.push({
          cinemaId: `${CINEMA_CHAIN.CINEPOLIS}-${String(showtime.CinemaId)}`,
          sessions: [showtime.ShowtimeId],
        });
      });
    });
    return {
      source_id: String(movie.Id),
      title: movie.Title,
      showings: showings,
      isComingSoon: movie.Formats.length > 0 ? false : true,
    } as ParsedMovie;
  }

  static parseShowings(movie: CinepolisDate): ParsedShowing[] {
    const date = movie.ShowtimeDate;
    const showings: ParsedShowing[] = [];

    movie.Movies.forEach((movie) => {
      movie.Formats.forEach((format) => {
        const lang = format.Language;
        const form = format.Name;

        format.Showtimes.forEach((showtime) => {
          showings.push({
            id: showtime.ShowtimeId,
            date: date,
            time: showtime.Time,
            formats: [form],
            languages: [lang],
          });
        });
      });
    });

    return showings;
  }
}
