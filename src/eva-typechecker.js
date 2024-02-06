import { Type } from './type.js';
import { TypeEnvironment } from './type-environment.js';

export class EvaTypechecker {
  constructor() {
    this.global = this._createGlobalEnv();
  }

  checkerGlobal(expression) {
    return this._checkerBody(expression, this.global);
  }
  _checkerBody(expression, env) {
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
      // (set (prop self x) x)
      // (tag (tag, instance, propName) value)
      if (Array.isArray(refName) && refName[0] === 'prop') {
        // (prop self x)
        // (tag, instance, propName)
        const [_prop, refInstance, propName] = refName;

        const refInstanceType = this.checker(refInstance, env);
        const valueType = this.checker(value, env);

        const propType = refInstanceType.getField(propName);

        return this._expect(valueType, propType, value, expression);
      }

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
      return bodyType;
    }

    if (this._isKeyword(expression, 'def')) {
      // (def name (params) -> returnType body)
      const [_tag, name, fnParams, _retDel, fnReturn, fnBody] = expression;
      // TODO: syntax sugar for defining functions (transform to lambda and variable declaration)
      // pre-declare the function to allow recursion
      const paramsType = fnParams.map(([_, type]) => Type.formString(type));
      const fnType = new Type.Function({
        paramsType,
        returnType: Type.formString(fnReturn),
      });
      env.define(name, fnType);
      // before checking the function body, we need to know the function's type
      return this._typeCheckFunction(fnParams, fnReturn, fnBody, env);
    }
    if (this._isKeyword(expression, 'lambda')) {
      // (lambda (params) -> returnType body)
      const [_tag, fnParams, _retDel, fnReturn, fnBody] = expression;
      return this._typeCheckFunction(fnParams, fnReturn, fnBody, env);
    }

    if (this._isKeyword(expression, 'type')) {
      const [_tag, name, base] = expression;
      if (Type.hasOwnProperty(name)) {
        throw `type ${name} already defined: ${Type[name]}`;
      }
      if (!Type.hasOwnProperty(base)) {
        throw `Type ${base} does not defined.`;
      }

      Type[name] = new Type.Alias({
        name,
        base: Type[base],
      });
      return Type[name];
    }
    // class Point  null (...body)
    if (this._isKeyword(expression, 'class')) {
      const [_tag, name, superBase, body] = expression;
      const superBaseType = Type[superBase];
      const classType = new Type.Class({
        name,
        superBaseType,
      });

      Type[name] = env.define(name, classType);
      this._checkerBody(body, classType.env);
      return classType;
    }

    if (this._isKeyword(expression, 'new')) {
      const [_tag, name, ...args] = expression;
      const classType = Type[name];

      if (!classType) {
        throw `Unknown class ${className}.`;
      }

      const argsType = args.map((arg) => this.checker(arg, env));
      const constructorType = classType.getField('constructor');
      // add self type to the arguments
      argsType.unshift(classType);
      return this._typeCheckFunctionCall(constructorType, argsType, expression, env);
    }

    if (this._isKeyword(expression, 'prop')) {
      const [_tag, className, propName] = expression;
      const classType = this.checker(className, env);
      if (!classType) {
        throw `Unknown class ${className}.`;
      }
      return classType.getField(propName);
    }

    if (this._isKeyword(expression, 'super')) {
      const [_tag, className] = expression;
      const classType = Type[className];
      if (!classType) {
        throw `Unknown class ${className}.`;
      }
      const superBaseType = classType.superBaseType;
      // if (superBaseType === Type.null) {
      //   throw `Class ${className} does not have a super class.`;
      // }
      return superBaseType;
    }
    if (this._isVariable(expression)) {
      return env.lookup(expression);
    }

    if (Array.isArray(expression)) {
      // (fn 10)
      const [fn, ...args] = expression;
      const fnType = this.checker(fn, env);
      const actualArgsType = args.map((arg) => this.checker(arg, env));
      return this._typeCheckFunctionCall(fnType, actualArgsType, expression, env);
    }

    throw `Unknown type for expression: ${expression}`;
  }
  _typeCheckFunctionCall(fnType, argsType, expression, env) {
    const paramsType = fnType.paramsType;
    if (paramsType.length !== argsType.length) {
      throw `Expected ${paramsType.length} arguments, but got ${argsType.length}`;
    }
    const returnType = fnType.returnType;
    argsType.forEach((argType, index) => {
      this._expect(argType, paramsType[index], argsType[index], expression);
    });
    return returnType;
  }
  _typeCheckFunction(fnParams, fnReturn, fnBody, env) {
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
      // internal functions
      sum: Type.formString('Fn<number<number,number>>'),
      square: Type.formString('Fn<number<number>>'),
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
