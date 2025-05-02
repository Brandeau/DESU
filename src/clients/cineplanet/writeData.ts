import { getCookies } from "./helpers/getCookies.ts";
import { parseData } from "./helpers/parseData.ts";
import { getMovies, getTheatres, getShowings } from "./fetchData.ts";

import fs from "node:fs";

const subKey: string = process.env.SUBSCRIPTION_KEY;
const url: string = "https://www.cineplanet.cl";
const cookie: string = await getCookies(url);

const movies = await getMovies(cookie, url, subKey);
const theatres = await getTheatres(cookie, url, subKey);
const showings = await getShowings(cookie, url, subKey);

const parsedMovies = parseData(movies, 'id', 'title', 'cinemas', 'isComingSoon');
const parsedTheatres = parseData(theatres, 'ID', 'name', 'city');

fs.writeFile("var/movies/movies.json", JSON.stringify(parsedMovies, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
  })

  fs.writeFile("var/theatres/theatres.json", JSON.stringify(parsedTheatres, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
  })

  fs.writeFile("var/showings/showings.json", JSON.stringify(showings, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
  })