import { Type } from "../src/type.js";
import { test } from "./utils.js"

export  default (evaTypechecker) => {
  const alias = `
   (type int number)
   (type ID int)
   (type Index ID)
  `;

  test(evaTypechecker, alias, Type.number);

  const intAlias = `
   (def sum_int ((num int) (num2 int)) -> int (
      + num num2
   ))

   (sum 10 20)
  `;
  test(evaTypechecker, intAlias, Type.int);

  const idAlias = `
   (def sum_id ((num ID) (num2 ID)) -> ID (
      + num num2
   ))

   (sum_id 10 20)
  `;
  test(evaTypechecker, idAlias, Type.ID);

  const indexAlias = `
   (def sum_index ((num Index) (num2 Index)) -> Index (
      + num num2
   ))

   (sum_index 10 20)
  `;

  test(evaTypechecker, indexAlias, Type.Index);

  test(evaTypechecker, `
  (var (x int) 10)
  x
  `, Type.int);

  test(evaTypechecker, `x`, Type.ID);

  test(evaTypechecker, `x`, Type.Index);
}