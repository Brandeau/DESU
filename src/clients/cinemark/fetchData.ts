const BASE_URL = "https://api.cinemark.cl";
const date = new Date();
const now = date.toISOString().slice(0, 10);
const cinemaId = 2305;

export async function fetchTheatres(url){

    const response = await fetch(`${url}/api/vista/data/theatres`);

    const data = await response.json();

    return data;

}

export async function fetchReleases(url, date){
    const response = await fetch(`${url}/api/vista/data/releases?date=${date}`);

    const data = await response.json();

    return data;
}

export async function fetchBillboard(url, cinemaId){

    const response = await fetch(`${url}/api/vista/data/billboard?cinema_id=${cinemaId}`);

    const data = await response.json();

    return data;
}


