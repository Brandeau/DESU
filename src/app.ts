import { inspect } from "node:util";

import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt";

import { write } from "../sbin/process-data.ts";
import { fetchMovieTitles, searchMovieByTitle } from "./services/find.ts";
import { getPackageJsonVersion } from "./utils.ts";

const version = await getPackageJsonVersion();

new Command()
  .name("desu")
  .version(version)
  .description(
    "Command line application to fetch all showings for a given movie across all main theatre chains in Santiago, Chile",
  )
  .command("populate, Populate local movie data")
  .option("-f, --force", "Force populate data")
  .action(async (options) => {
    write(options.force);
  })
  .command("search", "Find all available showings of a movie")
  .option("-t, --title <title:string>", "Input title")
  .action(async (options) => {
    write();
    const titles = fetchMovieTitles();
    if (options.title) {
      const results = searchMovieByTitle(options.title);

      console.log(inspect(results, { depth: 13, colors: true }));
    } else {
      const title = await Select.prompt({
        message: "Select an option:",
        options: titles,
      });

      const results = searchMovieByTitle(title);

      console.log(inspect(results, { depth: 13, colors: true }));
    }
  })
  .parse(process.argv.slice(2));
