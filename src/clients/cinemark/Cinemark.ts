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

    arr[0]['movies'].forEach(movie => {
        const re = /-[a-zA-Z]+[0-9]+/;

        movie['movie_versions'].forEach(element => {

            movies.push(
                {
                    "id": element['film_HOPK'],
                    "title": element['title'],
                    "cinemas": element['id'],
                    "isComingSoon": element['sessions'].length > 0? true : false

                }
            )
        });
    });

        return movies
    }
}