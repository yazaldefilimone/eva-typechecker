import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  let squareLambda = `
  (lambda ((x number)) -> number (+ x 10))
  `
  test(evaTypechecker, squareLambda, Type.formString('Fn<number<number>>'));
}