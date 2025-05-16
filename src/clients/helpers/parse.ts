export async function reduceMovies(array){

    const reducedMovies = array.reduce((accumulator, currentMovie) => {
        const existingMovie = accumulator.find(array => array.title === currentMovie.title);
        //const re = /^.+(?=\s\()/;
      
        if (existingMovie) {
          existingMovie.cinemas.push(currentMovie.cinemas);
        } else {
          accumulator.push({
            //"id": currentMovie.id,
            "title": currentMovie.title/*.match(re)[0]*/,
            "cinemas": [currentMovie.cinemas],
            "isComingSoon": currentMovie['isComingSoon']
          });
        }
      
        return accumulator;
      }, []);

      return reducedMovies;
}

export async function reduceCinemas(array){

    const parsed = array.map(movie => {
        // For each movie, reduce its cinemas array
        const reducedCinemas = movie.cinemas.reduce((accumulator, currentCinema) => {
          const existingCinemaIndex = accumulator.findIndex(cinema => cinema.cinemaId === currentCinema.cinemaId);
      
          if (existingCinemaIndex > -1) {
            // If cinemaId exists, merge the dates array
            accumulator[existingCinemaIndex].dates.push(...currentCinema.dates);
          } else {
            // If cinemaId doesn't exist, add the current cinema entry
            accumulator.push({
              cinemaId: currentCinema.cinemaId,
              // Create a new array for dates to avoid modifying original data
              dates: [...currentCinema.dates]
            });
          }
      
          return accumulator;
        }, []); // Start with an empty array for the accumulator
      
        // Return a new movie object with the collapsed cinemas array
        return {
          ...movie, // Spread the original movie properties
          cinemas: reducedCinemas // Replace the original cinemas array with the collapsed one
        };
      });

      return parsed;
}

export async function addId(array){

    const newArr = [];

    array.forEach((element, index) => {
        newArr.push(
            {
                "id": index,
                ...element
            }
        )
    });

    return newArr;
}