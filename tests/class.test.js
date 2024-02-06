import { Type } from "../src/type.js"
import { test } from "./utils.js"

export default function(evaTypeChecker) {

  const classTestCode = `
  (class Point  null 
    (begin
      (var (x number) 0)
      (def constructor ((self Point) (x number)) -> Point
        (begin
          (set (prop self x) x)
          self
        )
      )
      (def sum ((self Point) (num number)) -> number 
        (begin
          (+ (prop self x) num)
        )
      ) 
    )
  )
  (var (point Point) (new Point 10))

  ((prop point sum) point 10)
  `
  test(evaTypeChecker, classTestCode, Type.number)
}