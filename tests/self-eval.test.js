import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  test(evaTypechecker, 10, Type.number);
  test(evaTypechecker, '"hello"', Type.string);
}