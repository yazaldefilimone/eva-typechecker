import { exec, test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const generics = `
  (def generic <T> ((n1 T) (n2 T)) -> T
    (+ n1 n2)
  )
  `

  exec(evaTypechecker, generics);

  // test(evaTypechecker, "(generics <number> 5 5)", Type.string);
  // test(evaTypechecker, `(generics <string> "Hello, " "World")`, Type.string);

  // const lambdaNumberGenerics = `
  // ((lambda <T> ((n T)) -> T  (+ n 1)) <number> 10)
  // `
  // const lambdaStringGenerics = `
  // ((lambda <T> ((n T)) -> T  (+ n " World")) <string> "Hello")
  // `
  // test(evaTypechecker, lambdaNumberGenerics ,Type.number);
  // test(evaTypechecker, lambdaStringGenerics, Type.string);
}