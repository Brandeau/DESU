import fs from "node:fs";
import { inspect } from "node:util";

import { CINEMA_CHAIN } from "../../constants.ts";
import { getEnv } from "../helpers.ts";
import { ParsedCinema } from "../types.ts";

type CinepolisMovieForOneCity = {
  CityKey: string;
  CityName: string;
  Date: {
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

  static async fetchMovieByCity(city: string): Promise<CinepolisMovieForOneCity> {
    const response = await fetch(`${Cinepolis.url}/Cartelera.aspx/GetNowPlayingByCity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ claveCiudad: city, esVIP: false }),
    });

    const data = (await response.json()) as CinepolisMovieForOneCity;

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
    );

    const data = (await response.json()) as CinepolisZoneFull[];

    return data;
  }

  static async getAllMovies(): Promise<CinepolisMovieForOneCity[]> {
    const movies: CinepolisMovieForOneCity[] = [];
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

  static parseTheatres(cinema: CinepolisCinema): ParsedCinema {
    return {
      id: String(cinema.id),
      name: cinema.name,
      city: String(cinema.city_id),
      chain: CINEMA_CHAIN.CINEPOLIS,
    };
  }
}
//const data = await Cinepolis.getAllMovies();

/* fs.writeFile(
  "var/cinepolis/movies.json",
  JSON.stringify(data, null, 2),
  "utf8",
  (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File written successfully!");
  },
);
 */

console.log(inspect(await Cinepolis.fetchTheatres(), { depth: 11, colors: true }));
