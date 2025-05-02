const BASE_URL = "https://api.cinemark.cl";
const date = new Date();
const now = date.toISOString().slice(0, 10);

export async function fetchTheatres(url){

    const response = await fetch(`${url}/api/vista/data/theatres`);

    const data = await response.json();

    return data;

}

