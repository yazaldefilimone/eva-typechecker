import assert  from "node:assert";
import parser from "../src/parser.js";


export function exec(evaTypechecker, code){
  if(typeof code === "string"){
    code = parser.parse(`(begin ${code})`);
  }
  return evaTypechecker.checkerGlobal(code);
}


export function test(evaTypechecker, code, expected){
  const atual = exec(evaTypechecker, code);
  try {
    assert.strictEqual(atual.equals(expected), true);
  } catch (error) {
    console.log(`Expected  ${expected} type for ${code} but got ${atual}`)
    throw error;
  }
}