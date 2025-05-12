export class Cineplanet {

    static async getTheatres(cookie:string, url:string, subKey:string){
    
        const response = await fetch(`${url}/api/cache/cinemascache`, {
            method: "GET",
            headers:{
                "Ocp-Apim-Subscription-Key": subKey,
                cookie
            }
        })
        const cinemas = (await response.json());
    
        return cinemas;
    }

    static async getMovies(cookie:string, url:string, subKey:string){
    
        const response = await fetch(`${url}/api/cache/moviescache`, {
            method: "GET",
            headers:{
                "Ocp-Apim-Subscription-Key": subKey,
                cookie
            }
        })
        const movies = (await response.json());
    
        return movies;
    }
    
    static async getShowings(cookie: string, url: string, subKey: string){
    
        const response = await fetch(`${url}/api/cache/sessioncache`, {
            method: "GET",
            headers:{
                "Ocp-Apim-Subscription-Key": subKey,
                cookie
            }
        })
        const showings = await response.json();
    
        return showings;
    }

    static async parseTheatres(obj){

        return {
            id: obj['ID'],
            name: obj['name'],
            city: obj['city'],
            chain: 1
        }
    }

    static async parseMovies(obj){

        const showings = [];

        obj['cinemas'].forEach(cinema => {
            cinema['dates']?.forEach(date => {
                date['sessions']?.forEach(session => {
                    showings.push({
                        session: session,
                        cinema: cinema['cinemaId']
                    });
                });
            });
        });
        
        return {
            id: obj['id'],
            title: obj['title'],
            showings: showings,
            available: !obj['isComingSoon']
        }
    }
}