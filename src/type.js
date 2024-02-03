export class Type {
  constructor(name) {
    this._name = name;
  }

  getName() {
    return this._name;
  }

  toString() {
    return this.getName();
  }

  equals(type) {
    return this._name === type.getName();
  }
  static formString(string) {
    if (this.hasOwnProperty(string)) {
      return this[string];
    }
    if (string.startsWith('Fn<')) {
      return Type.Function.formString(string);
    }
    throw `Unknown type: ${string}`;
  }
}

Type.number = new Type('number');
Type.boolean = new Type('boolean');
Type.string = new Type('string');

// meta type
Type.Function = class extends Type {
  constructor({fnName = null, paramsType, returnType}) {
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
    if (this.name === null) {
      const name = ['Fn<', this.returnType.getName()];
      //  params
      if (this.paramsType.length > 0) {
        const params = [];
        for (const param of this.paramsType) {
          params.push(param.getName());
        }
        name.push("<", params.join(','), '>');
      }
      name.push('>');
      this.name = name.join('');
    }
    return this.name;
  }

  equals(otherType) {
    // it's possible to compare only the return type
    // return this.getName() === type.getName();
    console.log({otherType})
    if (this.name !== otherType.getName()) {
      return false;
    }
    if (this.returnType.equals(otherType.returnType)) {
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
      const returnType = Type.formString(fn[1]);
      const params = fn[2].split(',');
      const paramsType = [];
      for (const param of params) {
        paramsType.push(Type.formString(param));
      }
      const type = new Type.Function({
        fnName:typeString, paramsType, returnType
      });
      this[typeString] = type;
      return type
    }
    throw `Unknown type: ${string}`;
  }
};
