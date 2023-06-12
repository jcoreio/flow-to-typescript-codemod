import * as t from "@babel/types";
import { parseAsync } from "babel-parse-wild-code";
import { cloneAstWithOriginals } from "./cloneAstWithOriginals";
import fs from "fs-extra";
import path from "path";

export async function parse(file: string): Promise<t.File> {
  file = path.resolve(file);
  const [source, ast] = await Promise.all([
    fs.readFile(file, "utf8"),
    await parseAsync(file),
  ]);
  return cloneAstWithOriginals(ast, source);
}
