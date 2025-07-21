import fs from "node:fs";
import { inspect } from "node:util";

import { CINEMA_CHAIN } from "../../constants.ts";
import { truncateString } from "../helpers.ts";
import { getEnv, getKeyFromValue } from "../helpers.ts";
import { type ParsedCinema } from "../types.ts";

type CinepolisMovieForOneCity = {
  CityKey: string;
  CityName: string;
  Dates: {
    Movies: CinepolisMovies[];
    FilterDate: string;
    ShowtimeDate: string;
  }[];
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

type CinepolisShowtimes = {
  CinemaId: number;
  VistaCinemaId: string;
  ShowtimeId: string;
  TimeFilter: string;
  Time: string;
  ShowTimeAMPM: string;
};

type CinepolisFormats = {
  Showtimes: CinepolisShowtimes[];
  VistaId: string;
  Name: string;
  IsExperience: boolean;
  SegobPermission: string | null;
  Language: string;
};

type CinepolisMovies = {
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
  Genre: string;
  Distributor: string;
  Order: number;
  Actors: string[];
}[];

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
  static url: string = getEnv("CINEPOLIS_URL");

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

  static async fetchMovieByCity(city: string): Promise<CinepolisMovieForOneCity[]> {
    const response = await fetch(`${Cinepolis.url}/Cartelera.aspx/GetNowPlayingByCity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ claveCiudad: city, esVIP: false }),
    });

    const data = (await response.json()["d"]["Cinemas"]) as CinepolisMovieForOneCity[];

    return data;
  }

  static async fetchComplexes(): Promise<CinepolisZonesShort> {
    const response = await fetch(
      `${Cinepolis.url}/manejadores/CiudadesComplejos.ashx?EsVIP=false`,
    );

    const data = (await response.json()) as CinepolisZoneShort[];

    return data;
  }

  static async fetchTheatres(): Promise<CinepolisZoneFull[]> {
    const response = await fetch(
      "https://sls-api-compra.cinepolis.com/api/location/cities?countryCode=CL",
      {
        headers: {
          "user-agent": "Mozilla/5.0 ",
        },
      },
    );

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

    const data = (await response.json()) as CinepolisZoneFull[];

    return data;
  }

  static async getAllMovies(): Promise<CinepolisMovieForOneCity[][]> {
    const movies: CinepolisMovieForOneCity[][] = [];
    const zones = await Cinepolis.fetchComplexes();
    const zoneKey = zones.map((e) => e.Clave);

    for (let i = 0; i < zoneKey.length; i++) {
      if (zoneKey[i]) {
        const cityMovie = await Cinepolis.fetchMovieByCity(zoneKey[i]);
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
          id: String(cinema.id),
          name: cinema.name,
          city: getKeyFromValue(cinema.id, Cinepolis.cities),
          chain: CINEMA_CHAIN.CINEPOLIS,
        });
      });
    });

    return cinemas;
  }
}

console.log(
  inspect(await Cinepolis.fetchMovieByCity("sur-de-chile"), { depth: 13, colors: true }),
);
