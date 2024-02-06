import { Type } from "../src/type.js"
import { test } from "./utils.js"

export default function(evaTypeChecker) {

  const classTestCode = `
  (class Point  null 
    (begin
      (def constructor ((self Point) (x number)) -> Point
        (begin
          // (set self.x x)
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

  // (def p (new Point 10))s
  10
  `
  test(evaTypeChecker, classTestCode, Type.number)
}