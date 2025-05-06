import { fetchTheatres, fetchBillboard, fetchReleases } from "./fetchData.ts";
import { inspect } from "node:util";
import fs from "node:fs";
import { parseData } from "./helpers/parseData.ts";

const date = new Date();
const BASE_URL = "https://api.cinemark.cl";

const theatres = await fetchTheatres(BASE_URL);
const releases = await fetchReleases(BASE_URL, date);
const billboard = await fetchBillboard(BASE_URL, 570);

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
  })
/*
  fs.writeFile("var/cinemark/releases.json", JSON.stringify(releases, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
  })

  fs.writeFile("var/cinemark/billboard.json", JSON.stringify(billboard, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully!');
  }) */