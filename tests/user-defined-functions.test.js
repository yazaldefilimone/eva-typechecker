import { test } from "./utils.js"
import { Type  } from "../src/type.js";

export default (evaTypechecker) => {
  const code = `
    (def square ((x number)) -> number
      (* x x)
    )
    // (square 2)
  `;
  test(evaTypechecker, code, Type.formString(`Fn<number<number>>`));
  const complexFunction = `
    (def complexFunction ((x number) (y number)) -> number
      (begin
        (var z 30)
        (+ (* x y) z)
      )
    )
    // (complexFunction  0 20)
  `;

  test(evaTypechecker, complexFunction, Type.formString(`Fn<number<number,number>>`));


  // function call

  const functionCall = `
    (def square ((x number)) -> number
      (* x x)
    )
    (square 2)
  `;

  test(evaTypechecker, functionCall, Type.number);


  const functionCallWithComplexFunction = `
    (def complexFunction ((x number) (y number)) -> number
      (begin
        (var z 30)
        (+ (* x y) z)
      )
    )
    (complexFunction  0 20)
  `;

  test(evaTypechecker, functionCallWithComplexFunction, Type.number);

}