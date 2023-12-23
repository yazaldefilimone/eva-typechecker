export class TypeEnvironment {
  constructor(
    record = {
      VERSION: '0.0.1',
    },
    parent = null,
  ) {
    this.record = record;
    this.parent = parent;
  }

  define(name, _type) {
    this.record[name] = _type;
    return _type;
  }

  lookup(name) {
    if (this.record[name]) {
      return this.record[name];
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    throw `Undefined variable ${name}`;
  }
}
