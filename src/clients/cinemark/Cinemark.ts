type CinemarkCinema = {
        "ID": string,
        "Name": string,
        "PhoneNumber": string,
        "City": string,
        "Address1": string,
        "Address2": string,
        "LoyaltyCode": string,
        "Latitude": string,
        "Longitude": string,
        "Description": string,
        "Slug": string
    }

type CinemarkTheatres = {
    "city": string,
    "cinemas": CinemarkCinema[];
}[];

type ParsedCinema = {
    "id": string,
    "name": string,
    "city": string,
    "chain": number
}

type CinemarkReleases = {
    "value": {
        "ID": string,
        "Title": string,
        "Synopsis": string,
        "SynopsisAlt": string,
        "RunTime": number,
        "OpeningDate": string,
        "TrailerUrl": string,
        "CorporateFilmId": string,
        "HOFilmCode": string,
        "Rating": string,
        "GenreId": string,
        "GenreId2": string | null,
        "GenreId3": string | null,
        "genre": string,
        "genre2": string,
        "genre3": string 
    }[]
}
type CinemarkMovie = {
        "title": string,
        "trailer_url": string,
        "graphic_url": string,
        "runtime": string,
        "rating": string,
        "film_HO_code": string,
        "corporate_film_id": string,
        "synopsis": string,
        "synopsis_alt": string,
        "opening_data": string,
        "genre": string,
        "genre2": string | null,
        "genre3": string | null,
        "cast": {
            "ID": string,
            "FirstName": string,
            "LastName": string,
            "PersonType": string
        }[],
        "movie_versions": {
            "film_HOPK": string,
            "title": string,
            "film_HO_code": string,
            "id": string,
            "sessions": {
                "id": string,
                "showtime": string,
                "day": string,
                "hour": string,
                "seats_available": number
            }[]
        }[]
    }

type CinemarkMoviesByDate = {
    "date": string,
    "movies": CinemarkMovie[]
}

type CinemarkBillboard = CinemarkMoviesByDate[]

type ParsedMovie = {
    "id": string,
    "title": string,
    "showings": {
        "cinemaId": string,
        "sessions": string[]
    },
    "isComingSoon": boolean
}

type ParsedShowing = {
    "id": string,
    "showtime": string,
    "formats": string[],
    "languages": string[]
}

export class Cinemark {

    static async getTheatres(url: string): Promise<CinemarkTheatres>{

        const response = await fetch(`${url}/api/vista/data/theatres`);
    
        const data = (await response.json()) as CinemarkTheatres;
    
        return data;
    
    };
    
    static async getReleases(url: string, date: Date): Promise<CinemarkReleases>{
    
        const now = date.toISOString().slice(0, 10);
    
        const response = await fetch(`${url}/api/vista/data/releases?date=${now}`);
    
        const data = (await response.json()) as CinemarkReleases;
    
        return data;
    };
    
    static async getBillboard(url: string, cinemaId: number): Promise<CinemarkBillboard>{
    
        const response = await fetch(`${url}/api/vista/data/billboard?cinema_id=${cinemaId}`);
    
        const data = (await response.json()) as CinemarkBillboard;
    
        return data;
    };

    static parseTheatres(obj: CinemarkCinema): ParsedCinema{

        return {
            id: obj['ID'],
            name: obj['Name'],
            city: obj['City'],
            chain: 2
        } as ParsedCinema
    };

    static parseMovies(arr: CinemarkBillboard): ParsedMovie[]{

        const movies = [];

        arr.forEach(element => {
            element['movies'].forEach(movie => {
                const idRe = /-[a-zA-Z]+[0-9]+/;
                const titleRe = /^.+(?=\s\()/;
        
                movie['movie_versions'].forEach(version => {
                    const sessions = [];

                    version['sessions'].forEach(session => {
                        sessions.push(session['id'])
                    });

                    movies.push(
                        {
                            "id": movie['film_HO_code'],
                            "title": version['title'].match(titleRe)[0],
                            "showings": {
                                "cinemaId": version['id'].split(idRe)[0],
                                "sessions": sessions
                            },
                            "isComingSoon": version['sessions'].length > 0? true : false
        
                        } 
                    )
                });
            });
        });

        return movies as ParsedMovie[]
    }

    static async parseShowings(arr: CinemarkBillboard): Promise<ParsedShowing[]>{

        const showings = [];

        arr.forEach(element => {
            element['movies'].forEach(movie => {
        
                movie['movie_versions'].forEach(version => {

                    version['sessions'].forEach(session => {
                        const re = /(?<=\().*(?=\))/;
                        const formats = version['title'].match(re) !== null ? version['title'].match(re)[0].split(' ') : []
                        const lang = formats.pop();

                        showings.push(
                            {
                                "id": session['id'],
                                "showtime": session['showtime'], 
                                "formats": formats,
                                "languages": [lang]
                            }
                        )
                    });

                });
            });
        });

        return showings as ParsedShowing[];
    }
}