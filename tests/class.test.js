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


  const classExtendsTestCode = `
  (class Point3D Point 
    (begin
      (var (z number) 0)
      (def constructor ((self Point3D) (x number) (z number)) -> Point3D
        (begin
          ((prop (super Point3D) constructor) self x)
          (set (prop self z) z)
          self
        )
      )

      (def calc ((self Point3D)) -> number 
        (begin
          (+ 
            ((prop (super Point3D) sum) self 10)
            (prop self z)
          )
          10
        )
      )
    )
  )

  (var (point3D Point3D) (new Point3D 10 20))
  ((prop point3D calc) point3D)
  `

  test(evaTypeChecker, classExtendsTestCode, Type.number)
}