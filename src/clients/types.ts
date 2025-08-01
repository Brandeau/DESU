export type ParsedCinema = {
  id: string;
  name: string;
  city: string;
};

export type ParsedMovie = {
  title: string;
  showings: {
    cinemaId: string;
    sessions: string[];
  }[];
  isComingSoon: boolean;
};

export type Movie = {
  id: number;
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
  date: string;
  time: string;
  formats: string[];
  languages: string[];
} | null)[];
