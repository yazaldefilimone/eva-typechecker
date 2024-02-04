import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const sumInternal = `
    (sum 10 20)
  `
  test(evaTypechecker, sumInternal, Type.number);

  const squareInternal = `
    (square 10)
  `;

  test(evaTypechecker, squareInternal, Type.number);
}