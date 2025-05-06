import { fetchTheatres, fetchBillboard, fetchReleases } from "./fetchData.ts";
import fs from "node:fs";
import { parseData } from "./helpers/parseData.ts";

const date = new Date();
const BASE_URL = "https://api.cinemark.cl";

const theatres = await fetchTheatres(BASE_URL);
const releases = await fetchReleases(BASE_URL, date);

const parsedTheatres = [];

theatres.forEach(theatre =>{
    parseData(theatre['cinemas'], 'ID', 'Name', 'City').forEach(datum => {
        parsedTheatres.push(datum);
    })
});

fs.writeFile("var/cinemark/theatres.json", JSON.stringify(parsedTheatres, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
});

const parsedReleases = parseData(releases['value'], 'ID', 'SynopsisAlt', 'Synopsis', 'RunTime', 'OpeningDate');

fs.writeFile("var/cinemark/releases.json", JSON.stringify(parsedReleases, null, 2), 'utf8', (err) => {
if (err) {
    console.error('Error writing file:', err);
    return;
}
console.log('File written successfully!');
})


const theatreIds = [];

parsedTheatres.forEach(theatre => {theatreIds.push(Number(theatre['ID']))});

async function joinBillboards(ids){

    const parsedBillboard = [];

    for(let i = 0; i < ids.length; i++){
        const billboard = await fetchBillboard(BASE_URL, ids[i]);
        parsedBillboard.push(billboard);
    }

    return parsedBillboard;
}

const jointBillboards = await joinBillboards(theatreIds);

fs.writeFile("var/cinemark/billboard.json", JSON.stringify(jointBillboards, null, 2), 'utf8', (err) => {
if (err) {
    console.error('Error writing file:', err);
    return;
}
console.log('File written successfully!');
})