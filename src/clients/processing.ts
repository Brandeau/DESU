import { Cineplanet } from "./cineplanet/Cineplanet.ts";
import { Cinemark } from "./cinemark/Cinemark.ts";
import { inspect } from "util";
import { getCookies } from "./cineplanet/helpers/getCookies.ts";
import { reduceMovies, reduceCinemas, addId, reduceCineplanetShowings } from "./helpers/parse.ts";
import fs from "node:fs";


const subKey: string = process.env.SUBSCRIPTION_KEY;
const cineplanet: string = process.env.CINEPLANET_URL;
const cinemark: string = process.env.CINEMARK_URL;
const cookie: string = await getCookies(cineplanet);

const theatres = [];
const movies = [];
const showings = [];

async function fetchTheatresFromCineplanet(){

    const rawTheatres = await Cineplanet.getTheatres(cookie, cineplanet, subKey);

    for(let i = 0; i < rawTheatres['cinemas'].length; i++){
        
        const parsed = await Cineplanet.parseTheatres(rawTheatres['cinemas'][i]);

        theatres.push(parsed);
    }

}

async function fetchMoviesFromCineplanet(){

    const rawMovies = await Cineplanet.getMovies(cookie, cineplanet, subKey);
    const films = [];

    for(let i = 0; i < rawMovies['movies'].length; i++){
        
        const parsed = await Cineplanet.parseMovies(rawMovies['movies'][i]);

        films.push(parsed);
    }

    const reducedFilms = await reduceCineplanetShowings(films.flat());

    //@ts-ignore
    await reducedFilms.forEach(cinema => {
        movies.push(cinema);
    })
}

async function fetchShowingsFromCineplanet(){

    const rawShowings = await Cineplanet.getShowings(cookie, cineplanet, subKey);

    for(let i = 0; i < rawShowings['sessions'].length; i++){

        showings.push(rawShowings['sessions'][i]);
    }
    
}

async function fetchTheatresFromCinemark(){

    const rawTheatres = await Cinemark.getTheatres(cinemark);

    for(let i = 0; i < rawTheatres.length; i++){
        
        for(let j = 0; j < rawTheatres[i]['cinemas'].length; j++){
            const parsed = await Cinemark.parseTheatres(rawTheatres[i]['cinemas'][j])

            theatres.push(parsed)
        }        
    }
}

async function fetchMoviesFromCinemark(){

    const cinema_ids = [2305, 2302, 2306, 2308, 520, 2309, 2301, 2304, 2303, 2300, 517, 2307, 511, 512, 513, 519, 572, 548, 514, 570];
    const films = [];

    for(let i = 0; i < cinema_ids.length; i++){
        const rawMovies = await Cinemark.getBillboard(cinemark, cinema_ids[i]);

        const parsed = await Cinemark.parseMovies(rawMovies);

        films.push(parsed)
    }
    const reducedMovies = await reduceMovies(films.flat());
    const reducedCinemas = await reduceCinemas(reducedMovies);
    const cinemasWithId = await addId(reducedCinemas);
    
    await cinemasWithId.forEach(cinema => {
        movies.push(cinema);
    })
}

async function fetchShowingsFromCinemark(){

    const cinema_ids = [2305, 2302, 2306, 2308, 520, 2309, 2301, 2304, 2303, 2300, 517, 2307, 511, 512, 513, 519, 572, 548, 514, 570];

    for(let i = 0; i < cinema_ids.length; i++){
        const rawMovies = await Cinemark.getBillboard(cinemark, cinema_ids[i]);

        const parsed = await Cinemark.parseShowings(rawMovies);

        showings.push(parsed)
    }
}

async function handler(){
    await fetchTheatresFromCinemark();
    await fetchTheatresFromCineplanet();
    await fetchMoviesFromCinemark();
    await fetchMoviesFromCineplanet();
    await fetchShowingsFromCinemark();
    await fetchShowingsFromCineplanet();

    await fs.writeFile("var/data/theatres.json", JSON.stringify(theatres, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('File written successfully!');
    });

    await fs.writeFile("var/data/movies.json", JSON.stringify(movies.flat(), null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('File written successfully!');
    });

    await fs.writeFile("var/data/showings.json", JSON.stringify(showings.flat(), null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('File written successfully!');
    });
}

handler();