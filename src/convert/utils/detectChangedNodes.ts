import * as t from "@babel/types";
import { NodePath } from "@babel/traverse";
import { original } from "./symbols";
import { isEqual } from "lodash";

export default function detectChangedNodes(path: NodePath): void {
  for (const field of Object.keys(t.NODE_FIELDS[path.node.type])) {
    if (field === "type") continue;
    const fieldValue = path.get(field);
    if (Array.isArray(fieldValue)) {
      for (let i = 0; i < fieldValue.length; i++) {
        const child = fieldValue[i];
        if (typeof child.node?.type === "string") detectChangedNodes(child);
      }
    } else if (typeof fieldValue.node?.type === "string") {
      detectChangedNodes(fieldValue);
    }
  }
  const { node } = path;
  // @ts-expect-error symbol monkeypatched on
  const orig = node[original];
  if (orig && !t.isNodesEquivalent(node, orig)) {
    let parent: NodePath | null = path;
    while (parent) {
      if (parent.node) {
        // @ts-expect-error symbol monkeypatched on
        delete parent.node[original];
      }
      parent = parent.parentPath;
    }
  }
}
