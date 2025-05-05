import { inspect } from "node:util";
const BASE_URL ="https://cinepolischile.cl";

export async function fetchMovieByCity(url, city){

    const response = await fetch(`${url}/Cartelera.aspx/GetNowPlayingByCity`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({"claveCiudad": city, "esVIP": false})
    });

    const data = await response.json();

    return data;
}

export async function fetchTheatres(url){
    const response = await fetch(`${url}/manejadores/CiudadesComplejos.ashx?EsVIP=false`);

    const data = await response.json();

    return data;
}

const comuna = await fetchMovieByCity(BASE_URL, "santiago-centro");

console.log(inspect(comuna, {depth: 11, colors:true}));
