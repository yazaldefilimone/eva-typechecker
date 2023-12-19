export class EvaTypechecker {
  // infering and
  checker(expression) {
    /**
     * Number 10
     */

    if (this._isNumber(expression)) {
      return 'number';
    }

    /**
     * String "hello"
     */

    if (this._isString(expression)) {
      return 'string';
    }

    throw new Error(`Unknown type for sexpression: ${expression}`);
  }
  _isNumber(expression) {
    return typeof expression === 'number';
  }
  _isString(expression) {
    return typeof expression === 'string';
  }
}
