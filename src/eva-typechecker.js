import { Type } from './type.js';
import { TypeEnvironment } from './type-environment.js';
const regexGeneric = /<.*>/;
const regexGenericExtract = /<(.*)>/;
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
      const [_tag, condition, consequent, alternate] = expression;
      const conditionType = this.checker(condition, env);
      this._expect(conditionType, Type.boolean, condition, expression);
      // let record = env;
      if (this._isNarrowingCondition(condition)) {
        const [name, specific] = this._getSpecifiedType(condition);
        // record = new TypeEnvironment({ [name]: Type.formString(specific) }, record);
        // todo fix: both branches should return the same type
        const record = { [name]: Type.formString(specific) };
        return this.checker(consequent, env.extend(record));
      }

      const consequentType = this.checker(consequent, env);
      const alternateType = this.checker(alternate, env);
      return this._expect(alternateType, consequentType, expression, expression);
    }
    if (this._isKeyword(expression, 'while')) {
      const [_tag, condition, body] = expression;
      const conditionType = this.checker(condition, env);
      this._expect(conditionType, Type.boolean, condition, expression);
      const bodyType = this.checker(body, env);
      return bodyType;
    }

    if (this._isKeyword(expression, 'def')) {
      const [_tag, name, fnParams, _retDel, fnReturn] = expression;
      const lambdaFunction = this._transformFunctionDeclarationToLambda(expression);
      if (!this._isGenericsDefFunction(expression)) {
        const paramsType = fnParams.map(([_, type]) => Type.formString(type));
        const fnType = new Type.Function({
          paramsType,
          returnType: Type.formString(fnReturn),
        });
        env.define(name, fnType);
      }
      // before checking the function body, we need to know the function's type
      return this.checker(lambdaFunction, env);
    }
    if (this._isKeyword(expression, 'lambda')) {
      // (lambda (params) -> returnType body)
      if (!this._isGenericsLambda(expression)) {
        return this._typeCheckerSimpleFunction(expression, env);
      }
      return this._typeCheckerGenericFunction(expression, env);
    }

    // (type name base) // (type uuidType (or string number))
    if (this._isKeyword(expression, 'type')) {
      const [_tag, name, base] = expression;
      if (Type.hasOwnProperty(name)) {
        throw `type ${name} already defined.`;
      }
      if (typeof base === 'object' && base[0] === 'or') {
        const refs = base.slice(1);
        const types = refs.map((type) => Type.formString(type));
        const union = new Type.Union({
          name,
          types,
        });
        Type[name] = union;
        return union;
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

    if (this._isKeyword(expression, 'new')) {
      const [_tag, className, ...args] = expression;
      const classType = this.checker(className, env);
      if (!classType) {
        throw `Unknown class ${className}.`;
      }
      const argsType = args.map((arg) => this.checker(arg, env));
      const constructorType = classType.getField('constructor');

      if (!constructorType && args.length > 0) {
        throw `class ${className} does not have a constructor.`;
      }

      argsType.unshift(classType);

      return this._typeCheckerFunctionCall(constructorType, argsType, expression, env);
    }
    if (this._isVariable(expression)) {
      return env.lookup(expression);
    }

    // function call
    if (Array.isArray(expression)) {
      // (fn 10)
      const fnName = expression[0];
      let fnArgs = expression.slice(1);
      let fnType = this.checker(fnName, env);
      if (fnType instanceof Type.GenericFunction) {
        const extractRefGeneric = this._extractAtualCallType(expression);
        const genericsTypeMap = this._getGenericsMap(fnType.genericsType, extractRefGeneric);

        const [boundParamsType, boundReturnType] = this._bindFunctionType(
          genericsTypeMap,
          fnType.paramsType,
          fnType.returnType,
        );
        // todo: pre-install to type combine_string, combine_number, etc!
        fnType = this._typeCheckerFunction(boundParamsType, boundReturnType, fnType.fnBody, fnType.env);
        fnArgs = expression.slice(2);
      }
      const fnArgsType = fnArgs.map((arg) => this.checker(arg, env));
      return this._typeCheckerFunctionCall(fnType, fnArgsType, expression, env);
    }

    throw `Unknown type for expression: ${expression}`;
  }
  _bindFunctionType(genericsTypeMap, paramsType, returnType) {
    const actualParamsType = [];

    for (let index = 0; index < paramsType.length; index++) {
      let [name, type] = paramsType[index];
      if (genericsTypeMap.has(type)) {
        type = genericsTypeMap.get(type);
      }
      actualParamsType.push([name, type]);
    }

    let actualReturnType = returnType;
    if (genericsTypeMap.has(returnType)) {
      actualReturnType = genericsTypeMap.get(returnType);
    }
    return [actualParamsType, actualReturnType];
  }
  _getGenericsMap(generics, extractRefGeneric) {
    const genericsTypeMap = new Map();
    for (const [index, generic] of generics.entries()) {
      genericsTypeMap.set(generic, extractRefGeneric[index]);
    }
    return genericsTypeMap;
  }
  _extractAtualCallType(expression) {
    const [, generics] = expression;
    const data = regexGenericExtract.exec(generics);
    if (!data) throw `No actual type providing in generic type: ${expression}`;
    return data[1].split(',');
  }

  // todo: implement   (if __ (== (typeof wordOrNum) "string")...
  _isNarrowingCondition(condition) {
    const [operator, lhs] = condition;
    return operator === '==' && lhs[0] === 'typeof';
  }
  // todo: implement  (if__ (== (typeof wordOrNum) "string")...
  _getSpecifiedType(condition) {
    const [_operator, [_typeof, name], specific] = condition;
    return [name, specific.slice(1, -1)];
  }
  _typeCheckerFunctionCall(fnType, argsType, expressions, env) {
    const paramsType = fnType.paramsType;
    if (paramsType.length !== argsType.length) {
      throw `Expected ${paramsType.length} arguments, but got ${argsType.length}`;
    }
    const returnType = fnType.returnType;
    argsType.forEach((argType, index) => {
      if (paramsType[index] === Type.any) {
        return;
      }
      this._expect(argType, paramsType[index], argsType[index], expressions);
    });
    return returnType;
  }
  _transformFunctionDeclarationToLambda(expressions) {
    if (this._isGenericsDefFunction(expressions)) {
      const [_tag, name, generics, fnParams, _retDel, fnReturn, fnBody] = expressions;
      return ['var', name, ['lambda', generics, fnParams, _retDel, fnReturn, fnBody]];
    }
    const [_tag, name, fnParams, _retDel, fnReturn, fnBody] = expressions;
    return ['var', name, ['lambda', fnParams, _retDel, fnReturn, fnBody]];
  }

  _typeCheckerSimpleFunction(expressions, env) {
    const [_tag, fnParams, _retDel, fnReturn, fnBody] = expressions;
    return this._typeCheckerFunction(fnParams, fnReturn, fnBody, env);
  }
  _typeCheckerGenericFunction(expressions, env) {
    const [_tag, generics, fnParams, _retDel, fnReturn, fnBody] = expressions;
    return new Type.GenericFunction({
      generics: generics.slice(1, -1),
      fnParams,
      fnReturn,
      fnBody,
      env,
    });
  }

  _typeCheckerFunction(fnParams, fnReturn, fnBody, env) {
    const returnType = Type.formString(fnReturn);
    const record = {};
    const paramsType = [];
    for (const [paramName, paramType] of fnParams) {
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
    const isUnion = _type instanceof Type.Union;
    if (isUnion && _type.includesAll(allowedTypes)) {
      return;
    }
    if (!isUnion && allowedTypes.some((t) => t.equals(_type))) {
      return;
    }
    throw `Unexpected type ${_type} in ${expression}, allowed: ${allowedTypes}`;
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
      throw `Expected ${arity} arguments, but got ${argsSize}`;
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
      // internal functions // fn<returnType<paramsType>>
      sum: Type.formString('Fn<number<number,number>>'),
      square: Type.formString('Fn<number<number>>'),
      typeof: Type.formString('Fn<string<any>>'),
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
  // (def name <T> (params) -> returnType body)
  _isGenericsDefFunction(expression) {
    return expression.length === 7 && regexGeneric.test(expression[2]);
  }
  // (lambda <T> (params) -> returnType body)
  _isGenericsLambda(expression) {
    return expression.length === 6 && regexGeneric.test(expression[1]);
  }
  _variableDeclaration(expression, env) {
    const [_tag, nameExpression, value] = expression;
    const type = this.checker(value);
    if (Array.isArray(nameExpression)) {
      const [variableName, typeString] = nameExpression;
      const atualType = Type.formString(typeString);
      this._expect(atualType, type, variableName, expression);
      return env.define(variableName, atualType);
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
