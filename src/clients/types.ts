export type ParsedCinema = {
  id: string;
  name: string;
  city: string;
  chain: number;
};

export type ParsedMovie = {
  source_id: string;
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export type Movie = {
  id: number;
  source_id: string;
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export type Showing = {
  cinemaId: string;
  sessions: string[];
};

export type MovieResult = {
  cinema: string;
  sessions: Sessions;
};

export type Sessions = ({
  showtime: string;
  formats: string[];
  languages: string[];
} | null)[];
