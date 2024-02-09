import { readdirSync } from "node:fs";
import path from "node:path";

import {  EvaTypechecker } from "../src/eva-typechecker.js";

const evaTypeChecker = new EvaTypechecker();
function loadFileWithEndsWith(path, endsWith){
  const files = readdirSync(path);
  const tests = files.filter(file => file.endsWith(endsWith));
  return tests;
}
async function autoLoadTests() {
  const cwd = path.resolve(process.cwd(), 'tests');
  const tests = loadFileWithEndsWith(cwd, ".test.js");
  for (const test of tests) {
    // console.log(`running ${test}`);
    const testModule = await import(path.resolve(cwd, test));
    testModule.default(evaTypeChecker);
  }
  console.log("All tests passed!");
}

autoLoadTests().catch((error) => {
  if (process.argv0.includes('node')) {
    const errorRed = `\x1b[31m${`error`}\x1b[0m: ${error}`
    console.log(errorRed);
    process.exit(1);
  }
  throw error;
})