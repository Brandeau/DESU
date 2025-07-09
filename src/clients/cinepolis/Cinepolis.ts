import { inspect } from "node:util";

import { CINEMA_CHAIN } from "../../constants.ts";
import { getEnv } from "../helpers.ts";

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

type CinepolisZone = {
  Complexes: CinepolisComplexes;
  Nombre: string;
  Clave: string;
  GeoX: string;
  GeoY: string;
};

type CinepolisZones = CinepolisZone[];

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

  static async fetchComplexes(): Promise<CinepolisZone[]> {
    const response = await fetch(
      `${Cinepolis.url}/manejadores/CiudadesComplejos.ashx?EsVIP=false`,
    );

    const data = (await response.json()) as CinepolisZone[];

    return data;
  }

  static async fetchTheatres() {
    const response = await fetch(
      "https://sls-api-compra.cinepolis.com/api/location/cities?countryCode=CL",
    );

    const data = (await response.json()) as any[];

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
}

console.log(inspect(await Cinepolis.getAllMovies(), { depth: 11, colors: true }));
