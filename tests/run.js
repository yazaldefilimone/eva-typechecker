import assert from "node:assert";
import {  EvaTypechecker } from "../src/eva-typechecker.js";



const evaTypechecker = new EvaTypechecker();

assert.equal(evaTypechecker.checker(10), "number");
assert.equal(evaTypechecker.checker("hello"), "string");
assert.equal(evaTypechecker.checker(true), "boolean");
console.log("All tests passed!")