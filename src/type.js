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
}

Type.number = new Type('number');
Type.string = new Type('string');
