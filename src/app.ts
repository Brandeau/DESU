import { inspect } from "node:util";

import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt";

import { fetchMovieTitles, searchMovieByTitle } from "./services/find.ts";

const titles = fetchMovieTitles();

new Command()
  .name("desu")
  .version("0.1.0")
  .description(
    "Command line application to fetch all showings for a given movie across all main theatre chains in Santiago, Chile",
  )
  .command("search", "Find all available showings of a movie")
  .action(async () => {
    const title = await Select.prompt({
      message: "Select an option:",
      options: titles,
    });

    const results = searchMovieByTitle(title);

    console.log(results);
  })
  .parse(process.argv.slice(2));
