import fs from "node:fs"
import { parseData } from "./helpers/parseData.ts";
import { getCookies }  from "../../utils/getCookies.ts";

type fetchedData = {
    'ID': string,
    'name': string,
    'city': string
};

const subKey = process.env.SUBSCRIPTION_KEY;

export async function getTheatres(){

    const url = "https://www.cineplanet.cl";
    const cookie = await getCookies(url);

    const response = await fetch(`${url}/api/cache/cinemascache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const cinemas = (await response.json())['cinemas'] as fetchedData[];
    const parsedCinemas = parseData(cinemas, 'ID', 'name', 'city');

    return parsedCinemas;
}
