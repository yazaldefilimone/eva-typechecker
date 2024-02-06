import { TypeEnvironment } from './type-environment.js';

export class Type {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  toString() {
    return this.getName();
  }

  equals(type) {
    if (type instanceof Type.Alias) {
      return type.equals(this);
    }
    return this.name === type.name;
  }
  static formString(typeInStr) {
    if (this.hasOwnProperty(typeInStr)) {
      return this[typeInStr];
    }
    if (typeInStr.startsWith('Fn<')) {
      return Type.Function.formString(typeInStr);
    }
    throw `Unknown type: ${typeInStr}`;
  }
}

Type.number = new Type('number');
Type.boolean = new Type('boolean');
Type.string = new Type('string');
Type.null = new Type('null');

// meta type
Type.Function = class extends Type {
  constructor({ fnName = null, paramsType, returnType }) {
    super(fnName);
    this.paramsType = paramsType;
    this.returnType = returnType;
    this.name = this.getName();
  }
  /*
  return name: Fn<returnType<paramType1, paramType2, ...>> 
  Fn<number>: function that return a number
  Fn<number<number, number>>: function that return a number and receive two numbers
*/
  getName() {
    if (!this.name) {
      // lazy evaluation (but it's called only once, so maybe it's not a big deal)
      const name = ['Fn<', this.returnType.getName()];
      //  params
      const params = [];
      for (const param of this.paramsType) {
        params.push(param.getName());
      }
      if (params.length > 0) {
        name.push('<', params.join(','), '>');
      }
      name.push('>');
      return name.join('');
    }
    return this.name;
  }

  equals(otherType) {
    // it's possible to compare only the return type (better way to do it:)
    // return this.getName() === otherType.getName();
    if (this.name !== otherType.getName()) {
      return false;
    }
    if (!this.returnType.equals(otherType.returnType)) {
      return false;
    }
    if (this.paramsType.length !== otherType.paramsType.length) {
      return false;
    }
    for (let i = 0; i < this.paramsType.length; i++) {
      if (!this.paramsType[i].equals(otherType.paramsType[i])) {
        return false;
      }
    }
    return true;
  }
  // Fn<number> -> Type.number
  static formString(typeString) {
    if (this.hasOwnProperty(typeString)) {
      return this[typeString];
    }
    const fn = typeString.match(/Fn<(.+)<(.+)>>/);
    if (fn) {
      const [_, fnReturn, fnParams] = fn;
      const returnType = Type.formString(fnReturn);
      const params = fnParams.split(',');
      const paramsType = [];
      for (const param of params) {
        paramsType.push(Type.formString(param));
      }
      const type = new Type.Function({
        paramsType,
        returnType,
      });
      this[typeString] = type;
      return type;
    }
    throw `Unknown type: ${typeString}`;
  }
};

Type.Alias = class extends Type {
  constructor({ name, base }) {
    super(name);
    this.base = base;
  }
  equals(type) {
    if (this.name === type.name) {
      return true;
    }
    return this.base.equals(type);
  }
};

Type.Class = class extends Type {
  constructor({ name, superBaseType = Type.null }) {
    super(name);
    this.superBaseType = superBaseType;
    const superBaseTypeEnv = superBaseType !== Type.null ? superBaseType.env : null;
    this.env = new TypeEnvironment({}, superBaseTypeEnv);
  }
  // equals

  equals(otherType) {
    if (this === otherType) {
      return true;
    }

    if (otherType instanceof Type.Alias) {
      return otherType.equals(this);
    }

    if (this.superBaseType !== Type.null) {
      return this.superBaseType.equals(otherType);
    }

    return false;
  }

  getField(name) {
    return this.env.lookup(name);
  }
};
