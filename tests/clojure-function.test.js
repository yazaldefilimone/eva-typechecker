import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const clojureFn = `
  (var global 10)

  (def buildSumFn ((x number)) ->  Fn<number<number>> 
    (begin 
      (var y 20)
      (def inner ((z number)) -> number
        (- (+ x z) global)
      )
      inner
    )
  )
  (var sum10 (buildSumFn 10))
  (sum10 20)
  `;

  test(evaTypechecker, clojureFn, Type.number);
}