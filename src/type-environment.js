const defaultRecord = {
  VERSION: '0.0.1',
};

export class TypeEnvironment {
  constructor(record = defaultRecord, parent = null) {
    this.record = record;
    this.parent = parent;
  }

  define(name, _type) {
    this.record[name] = _type;
    return _type;
  }
  lookup(name) {
    return this.resolve(name).record[name];
  }

  resolve(name) {
    if (this.record.hasOwnProperty(name)) {
      return this;
    }
    if (!this.parent) {
      throw new ReferenceError(`Variable ${name} is not defined`);
    }
    return this.parent.resolve(name);
  }

  extend(record = {}) {
    return new TypeEnvironment(record, this);
  }
}
