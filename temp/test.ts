import { parseData } from "../src/clients/cinepolis/helpers/parser.ts";

export async function fetchTheatres(){
    const response = await fetch("https://sls-api-compra.cinepolis.com/api/location/cities?countryCode=CL");

    const data = await response.json() as any[];

    return data;
};
const theatres = await fetchTheatres();
const parsedTheatres = [];

theatres.forEach(theatre =>{
    parseData(theatre['cinemas'], 'id', 'name', 'city_id').forEach(datum => {
        parsedTheatres.push(datum);
    })
});


console.log(parsedTheatres)