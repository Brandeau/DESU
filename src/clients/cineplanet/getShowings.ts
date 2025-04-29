import { getCookies }  from "../../utils/getCookies.ts";

type fetchedData = {
    'id': string,
    'showtime': string,
    'formats': any[],
    'languages': any[],
    'sessionId': string
};

const subKey = process.env.SUBSCRIPTION_KEY;

export async function getShowings(){

    const url = "https://www.cineplanet.cl";
    const cookie = await getCookies(url);

    const response = await fetch(`${url}/api/cache/sessioncache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const showings = (await response.json())['sessions'] as fetchedData[];
    
    return showings;
}

