// import _ from 'lodash';
class Dto {
  // 
  static converttoExtElm = (exElm, jsonObj) => {
    // set exElm properties
    console.log(jsonObj)
    // _.merge(exElm, jsonObj)
    exElm.inputDate = jsonObj.inputDate;
    exElm.concerns = jsonObj.concerns;
    console.log(exElm)
    return exElm;
  }
  // 
  static convertfromExtElm = (id, bo, exElm) => {
    console.log(exElm)
    let inputDate = '' // string date
    if(exElm.inputDate){
      inputDate = exElm.inputDate;
    } else {
      inputDate = '-'
    }
    let jsonObj = {
      id : id,
      score: bo.score ? bo.score : '',
      inputDate: inputDate,
      concerns: exElm.concerns, 
      // checked_date: exElm ? exElm.checkedDate: '-'
    }
    console.log(jsonObj)
    return jsonObj;
  }
}

export default Dto;
