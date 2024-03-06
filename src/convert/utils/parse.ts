import * as t from "@babel/types";
import { jsParser } from "babel-parse-wild-code";
import { cloneAstWithOriginals } from "./cloneAstWithOriginals";
import fs from "fs-extra";
import path from "path";

export async function parse(file: string): Promise<t.File> {
  file = path.resolve(file);
  const source = await fs.readFile(file, "utf8");
  const ast = jsParser.parse(source);
  return cloneAstWithOriginals(ast, source);
}
