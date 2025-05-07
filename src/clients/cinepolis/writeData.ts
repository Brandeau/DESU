import { fetchMovieByCity, fetchTheatres, fetchComplexes } from "./fetchData.ts";
import fs from "node:fs";

const BASE_URL ="https://cinepolischile.cl";

const complexes = await fetchComplexes(BASE_URL);
const theatres = await fetchTheatres();

async function getZones(complexes){
    const zones = [];

    for(let i=0; i < complexes.length; i++){
        zones.push(complexes[i]['Clave']);
    }

    return zones;
}

const zones = await getZones(complexes);

async function getAllMovies(url, zones){
    const allMovies = [];

    for(let i = 0; i < zones.length; i++){
        if(zones[i]){
            const movies = await fetchMovieByCity(url, zones[i]);
            allMovies.push(movies);
        }
    }

    return allMovies;
}

const allMovies = await getAllMovies(BASE_URL, zones);

fs.writeFile("var/cinepolis/theatres.json", JSON.stringify(theatres, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
});

fs.writeFile("var/cinepolis/movies.json", JSON.stringify(allMovies, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
});

