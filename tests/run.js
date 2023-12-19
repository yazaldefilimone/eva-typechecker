import { readdirSync } from "node:fs";
import path from "node:path";

import {  EvaTypechecker } from "../src/eva-typechecker.js";


const evaTypechecker = new EvaTypechecker();

function loadFileWithEndsWith(path, endsWith){
  const files = readdirSync(path);

  return files.filter(file => file.endsWith(endsWith));
}
function autoLoadTests(){
  const cwd = path.resolve(process.cwd(), 'tests')
 const tests = loadFileWithEndsWith(cwd, ".test.js");
 const execPromise =  tests.map(async test => {
    const testModule = await import(path.resolve(cwd, test));
    testModule.default(evaTypechecker);
  });

  Promise.all(execPromise).then()
}

autoLoadTests();
console.log("All tests passed!")