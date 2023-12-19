export class EvaTypechecker {
  // infering and 
  checker(expression){
    /**
     * Number 10
     */

    if(this._isNumber(expression)){
      return 'number'
    }
  }
  _isNumber(expression){
    return typeof expression === 'number'
  }
}