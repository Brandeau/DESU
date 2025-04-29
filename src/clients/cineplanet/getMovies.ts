import { parseData } from "./helpers/parseData.ts";
import { getCookies }  from "../../utils/getCookies.ts";

type fetchedData = {
    'id': string,
    'title': string,
    'cinemas': any[],
    'isComingSoon': boolean
};

const subKey = process.env.SUBSCRIPTION_KEY;

export async function getMovies(){

    const url = "https://www.cineplanet.cl";
    const cookie = await getCookies(url);

    const response = await fetch(`${url}/api/cache/moviescache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const movies = (await response.json())['movies'] as fetchedData[];
    const parsedMovies = parseData(movies, 'id', 'title', 'cinemas', 'isComingSoon');

    return parsedMovies;
}

getMovies();