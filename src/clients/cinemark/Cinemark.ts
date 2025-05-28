export class Cinemark {

    static async getTheatres(url: string){

        const response = await fetch(`${url}/api/vista/data/theatres`);
    
        const data = await response.json();
    
        return data;
    
    };
    
    static async getReleases(url: string, date: Date){
    
        const now = date.toISOString().slice(0, 10);
    
        const response = await fetch(`${url}/api/vista/data/releases?date=${now}`);
    
        const data = await response.json();
    
        return data;
    };
    
    static async getBillboard(url: string, cinemaId: number){
    
        const response = await fetch(`${url}/api/vista/data/billboard?cinema_id=${cinemaId}`);
    
        const data = await response.json();
    
        return data;
    };

    static async parseTheatres(obj){

        return {
            id: obj['ID'],
            name: obj['Name'],
            city: obj['City'],
            chain: 2
        }
    };

    static async parseMovies(arr){

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
                            "cinemas": {
                                "cinemaId": version['id'].split(idRe)[0],
                                "dates": [{
                                    "date": element['date'],
                                    "sessions": sessions
                                }]
                            },
                            "isComingSoon": version['sessions'].length > 0? true : false
        
                        }
                    )
                });
            });
        });

        return movies
    }

    static async parseShowings(arr){

        const showings = [];

        arr.forEach(element => {
            element['movies'].forEach(movie => {
        
                movie['movie_versions'].forEach(version => {
                    const sessions = [];

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

        return showings;
    }
}