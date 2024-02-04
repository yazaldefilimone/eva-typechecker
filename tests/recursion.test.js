import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {

  const factorial = `
  (def factorial ((n number)) -> number
    (if (== n 0)
      1
      (* n (factorial (- n 1)))
    )
  )

  (factorial 5)
  `
  test(evaTypechecker, factorial, Type.number);
}