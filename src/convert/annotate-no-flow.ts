import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { TransformerInput } from "./transformer";
import { addCommentsAtHeadOfNode } from "./utils/common";

/**
 * Inserts @ts-nocheck at the top of a converted no-Flow file
 */
export function annotateNoFlow({ file }: TransformerInput) {
  traverse(file, {
    Program(path) {
      // Handles empty files where no node is present
      if (path.node.body.length === 0) {
        path.node.body.push(t.emptyStatement());
      }

      const rootNode: t.Node = path.node.body[0];

      addCommentsAtHeadOfNode(rootNode, [
        // @ts-expect-error missing start, end, loc
        {
          value: `@ts-nocheck`,
          type: "CommentLine",
        },
      ]);
    },
  });
}
