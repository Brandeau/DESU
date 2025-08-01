import { inspect } from "node:util";

import { Command } from "@cliffy/command";

import { searchMovieByTitle } from "./services/find.ts";

new Command()
  .name("desu")
  .version("0.1.0")
  .description(
    "Command line application to fetch all showings for a given movie across all main theatre chains in Santiago, Chile",
  )
  .command(
    "search <title:string> [city:string]",
    "Find all available showings of a movie",
  )
  .action((options, title) => {
    const results = searchMovieByTitle(title);

    console.log(results);
  })
  .parse(process.argv.slice(2));
