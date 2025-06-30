export interface CinemaRoot {
  city: string;
  cinemas: Cinema[];
}
export interface Cinema {
  ID: string;
  Name: string;
  PhoneNumber: string;
  City: string;
  Address1: string;
  Address2: string;
  LoyaltyCode: string;
  Latitude: string;
  Longitude: string;
  Description: string;
  Slug: string;
}

export interface ReleasesRoot {
  value: Releases[];
}
export interface Releases {
  ID: string;
  Title: string;
  Synopsis: string;
  SynopsisAlt: string;
  RunTime: number;
  OpeningDate: string;
  TrailerUrl: string;
  CorporateFilmId: string;
  HOFilmCode: string;
  Rating: string;
  GenreId: string;
  GenreId2?: string;
  GenreId3: any;
  genre: string;
  genre2?: string;
  genre3: any;
}
export interface MovieRoot {
  date: string;
  movies: Movie[];
}

export interface Movie {
  title: string;
  trailer_url: string;
  graphic_url: string;
  runtime: string;
  rating: string;
  film_HO_code: string;
  corporate_film_id: string;
  synopsis: string;
  synopsis_alt: string;
  opening_date: string;
  genre: string;
  genre2?: string;
  genre3?: string;
  cast: Cast[];
  movie_versions: MovieVersion[];
}

export interface Cast {
  ID: string;
  FirstName: string;
  LastName: string;
  PersonType: string;
}

export interface MovieVersion {
  film_HOPK: string;
  title: string;
  film_HO_code: string;
  id: string;
  sessions: Session[];
}

export interface Session {
  id: string;
  showtime: string;
  day: string;
  hour: string;
  seats_available: number;
}

export async function fetchTheatres(url: string): Promise<CinemaRoot[]> {
  const response = await fetch(`${url}/api/vista/data/theatres`);

  const data = (await response.json()) as CinemaRoot[];

  return data;
}

export async function fetchReleases(url: string, date: Date): Promise<ReleasesRoot[]> {
  const now = date.toISOString().slice(0, 10);

  const response = await fetch(`${url}/api/vista/data/releases?date=${now}`);

  const data = (await response.json()) as ReleasesRoot[];

  return data;
}

export async function fetchBillboard(
  url: string,
  cinemaId: number,
): Promise<MovieRoot[]> {
  const response = await fetch(`${url}/api/vista/data/billboard?cinema_id=${cinemaId}`);

  const data = (await response.json()) as MovieRoot[];

  return data;
}
