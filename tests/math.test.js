import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  test(evaTypechecker, ["+", 1, 1], Type.number);
  test(evaTypechecker, ["-", 1, 2], Type.number);
  test(evaTypechecker, ["*", 1, 2], Type.number);
  test(evaTypechecker, ["/", 1, 2], Type.number);

  // strings 
  test(evaTypechecker, ["+", `"hello"`, `"world"`], Type.string);
  // test(evaTypechecker, ["-", `"hello"`, `"world"`], Type.string);

}