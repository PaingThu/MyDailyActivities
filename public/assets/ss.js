// function doPost(e) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//   var data = JSON.parse(e.postData.contents);

//   // Appends a new row with the data from the form
//   sheet.appendRow([data.user, data.type, data.date, data.time, data.distance, new Date()]);

//   return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
//     .setMimeType(ContentService.MimeType.JSON);
// }

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  // Remove the header row
  data.shift(); 
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// This function handles your 'fetch' POST request
const FUNCS = {
  'login' : '0001',
  'createTokenData': '0002'
};
function doPost(e) {
  try {
    // 1. Parse the incoming ID from your fetch body
    const data = JSON.parse(e.postData.contents);
    let result = {"status": null};
    if(data.status == FUNCS.login){
      // 2. Run the search
      result = login(data);
    }
    else if(data.status == FUNCS.createTokenData){
      result = createTokenData(data);
    }
    else{
      result = createData(data);
    }

    

    // 3. Return the result as JSON string
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    const data = JSON.parse(e.postData.contents);
    return ContentService.createTextOutput(JSON.stringify({ "error": err.message, "payload": data , "func" : FUNCS}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("activities"); 

  // Appends a new row with the data from the form
  sheet.appendRow([data.user, data.type, data.date, data.time, data.distance, new Date()]);

  return { "status": "success" };
}

function createTokenData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("mptkh001"); 

  const password = hashPassword(data.password);

  // Appends a new row with the data from the form
  sheet.appendRow([data.adminId, password, data.token, data.name, new Date()]);

  return { "status": "success" };
}

function login(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("mptkh001");
  const values = sheet.getDataRange().getValues();

  const id = data.adminId;
  const password = hashPassword(data.password);
  
  // Find the row where the ID (Column A / Index 0) matches
  const row = values.find(r => r[0] === id && r[1] === password);
  
  if (row) {
    return {
      "adminId": row[0],
      "name": row[3],
      "status": "success"
    };
  } else {
    return { "status": "not_found" };
  }
}


function hashPassword(password) {
  // 1. Compute the digest using SHA-256
  // This returns a byte array (signed integers)
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  
  // 2. Convert the byte array to a Hex string
  let hashHex = '';
  for (let i = 0; i < rawHash.length; i++) {
    let byte = rawHash[i];
    if (byte < 0) byte += 256; // Convert signed to unsigned
    let hex = byte.toString(16);
    if (hex.length == 1) hex = '0' + hex; // Pad with leading zero
    hashHex += hex;
  }
  
  return hashHex;
}