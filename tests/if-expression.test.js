import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const code = `(<= 1 2)`;
  test(evaTypechecker, code, Type.boolean);
  const ifExpression = `
    (if (<= 1 2)
      (+ 1 2)
      (- 1 2))
  `
  test(evaTypechecker, ifExpression, Type.number);
}