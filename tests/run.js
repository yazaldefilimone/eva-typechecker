import assert from "node:assert";
import {  EvaTypechecker } from "../src/eva-typechecker.js";



const evaTypechecker = new EvaTypechecker();

assert.equal(evaTypechecker.checker(10), "number");
console.log("All tests passed!")