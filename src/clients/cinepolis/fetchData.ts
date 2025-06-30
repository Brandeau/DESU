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

export async function fetchComplexes(url){
    const response = await fetch(`${url}/manejadores/CiudadesComplejos.ashx?EsVIP=false`);

    const data = await response.json();

    return data;
}

export async function fetchTheatres(){
    const response = await fetch("https://sls-api-compra.cinepolis.com/api/location/cities?countryCode=CL");

    const data = await response.json() as any[];

    return data;
};
