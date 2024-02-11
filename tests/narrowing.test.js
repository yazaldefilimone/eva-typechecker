import { exec, test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const narrowing = `
  (type T (or string number))
  (def narrowing ((SorN T)) -> T 
    (begin 
      (if (== (typeof SorN) "number")
        (- SorN 2)
        (+ "Hello " SorN)
      )
    )
  )
  `

  exec(evaTypechecker, narrowing);

  test(evaTypechecker, "(narrowing 5)", Type.string);
  test(evaTypechecker, `(narrowing "World")`, Type.string);
}