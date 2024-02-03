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

    if (this._isBooleanBinary(expression)) {
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

    if (this._isKeyword(expression, 'if')) {
      const [_tag, test, consequent, alternate] = expression;
      const testType = this.checker(test, env);
      this._expect(testType, Type.boolean, test, expression);
      const consequentType = this.checker(consequent, env);
      const alternateType = this.checker(alternate, env);
      return this._expect(consequentType, alternateType, expression, expression);
    }
    if (this._isKeyword(expression, 'while')) {
      const [_tag, test, body] = expression;
      const testType = this.checker(test, env);
      this._expect(testType, Type.boolean, test, expression);
      const bodyType = this.checker(body, env);
      return bodyType
    }

    if (this._isKeyword(expression, 'def')) {
      console.log({expression})
      // (def name (params) -> returnType body)
      const [_tag, name, fnParams, _retDel, fnReturn,fnBody] = expression;
      const fnType = this._typeCheckFunction(fnParams, fnReturn, fnBody, env);
      return  env.define(name, fnType);
    }

    if (this._isVariable(expression)) {
      return env.lookup(expression);
    }

    throw `Unknown type for expression: ${expression}`;
  }
  _typeCheckFunction(fnParams, fnReturn, fnBody, env) {
    console.log({fnParams, fnReturn, fnBody, env})
    const returnType = Type.formString(fnReturn);
    const record = {};
    const paramsType = [];
    for (const param of fnParams) {
      const [paramName, paramType] = param;
      const type = Type.formString(paramType);
      record[paramName] = type;
      paramsType.push(type);
    }
    const fnEnv = env.extend(record);

    const actualReturnType = this.checker(fnBody, fnEnv);
    console.log({actualReturnType, returnType})
    if (!returnType.equals(actualReturnType)) {
      throw `Expected function ${fnBody} to return ${returnType}, but got ${actualReturnType}`;
    }
    return new Type.Function({
      paramsType,
      returnType,
    });
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
  _isBooleanBinary(expression) {
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
