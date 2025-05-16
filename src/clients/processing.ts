import { Cineplanet } from "./cineplanet/Cineplanet.ts";
import { Cinemark } from "./cinemark/Cinemark.ts";
import { inspect } from "util";
import { getCookies } from "./cineplanet/helpers/getCookies.ts";
import { reduceMovies, reduceCinemas, addId } from "./helpers/parse.ts";

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

async function fetchTheatresFromCinemark(){

    const rawTheatres: any = await Cinemark.getTheatres(cinemark);

    for(let i = 0; i < rawTheatres.length; i++){
        
        for(let j = 0; j < rawTheatres[i]['cinemas'].length; j++){
            const parsed = await Cinemark.parseTheatres(rawTheatres[i]['cinemas'][j])

            theatres.push(parsed)
        }        
    }
}

async function fetchMoviesFromCinemark(){

    const cinema_ids = [2305, 2302, 2306, 2308, 520, 2309, 2301, 2304, 2303, 2300, 517, 2307, 511, 512, 513, 519, 572, 548, 514, 570];

    for(let i = 0; i < cinema_ids.length; i++){
        const rawMovies = await Cinemark.getBillboard(cinemark, cinema_ids[i]);

        const x = await Cinemark.parseMovies(rawMovies);

        theatres.push(x)
    }

    const reducedMovies = await reduceMovies(theatres.flat());
    const reducedCinemas = await reduceCinemas(reducedMovies);
    const cinemasWithId = await addId(reducedCinemas);
    
    console.log(inspect(cinemasWithId, {depth: 11, colors: true}))

}

fetchMoviesFromCinemark();