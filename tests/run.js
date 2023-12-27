import { readdirSync } from "node:fs";
import path from "node:path";

import {  EvaTypechecker } from "../src/eva-typechecker.js";

const evaTypechecker = new EvaTypechecker();
function loadFileWithEndsWith(path, endsWith){
  const files = readdirSync(path);
  const tests = files.filter(file => file.endsWith(endsWith));
  return tests;
}
async function autoLoadTests() {
  const cwd = path.resolve(process.cwd(), 'tests');
  const tests = loadFileWithEndsWith(cwd, ".test.js");
  
  for (const test of tests) {
    const testModule = await import(path.resolve(cwd, test));
    testModule.default(evaTypechecker);
  }
  console.log("All tests passed!");
}

autoLoadTests().catch((error) => {
  console.error(error);
  process.exit(1);
})