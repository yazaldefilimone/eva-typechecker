import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const WhileExpression = `
    (var x 10)
    (while (!= x 0)
      (set x (+ x 1)
    ))
  `
  test(evaTypechecker, WhileExpression, Type.number);
}