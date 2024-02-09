import { exec, test  } from "./utils.js";
import {  Type }  from "../src/type.js";
export default  function(evaTypeChecker) {
  const unionTestCodeType = `
  (type uuidType (or string number))
  (type UID (or number string))
  `;

  const unionTestCode = `
  (var (x uuidType) "hello")
  x
  `
  exec(evaTypeChecker, unionTestCodeType)
  test(evaTypeChecker, unionTestCode, Type.string)

  test(evaTypeChecker, `
  (var (num UID) 123)
  num
  `, Type.string)
  test(evaTypeChecker, `
  num
  `, Type.number)
  test(evaTypeChecker, `
  x
  `, Type.uuidType)

  test(evaTypeChecker, `
  (var  (a UID) 123)
  (var  (b UID) "hello")
  (def process ((id UID)) -> number 
  (+ id b)
  )
  (process a)
  (+ a b)
  `, Type.number)
}