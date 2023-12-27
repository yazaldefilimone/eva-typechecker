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
    if (!this.record.hasOwnProperty(name)) {
      if (this.parent) {
        return this.parent.lookup(name);
      }
      throw new ReferenceError(`Variable ${name} is not defined`);
    }
    return this.record[name];
  }
  extend(record = {}) {
    return new TypeEnvironment(record, this);
  }
}
