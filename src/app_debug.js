import $ from 'jquery';
// import $ from './lib/jQuery.classList';
import 'bootstrap';

import DataUtil from  './lib/DataUtil';
import HbsUtil from  './lib/HbsUtil';
import Dto from  './lib/FormDto';
// import Dto from  './lib/FormDtoDummy';

import { togglePanel } from './lib/togglePanel';
import { registerFileDrop } from './lib/registerFileDrop';
import { saveLocal } from './lib/saveLocal';

// -- Custom Modeler
import { CustomBpmnModelerFactory } from "./modeler/CustomBpmnModelerFactory.js";
import { CustomBpmnViewerFactory } from "./viewer/CustomBpmnViewerFactory.js";

// import { getBusinessObject } from './modeler/util/ModelUtil';

import CliHelper from  './lib/CliHelper.js';
import CliCustomHelper from  './lib/CliCustomHelper.js';


// import './style.css';

// display a diagram: render xml data on canvas ------------------ //
const displayDiagram = async (xml_data) => {
  try {
    // console.log(xml_data);
    const result = bpmnJs.importXML(xml_data);
    const { warnings } = result;
  
  } catch (err) {
    console.log(err.message, err.warnings);
    alert('could not import BPMN 2.0 XML, see console');
  }
}

// draw canvas: display diagram and set variables ---------------- //
const drawCanvas = async (bpmnXML) => {

  // import xml into canvas
  await displayDiagram(bpmnXML);
  
  // get diagram objects
  const canvas = bpmnJs.get("canvas");
  const overlays = bpmnJs.get("overlays");
  const eventBus = bpmnJs.get("eventBus");
  const elementRegistry = bpmnJs.get("elementRegistry");
  const moddle = bpmnJs.get('moddle');
  const modeling = bpmnJs.get('modeling'); // only modeler
  
  // zoom to fit full viewport
  canvas.zoom('fit-viewport');
  
  // for debug
  window.canvas = canvas; // public on window for debug
  window.overlays = overlays; // public on window for debug
  window.eventBus = eventBus; // public on window for debug
  window.elementRegistry = elementRegistry; // public on window for debug
  window.moddle = moddle; // public on window for debug
  window.modeling = modeling; // public on window for debug
  
  // create Helper class
  let cliHelper = new CliHelper(elementRegistry, moddle, modeling);
  await debug(eventBus, cliHelper);

}

// debug entry                                    ---------------- //
const debug = async (eventBus, cliHelper) => {
  
  // getElementsBProperties -- debug
  let taskElms = await cliHelper.getElementsBProperties('Task');
  console.log(`taskElms = ${JSON.stringify(taskElms)}`)
  
  // getElementsAll -- debug
  let {
      element, 
      bo, 
      extensionElements }  = cliHelper.getExtensionElementsAll('SCAN_QR_CODE', EX_ELEMENT_NAME);
  let extensionElement = cliHelper.getExtensionElement(extensionElements, EX_ELEMENT_NAME)
  // console.log(extensionElement)
  // console.log(extensionElements)
  // console.log(bo)
  
  // customCliHelper -- debug
  const cCliHelper = new CliCustomHelper(cliHelper);
  let str = cCliHelper.getElementBPropsExtensions(extensionElement);
  let obj = cCliHelper.getElementBPropsExtensionsObject(extensionElement);
  console.log(bo);
  console.log(str);
  console.log(obj);
  // let ary = await cCliHelper.getElementsBPropsExtensionsObject('Task', EX_ELEMENT_NAME)
  // console.log(ary)  -- FIXME: error on json.parse
  
  
  /** element contextmenu(right click) event
  */
  eventBus.on('element.contextmenu', HIGH_PRIORITY, async (elm) => {
    elm.originalEvent.preventDefault();
    elm.originalEvent.stopPropagation();
    
    // ignore elements not in a task category
    let isIncludes = await cliHelper.includes(elm.element.id, 'Task');
    if (!isIncludes) {
      console.log(`this element is not in task category: ${elm.element.id}`);
      return;
    } 
    
    // html element operation
    document.getElementById('form-div').classList.remove('hidden');
    
    // set the element id
    let id = elm.element.id;
    $("#element-id").text(id);
    
    // get element - businessObject - extensionElements - extentionElement
    const target_type = EX_ELEMENT_NAME;
    let {
      element, 
      bo, 
      extensionElements } = cliHelper.getExtensionElementsAll(id, target_type);
    let extensionElement = cliHelper.getExtensionElement(extensionElements, target_type)
    
    // prepare data for html element from extensionElements.extensionElement
    const jsonObj = Dto.convertfromExtElm(id, bo, extensionElement);
    // console.log(jsonObj)
    
    // assign values for html element
    const score = jsonObj.score;
    const concerns = jsonObj.concerns;
    const inputDate = jsonObj.inputDate;
    
    // html element operation
    $('#score').val(score);
    $('#concerns').text(concerns);
    $('#inputDate').text(inputDate);
    $('#score').focus();
    // 
    // console.log(`score = "${score}"`);
    // console.log(`#score = "${$('#score').val()}"`)
    console.log(`#concerns = "${$('#concerns').val()}"`)
    // console.log(`inputDate = "${inputDate}"`);
  });
  
  /** form submit event
  */
  // set suitability core and last checked if user submits
  $('#form').on('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // get form data
    const score = $('#score').val();
    const concerns = $('#concerns').val();
    // console.log(`score = ${score}`)
    if (isNaN(Number(score))) {
      return;
    }
    // get the element id
    let id = $("#element-id").text();
    
    // get element - businessObject - extensionElements - extentionElement
    const target_type = EX_ELEMENT_NAME;
    let {
      element, 
      bo, 
      extensionElements } = cliHelper.getExtensionElementsAll(id, target_type);
    let extensionElement = cliHelper.getExtensionElement(extensionElements, target_type)
    
    // console.log(extensionElement);
    // prepare extensionElement
    const jsonObj = {
      'inputDate': new Date().toISOString(),
      'concerns': concerns,
    }
    extensionElement = Dto.converttoExtElm(extensionElement, jsonObj); // FIXME
    // extensionElement.checkedDate = new Date().toISOString();
    // console.log(extensionElement);
    
    // prepare properties json object for updating
    const objProps = {
      extensionElements,
      score: score
    }
    
    // FIXME : can not update extensionElements
    cliHelper.updateProperties(element, objProps);
    // console.log(bo)
    
    // operate html element
    document.getElementById('form-div').classList.add('hidden');;
  });
  
}


const addListener = () => {
  // // Event- Actions
  $("#btn_saveLocal").on("click", {bpmnModeler: bpmnJs, fileName: INITIAL_XML_NAME}, saveLocal);
  $(".toggle-panel").on("click", togglePanel);
  //
  $("#btn_modal_form").on("click",()=>{
    console.log('#btn_modal_form clicked!');
    $("#modal-form").show();
  });
  // Event- Actions : drop a file
  const dropArea = $(EL_DROP_AREA);
  if (!window.FileList || !window.FileReader) {
    window.alert(
      'Looks like you use an older browser that does not support drag and drop. ' +
      'Try using Chrome, Firefox or the Internet Explorer > 10.');
  } else {
    registerFileDrop(dropArea, displayDiagram);
  }
  
  // close quality assurance if user presses escape
  $('#form').on('keydown', (event) => {
    if (event.key === 'Escape') {
      document.getElementById('form-div').classList.add('hidden');
    }
  });
  
  // validate suitability score  ---not use!
  // function validate(val) {
  //   const okayEl = document.getElementById('okay');
  //   const warningEl = document.getElementById('warning');
  //   // 
  //   if (isNaN(val)) {
  //     // warningEl.classList.remove('hidden');
  //     // okayEl.disabled = true;
  //   } else {
  //     warningEl.classList.add('hidden');
  //     okayEl.disabled = false;
  //   }
  // }
  
  
  // // hide quality assurance if user clicks outside
  // $('window').on('click', (event) => {
  //   // const { target } = event;
  //   if (event.target === document.getElementById('form-div') || document.getElementById('form-div').contains(event.target)) {
  //     return;
  //   }
  //   document.getElementById('form-div').classList.add('hidden');
  // });
  
  // // validate suitability score if user inputs value
  // $('#score').on('input', validate);
}

// ------------------------------// entry point
const root = async () => {
  console.log('// ----------------// start debug!');
  
  // get bpmn XML data
  const url = MEDIA_PATH + INITIAL_XML_NAME;
  console.log(`load from url: ${url}`);
  const bpmnXML = await DataUtil.fetchData(url);
  
  // render hbs
  $(EL_COMPONENTS).html(divComponents);
  for(let itm of aryHbsComponents) {
    console.log(`render ${itm.hbsPath} ...`);
    await HbsUtil.renderComponent(
      itm.el, 
      itm.hbsPath, 
      itm.data
    );
  }
  
  // 
  addListener();
  
  //
  await drawCanvas(bpmnXML);

}

//// helper ///////////////////////////////////////////
const get_instance = (mode) => {
  let retModule = {};
  let factory = {};
  
  factory = new CustomBpmnViewerFactory();
  retModule = factory.get_instance(EL_CANVAS2);
  
  if(mode === 'modeler') {
    factory = new CustomBpmnModelerFactory();
    retModule = factory.get_instance(EL_CANVAS, EL_PROPERTIES_PANEL_PARENT);
  }
  
  return retModule;
}

// -------------------------------------------// document.ready
// variables
const MEDIA_PATH = '../../media/xml/';
// const INITIAL_XML_NAME = 'initialDiagram.bpmn';
const INITIAL_XML_NAME = 'qr-code.bpmn';

const EL_CANVAS = "#js-canvas";
const EL_CANVAS2 = "#js-canvas2";
const EL_PROPERTIES_PANEL_PARENT = "#properties-panel-parent";
const EL_COMPONENTS = "#div-components";
const EL_DROP_AREA = "#row-main";
const EL_LINK_DOWNLOAD = "[data-download]";

const HIGH_PRIORITY = 1500;

const EX_ELEMENT_NAME = 'tra:ConcernList';

const aryHbsComponents = [
  {el: '#form-component', data: {}, hbsPath: './viewer/components/form-component.hbs'},
];
const divComponents = `
  <div id='form-component'></div>
`;

// let CONS_MODE = 'viewer'
let CONS_MODE = 'modeler'

let bpmnJs = {};
bpmnJs = get_instance(CONS_MODE);
bpmnJs.mode = CONS_MODE;
window.bpmnJs = bpmnJs; // public on window for debug
const cli = window.cli;
$(document).on('load', root());

