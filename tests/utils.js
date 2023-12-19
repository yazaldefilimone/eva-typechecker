import assert  from "node:assert";


export function exec(evaTypechecker, code){
  return evaTypechecker.checker(code);
}


export function test(evaTypechecker, code, expected){
  const atual = exec(evaTypechecker, code);
  try {
    assert.strictEqual(atual.equals(expected), true);
  } catch (error) {
    console.log(`Expected ${expected} type for ${code} but got ${atual}`)
    throw error;
  }
}