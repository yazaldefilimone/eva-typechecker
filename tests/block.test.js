import { test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  test(evaTypechecker, 
  ["begin", 
  ["var", "x", 10],
  ["var", "y", 10],
  ["+", ["*", "x", 5], "y"]
  ], 
  Type.number);


  const astCode =  ["begin",
    ["var", "x", 10],
    ["begin", 
      ["var", "y", 10],
      ["+", ["*", "x", 5], "y"]
    ],
    ["set", "x", 10]
  ]
  test(evaTypechecker, astCode, Type.number);

  const code = `
    (var x 10)
    (begin
      (var y 10)
      (+ (* x 5) y)
    )
    (set x 10)
  `
  test(evaTypechecker, code, Type.number);


  const variableDeclaration = `
  (var x 10)
  `;
  test(evaTypechecker, variableDeclaration, Type.number);

  const binary = `
  (+ 10 x)
  `;
  test(evaTypechecker, binary, Type.number);
}