import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { TransformerInput } from "./transformer";

const flowComments = [
  "@flow",
  "$FlowFixMe",
  "$FlowIssue",
  "$FlowExpectedError",
  "$FlowIgnore",
];

/**
 * Scan through top level programs, or code blocks and remove Flow-specific comments
 */
const removeComments = (
  path: NodePath<t.Program> | NodePath<t.BlockStatement>
) => {
  if (path.node.body.length === 0) {
    return;
  }

  const nodes: Array<t.Node> = path.node.body;

  function processComments(
    comments: readonly t.Comment[] | null | undefined
  ): readonly t.Comment[] | null {
    return comments
      ? comments
          .filter(
            (comment) => !flowComments.some((c) => comment.value.includes(c))
          )
          .map((comment) => {
            if (comment.value.includes("@noflow")) {
              return {
                ...comment,
                value: comment.value.replace(/@noflow/, "@ts-nocheck"),
              };
            }

            return comment;
          })
      : null;
  }

  for (const rootNode of nodes) {
    rootNode.leadingComments = processComments(rootNode.leadingComments);
    rootNode.trailingComments = processComments(rootNode.trailingComments);
  }
};

/**
 * Search the top level program, and blocks like functions and if statements for comments
 */
export function removeFlowComments({ file }: TransformerInput) {
  traverse(file, {
    Program(path) {
      removeComments(path);
    },
    BlockStatement(path) {
      removeComments(path);
    },
  });
}
