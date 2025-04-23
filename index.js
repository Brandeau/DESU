import express from 'express';

const app = express();

async function getShows(){

    const response = await fetch('https://www.cineplanet.cl/api/cache/sessioncache?subscription-key=c6f97c336b60469189a010a5836fe891');
    const data = await response.json();

    console.log(data)
}

getShows();