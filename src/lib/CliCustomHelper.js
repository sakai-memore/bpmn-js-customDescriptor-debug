import CliHelper from './CliHelper';
import $ from 'jquery';

String.prototype.htmlEscape = function() {
  return $('<div/>').text(this.toString()).html();
};

class CliCustomeHelper {

  _cliHelper;

  aryCONS_TASK_CATEGORY = [
    "Activity",
    "Task",
    "SubProcess",
    "Transaction",
  ]
  /********
   * constractor 
   */
  constructor(cliHelper) {
    this._cliHelper = cliHelper;
  }

  /********
   * 4. getElementBPropsExtension(exElm: extensionElement, elm_prop:string) : string (json_str) 
   *      ex) const EX_PROP_NAME = 'concerns'; // elm_prop
   */
  getElementBPropsExtension(exElm, elm_prop) {
    let retStr = exElm[elm_prop]
    return retStr
  }
  
  /********
   * 5. setElementBPropsExtension(exElm: extensionElement, elm_prop:string, jsonObj: object) : void */
  setElementBPropsExtensionObject(exElm, elm_prop, jsonObj) {
    exElm[elm_prop] = JSON.stringify(jsonObj).htmlEscape();
  }
  
  /********
   * 6. getElementBPropsExtensionObject(exElm: extensionElement) : object(obj parsed form jsonStr) */
  getElementBPropsExtensionObject(exElm, elm_prop) {
    let retObj = {};
    let jsonStr = this.getElementBPropsExtension(exElm, elm_prop);
    // console.log(`jsonStr = ${jsonStr}`)
    if(jsonStr){
      try {
        retObj = JSON.parse(jsonStr);
      } catch(e) {
        console.log(`JSON.parse errer: ${jsonStr}`)
        console.log(e);
        retObj = {}
      }
    } else {
      retObj = {}
    }
    return retObj
  }
  
  /********
   * 7. getElementsBPropsExtensionObject(elm_category: string, elm_type) : object[] */ // const EX_ELEMENT_NAME = 'tra:ConcernList';
  async getElementsBPropsExtensionObject(elm_category, elm_type, elm_prop) {
    let retAry = [];
    let tempAry = [];
    let obj = {};
    // 
    if (this.aryCONS_TASK_CATEGORY.includes(elm_category)) {
      tempAry = await this._cliHelper.getElemetsIds(elm_category);
      // console.log(tempAry)
      // 
      // If using async/await, can not use Array.map()
      for (let keyObj of tempAry) {
        let { extensionElements }  = this._cliHelper.getExtensionElementsAll(keyObj.id, elm_type);
        let extensionElement = this._cliHelper.getExtensionElement(extensionElements, elm_type)
        
        obj = this.getElementBPropsExtensionObject(extensionElement, elm_prop)
        // console.log(obj);
        if (obj){
          retAry.push(obj);
        }
      }
    }
    return retAry
  }
  
  async getElementsHaveConcerns(elm_category, elm_type, elm_prop) {
    let retAry = [];
    let tempAry = [];
    let obj = {};
    // 
    if (this.aryCONS_TASK_CATEGORY.includes(elm_category)) {
      tempAry = await this._cliHelper.getElemetsIds(elm_category);
      // console.log(tempAry)
      // 
      // If using async/await, can not use Array.map()
      for (let keyObj of tempAry) {
        let { extensionElements }  = this._cliHelper.getExtensionElementsAll(keyObj.id, elm_type);
        let extensionElement = this._cliHelper.getExtensionElement(extensionElements, elm_type)
        
        obj = this.getElementBPropsExtensionObject(extensionElement, elm_prop)
        // console.log(obj);
        if (obj){
          retAry.push(keyObj.id);
        }
      }
    }
    return retAry
  }
  
}

export default CliCustomeHelper;

