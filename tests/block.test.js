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
    ]
  ]
  test(evaTypechecker, astCode, Type.number);
}