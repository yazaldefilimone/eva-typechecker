import { Type } from './type.js';
import { TypeEnvironment } from './type-environment.js';

export class EvaTypechecker {
  constructor() {
    this.global = this._createGlobalEnv();
  }

  checkerGlobal(expression) {
    return this._checherGlobal(expression, this.global);
  }
  _checherGlobal(expression, env) {
    if (this._isKeyword(expression, 'begin')) {
      return this._checkerBlock(expression, env);
    }
    return this.checker(expression, env);
  }
  // infering and
  checker(expression, env = this.global) {
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

    /**
     * Boolean true
     * Boolean false
     **/
    if (this._isBoolean(expression)) {
      return Type.boolean;
    }

    if (this._isBoolanBinary(expression)) {
      return this._booleanBinary(expression, env);
    }

    if (this._isBinary(expression)) {
      return this._Binary(expression, env);
    }

    if (this._isKeyword(expression, 'var')) {
      return this._variableDeclaration(expression, env);
    }

    if (this._isKeyword(expression, 'begin')) {
      const blockEnv = env.extend();
      return this._checkerBlock(expression, blockEnv);
    }

    if (this._isKeyword(expression, 'set')) {
      const [_tag, refName, value] = expression;
      const refType = this.checker(refName, env);
      const valueType = this.checker(value, env);
      return this._expect(refType, valueType, value, expression);
    }

    if (this._isVariable(expression)) {
      return env.lookup(expression);
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
  _Binary(expression, env) {
    this._checkArity(expression, 2);
    const [operator, left, right] = expression;
    const leftType = this.checker(left, env);
    const rightType = this.checker(right, env);
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
  _booleanBinary(expression, env) {
    this._checkArity(expression, 2);
    const [operator, left, right] = expression;
    const leftType = this.checker(left, env);
    const rightType = this.checker(right, env);
    this._expect(leftType, rightType, left, expression);
    return Type.boolean;
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

  _createGlobalEnv() {
    return new TypeEnvironment({
      VERSION: Type.string,
    });
  }
  _isBoolanBinary(expression) {
    switch (expression[0]) {
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '==':
      case '!=':
        return true;
      default:
        return false;
    }
  }
  _variableDeclaration(expression, env) {
    const [_tag, nameExpression, value] = expression;
    const type = this.checker(value);
    if (Array.isArray(nameExpression)) {
      const [variableName, typeString] = nameExpression;
      const atualTypeName = Type.formString(typeString);
      this._expect(atualTypeName, type, variableName, expression);
      return env.define(variableName, type);
    }
    return env.define(nameExpression, type);
  }
  _isVariable(expression) {
    if (typeof expression !== 'string') {
      return false;
    }
    return /^[+\-*/<>=a-zA-Z0-9_:]*$/.test(expression);
  }
  _checkerBlock(block, env) {
    const [_tag, ...expressions] = block;
    let lastType = null;
    for (const expression of expressions) {
      lastType = this.checker(expression, env);
    }
    return lastType;
  }
  _throw(atualType, expectedType, value, expression) {
    throw `Expected ${atualType} type for ${value} in  ${expression} but got ${expectedType}\n`;
  }
  _isNumber(expression) {
    return typeof expression === 'number';
  }
  _isBoolean(expression) {
    return typeof expression === 'boolean' || expression === 'true' || expression === 'false';
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
  _isKeyword(expression, keyword) {
    return expression[0] === keyword;
  }
}
