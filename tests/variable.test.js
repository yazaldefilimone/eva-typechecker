import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  test(evaTypechecker, ["var", "x", 10], Type.number);
  test(evaTypechecker, "x", Type.number);
  test(evaTypechecker, ["var", ["y", "string"], `"hello"`], Type.string);
  test(evaTypechecker, "y", Type.string);
  test(evaTypechecker, ["var", ["y", "string"], 10], Type.string);
  // global variable
  test(evaTypechecker, `VERSION`, Type.string);
}