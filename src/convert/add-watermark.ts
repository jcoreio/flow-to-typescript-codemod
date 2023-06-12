import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { TransformerInput } from "./transformer";
import {
  addCommentsAtHeadOfNode,
  addEmptyLineInProgramPath,
} from "./utils/common";

/**
 * Adds a watermark at the top of a file
 * @param state
 * @param file
 */
export function addWatermark({ state, file }: TransformerInput) {
  traverse(file, {
    Program(path) {
      addEmptyLineInProgramPath(path);

      // Handles empty files where no node is present
      if (path.node.body.length === 0) {
        path.node.body.push(t.emptyStatement());
      }

      const rootNode: t.Node = path.node.body[0];

      addCommentsAtHeadOfNode(rootNode, [
        // @ts-expect-error missing start, end, loc
        {
          value: `* ${state.config.watermark} `,
          type: "CommentBlock",
        },
        // @ts-expect-error missing start, end, loc
        {
          value: `* ${state.config.watermarkMessage}`,
          type: "CommentBlock",
        },
      ]);
    },
  });
}
