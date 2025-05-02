type fetchedSession = {
    'id': string,
    'showtime': string,
    'formats': any[],
    'languages': any[],
    'sessionId': string
};

type fetchedMovie = {
    'id': string,
    'title': string,
    'cinemas': any[],
    'isComingSoon': boolean
};

type fetchedTheatre = {
    'ID': string,
    'name': string,
    'city': string
};

export async function getShowings(cookie: string, url: string, subKey: string): Promise<fetchedSession[]>{

    const response = await fetch(`${url}/api/cache/sessioncache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const showings = (await response.json())['sessions'] as fetchedSession[];

    return showings;
}

export async function getMovies(cookie:string, url:string, subKey:string): Promise<fetchedMovie[]>{

    const response = await fetch(`${url}/api/cache/moviescache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const movies = (await response.json())['movies'] as fetchedMovie[];

    return movies;
}

export async function getTheatres(cookie:string, url:string, subKey:string): Promise<fetchedTheatre[]>{

    const response = await fetch(`${url}/api/cache/cinemascache`, {
        method: "GET",
        headers:{
            "Ocp-Apim-Subscription-Key": subKey,
            cookie
        }
    })
    const cinemas = (await response.json())['cinemas'] as fetchedTheatre[];

    return cinemas;
}