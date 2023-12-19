import { Type } from './type';

export class EvaTypechecker {
  // infering and
  checker(expression) {
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

    throw new Error(`Unknown type for sexpression: ${expression}`);
  }
  _isNumber(expression) {
    return typeof expression === 'number';
  }
  _isString(expression) {
    if (typeof expression !== 'string') {
      return false;
    }
    return Boolean(expression.at(0) === '"' && expression.at(-1) === '"');
  }
}
