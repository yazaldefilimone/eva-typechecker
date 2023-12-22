import { Type } from './type.js';

export class EvaTypechecker {
  // infering and
  checker(expression) {
    /**
     * Number 10
     */

    if (this._isNumber(expression)) {
      return Type.number;
    }

    /**
     * String "hello"
     */

    if (this._isString(expression)) {
      return Type.string;
    }

    if (this._isBinary(expression)) {
      return this._Binary(expression);
    }
    throw `Unknown type for sexpression: ${expression}`;
  }

  _getOperandTypesForOperator(operator) {
    switch (operator) {
      case '+':
        return [Type.number, Type.string];
      case '-':
        return [Type.number];
      case '*':
        return [Type.number];
      case '/':
        return [Type.number];
      default:
        throw `Unknown operator ${operator}`;
    }
  }
  _Binary(expression) {
    this._checkArity(expression, 2);
    const [operator, left, right] = expression;
    const leftType = this.checker(left);
    const rightType = this.checker(right);
    const suporteType = this._getOperandTypesForOperator(operator);
    this._expectTypesOperator(leftType, suporteType, expression);
    this._expectTypesOperator(rightType, suporteType, expression);
    return this._expect(leftType, rightType, right, expression);
  }

  _expectTypesOperator(_type, allowedTypes, expression) {
    if (!allowedTypes.some((currentType) => currentType.equals(_type))) {
      throw `Unexpected type ${_type} in ${expression}, allowed: ${allowedTypes}`;
    }
  }
  _checkArity(expression, arity) {
    const argsSize = expression.length - 1;
    if (argsSize !== arity) {
      this._throw(atualType, expectedType, value, expression);
    }
  }

  _expect(atualType, expectedType, value, expression) {
    if (!atualType.equals(expectedType)) {
      throw this._throw(atualType, expectedType, value, expression);
    }
    return atualType;
  }

  _throw(atualType, expectedType, value, expression) {
    throw `Expected ${atualType} type for ${value} in  ${expression} but got ${expectedType}\n`;
  }
  _isNumber(expression) {
    return typeof expression === 'number';
  }
  _isString(expression) {
    if (typeof expression !== 'string') {
      return false;
    }
    return Boolean(expression.at(0) === '"' && expression.at(-1) === '"');
  }
  _isBinary(expression) {
    return /^[+\-*/]$/.test(expression[0]);
  }
}
