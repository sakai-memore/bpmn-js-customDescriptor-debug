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
   * 4. getElementBPropsExtensions(exElm: extensionElement) : string (json_str) */
  getElementBPropsExtensions(exElm) {
    let retStr = exElm.concerns
    return retStr
  }
  
  /********
   * 5. setElementBPropsExtensions(id: string, jsonObj: object) : void */
  setElementBPropsExtensions(id, jsonObj, elm_type, elm_target) {
    let { extensionElements }  = this._cliHelper.getExtensionElementsAll(id, elm_type);
    let extensionElement = this._cliHelper.getExtensionElement(extensionElements, elm_type)
    extensionElement[elm_target] = JSON.stringify(jsonObj).htmlEscape();
  }
  
  /********
   * 6. getElementBPropsExtensionsObject(id: string) : object */
  getElementBPropsExtensionsObject(exElm) {
    let retObj = {};
    let jsonStr = this.getElementBPropsExtensions(exElm);
    if(jsonStr == ""){
      retObj = {}
    } else {
      retObj = JSON.parse(jsonStr);
    }
    return retObj
  }
  
  /********
   * 7. getElementsBPropsExtensionsObject(elm_category: string) : object[] */
  async getElementsBPropsExtensionsObject(elm_category, elm_type) {
    let retAry = [];
    let tempAry = [];
    let obj = {};
    // 
    if (this.aryCONS_TASK_CATEGORY.includes(elm_category)) {
      tempAry = await this._cliHelper.getElemetsIds(elm_category);
      console.log(tempAry)
      // 
      // If using async/await, can not use Array.map()
      for (let keyObj of tempAry) {
        let { extensionElements }  = this._cliHelper.getExtensionElementsAll(keyObj.id, elm_type);
        let extensionElement = this._cliHelper.getExtensionElement(extensionElements, elm_type)
        
        obj = this.getElementBPropsExtensionsObject(extensionElement)
        console.log(obj);
        if (obj){
          retAry.push(obj);
        }
      }
    }
    return retAry
  }
  
}

export default CliCustomeHelper;

