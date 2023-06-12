import childProcess from "child_process";
import * as t from "@babel/types";
import path from "path";

/**
 * Actually executes `flow type-at-pos`. This will be called behind a throttle.
 */
export async function executeFlowTypeAtPos(
  filePath: string,
  location: t.SourceLocation
): Promise<string> {
  let flowBin = "$(yarn bin)/flow",
    rootDir = process.cwd(),
    relFilePath = filePath;
  if (!process.env.JEST_WORKER_ID) {
    ({ default: flowBin } = await import(
      require.resolve("flow-bin", {
        paths: [path.dirname(filePath)],
      })
    ));
    rootDir = flowBin.replace(/\/node_modules.*/, "");
    relFilePath = path.relative(rootDir, filePath);
  }
  const { line, column } = location.start;
  const command = `${flowBin} type-at-pos "${relFilePath}" ${line} ${
    column + 1
  } --json --from "typescriptify" --quiet`;

  // Actually run Flow...
  const stdout = await new Promise<string>((resolve, reject) => {
    childProcess.exec(command, { cwd: rootDir }, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
  return stdout;
}
