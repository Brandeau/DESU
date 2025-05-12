import { Cineplanet } from "./cineplanet/Cineplanet.ts";
import { getCookies } from "./cineplanet/helpers/getCookies.ts";

const subKey: string = process.env.SUBSCRIPTION_KEY;
const cineplanet: string = process.env.CINEPLANET_URL;
const cookie: string = await getCookies(cineplanet);

const theatres = [];
const movies = [];
const showings = [];

async function fetchTheatresFromCineplanet(){

    const rawTheatres = await Cineplanet.getTheatres(cookie, cineplanet, subKey);

    for(let i = 0; i < rawTheatres['cinemas'].length; i++){
        
        const x = await Cineplanet.parseTheatres(rawTheatres['cinemas'][i]);

        theatres.push(x);
    }
}

async function fetchMoviesFromCineplanet(){

    const rawMovies = await Cineplanet.getMovies(cookie, cineplanet, subKey);

    for(let i = 0; i < rawMovies['movies'].length; i++){
        
        const x = await Cineplanet.parseMovies(rawMovies['movies'][i]);

        movies.push(x);
    }
}

async function fetchShowingsFromCineplanet(){

    const rawShowings = await Cineplanet.getShowings(cookie, cineplanet, subKey);

    for(let i = 0; i < rawShowings['sessions'].length; i++){

        showings.push(rawShowings['sessions'][i]);
    }
}

