import { exec, test } from "./utils.js"
import { Type } from "../src/type.js";

export default (evaTypechecker) => {
  const generics = `
  (def generic <T> ((n1 T) (n2 T)) -> T
    (+ n1 n2)
  )
  `
  exec(evaTypechecker, generics);
 test(evaTypechecker, "(generic <number> 5 5)", Type.number);
  test(evaTypechecker, `(generic <string> "Hello, " "World")`, Type.string);

  // const lambdaNumberGenerics = `
  // ((lambda <T> ((n T)) -> T  (+ n 1)) <number> 10)
  // `
  // const lambdaStringGenerics = `
  // ((lambda <T> ((n T)) -> T  (+ n " World")) <string> "Hello")
  // `
  // test(evaTypechecker, lambdaNumberGenerics ,Type.number);
  // test(evaTypechecker, lambdaStringGenerics, Type.string);



  const testFn =  `
  (def test <T> ((t T)) -> number
    (* t 2)
  )
  (test 10)
  `
  test(evaTypechecker, testFn, Type.number)


  // complex infer type 

// todo: fix order of infer type: 
// error: Expected string type for string in  test,10,"hello" but got number
// maybe:
/// error: Expected number type for string in  test,10,"hello" but got string
// 
  const complexInferType = `
  (def test <T> ((type T) (n T)) -> T
    (+ 1 1)
  )
  (test 10 10)
  `
  test(evaTypechecker, complexInferType, Type.number)
}