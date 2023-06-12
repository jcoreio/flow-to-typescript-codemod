import * as t from "@babel/types";
import detectChangedNodes from "./detectChangedNodes";
import traverse, { NodePath } from "@babel/traverse";
import babelGeneratorHackReprint from "./babelGeneratorHackReprint";

export function print(ast: t.File): { code: string } {
  traverse(ast, {
    enter(path: NodePath) {
      detectChangedNodes(path);
      path.stop();
    },
  });
  return babelGeneratorHackReprint(ast);
}
