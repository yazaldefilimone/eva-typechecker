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
      (def square ((self Point) (num number)) -> number 
        (begin
          (* num num)
        )
      ) 
    )
  )
  (var (point Point) (new Point 10))

  ((prop point square) point 10)
  `
  test(evaTypeChecker, classTestCode, Type.number)
}