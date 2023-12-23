import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  test(evaTypechecker, ["var", "x", 10], Type.number);
  test(evaTypechecker, ["x"], Type.number);
  // global variable
  test(evaTypechecker, [`"VERSION"`], Type.string);
}