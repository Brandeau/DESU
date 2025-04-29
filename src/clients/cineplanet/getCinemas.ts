import fs from "node:fs"
import  {getCookies}  from "../../utils/getCookies.ts";

const subKey = process.env.SUBSCRIPTION_KEY;

async function getCinemas(){

    const url = "https://www.cineplanet.cl";
    const cookie = await getCookies(url);

    const response = await fetch(`${url}/api/cache/moviescache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const data = await response.json();

    console.log(data);
}

getCinemas();

