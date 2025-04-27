async function getShows(){

    const response = await fetch('https://www.cineplanet.cl/api/cache/sessioncache');
    const data = await response.json();

    console.log(data)
}

getShows();