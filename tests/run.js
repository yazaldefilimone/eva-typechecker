import assert from "node:assert";
import {  EvaTypechecker } from "../src/eva-typechecker.js";
import { Type } from "../src/type.js";



const evaTypechecker = new EvaTypechecker();

assert.deepEqual(evaTypechecker.checker(10), Type.number);
assert.deepEqual(evaTypechecker.checker('"hello"'), Type.string);
console.log("All tests passed!")