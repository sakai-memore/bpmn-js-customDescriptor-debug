class Dto {
  // 
  static converttoExtElm = (jsonObj, exElm) => {
    // set exElm properties
    // exElm.lastChecked = new Date().toISOString();
    return exElm;
  }
  // 
  static convertfromExtElm = (id, bo, exElm) => {
    let jsonObj = {
      id : id,
      score: 1234,
      inputDate: '22-03-29 15:00',
      concerns: "{ 'concern_type': 'security', 'content': 'check personal info'} ",
    }
    return jsonObj;
  }
}

export default Dto;
