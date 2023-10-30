import * as babelGenerator from "@babel/generator";
import * as t from "@babel/types";
import { original, source } from "./symbols";

const excludedNodeTypes = new Set([
  "File",
  // @babel/generator prints ` ${ and } around TemplateElement
  // even though their range doesn't include those characters
  "TemplateElement",
]);

export default function babelGeneratorHackReprint(node: t.Node): {
  code: string;
} {
  const { CodeGenerator, default: generate } = babelGenerator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gen: any = new CodeGenerator(node as any);
  if (gen._generator instanceof Object) {
    const Generator = gen._generator.constructor;
    class Reprinter extends Generator {
      constructor(
        ast: t.Node,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        opts: any = {},
        code?: string | { [filename: string]: string }
      ) {
        super(ast, opts, code);
      }
      print(
        node: t.Node | null,
        parent?: t.Node,
        noLineTerminatorAfter?: boolean,
        trailingCommentsLineOffset?: number,
        forceParens?: boolean
      ) {
        // Nodes with typeAnnotations are screwy in Babel...
        if (
          node &&
          !excludedNodeTypes.has(node.type) &&
          // @ts-expect-error symbol monkeypatched on
          !node.typeAnnotation
        ) {
          const orig =
            // @ts-expect-error symbol monkeypatched on
            node[original];
          const src =
            // @ts-expect-error symbol monkeypatched on
            node[source];
          if (orig && src) {
            const { start, end } = orig;
            if (Number.isInteger(start) && Number.isInteger(end)) {
              const origPrintMethod = this[node.type];
              try {
                // massive hack to override the node printing with
                // the original source formatting,
                // while letting @babel/generator decide if it needs
                // to wrap in parens etc
                this[node.type] = () =>
                  this._append(src.substring(start, end), false);
                super.print(
                  node,
                  parent,
                  noLineTerminatorAfter,
                  trailingCommentsLineOffset,
                  forceParens
                );

                return;
              } finally {
                this[node.type] = origPrintMethod;
              }
            }
          }
        }
        super.print(
          node,
          parent,
          noLineTerminatorAfter,
          trailingCommentsLineOffset,
          forceParens
        );
      }
    }
    return new Reprinter(node).generate(node);
  }
  return generate(node);
}
