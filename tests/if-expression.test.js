import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const code = `(<= 1 2)`;
  test(evaTypechecker, code, Type.number);
}