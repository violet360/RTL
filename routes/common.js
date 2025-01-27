var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var common = {};
const MONTHS = [{name: 'JAN', days: 31}, {name: 'FEB', days: 28}, {name: 'MAR', days: 31}, {name: 'APR', days: 30}, {name: 'MAY', days: 31}, {name: 'JUN', days: 30}, {name: 'JUL', days: 31}, {name: 'AUG', days: 31}, {name: 'SEP', days: 30}, {name: 'OCT', days: 31}, {name: 'NOV', days: 30}, {name: 'DEC', days: 31}];
var dummy_data_array_from_file = [];

common.rtl_conf_file_path = '';
common.rtl_pass = '';
common.rtl_secret2fa = '';
common.rtl_sso = 0;
common.port = 3000;
common.host = null;
common.rtl_cookie_path = '';
common.logout_redirect_link = '';
common.cookie = '';
common.secret_key = crypto.randomBytes(64).toString('hex');
common.nodes = [];
common.selectedNode = {};
common.read_dummy_data = false;

common.getSwapServerOptions = () => {
  let swapOptions = {
    url: common.selectedNode.swap_server_url,
    rejectUnauthorized: false,
    json: true,
    headers: {
      'Grpc-Metadata-macaroon': ''
    }
  };
  if (common.selectedNode.swap_macaroon_path) {
    try {
      swapOptions.headers = {'Grpc-Metadata-macaroon': fs.readFileSync(path.join(common.selectedNode.swap_macaroon_path, 'loop.macaroon')).toString('hex')};
    } catch(err) {
      console.error('Loop macaroon Error: ' + JSON.stringify(err));
    }
  }
  return swapOptions;
};

common.getBoltzServerOptions = () => {
  let boltzOptions = {
    url: common.selectedNode.boltz_server_url,
    rejectUnauthorized: false,
    json: true,
    headers: {
      'Grpc-Metadata-macaroon': ''
    }
  };
  if (common.selectedNode.boltz_macaroon_path) {
    try {
      boltzOptions.headers = {'Grpc-Metadata-macaroon': fs.readFileSync(path.join(common.selectedNode.boltz_macaroon_path, 'admin.macaroon')).toString('hex')};
    } catch(err) {
      console.error('Boltz macaroon Error: ' + JSON.stringify(err));
    }
  }
  return boltzOptions;
};

common.getSelLNServerUrl = () => {
  return common.selectedNode.ln_server_url;
};

common.getOptions = () => {
  common.selectedNode.options.method = common.selectedNode.ln_implementation.toUpperCase() !== 'ECL' ? 'GET' : 'POST';
  delete common.selectedNode.options.form;
  common.selectedNode.options.qs = {};
  return common.selectedNode.options;
};

common.updateSelectedNodeOptions = () => {
  if (!common.selectedNode) {
    common.selectedNode = {};
  }
  common.selectedNode.options = {
    url: '',
    rejectUnauthorized: false,
    json: true,
    form: null
  };
  try {
    if (common.selectedNode && common.selectedNode.ln_implementation) {
      switch (common.selectedNode.ln_implementation.toUpperCase()) {
        case 'CLT':
          common.selectedNode.options.headers = { 'macaroon': Buffer.from(fs.readFileSync(path.join(common.selectedNode.macaroon_path, 'access.macaroon'))).toString("base64") };
          break;
      
        case 'ECL':
          common.selectedNode.options.headers = { 'authorization': 'Basic ' + Buffer.from(':' + common.selectedNode.ln_api_password).toString('base64') };
          break;

        default:
          common.selectedNode.options.headers = { 'Grpc-Metadata-macaroon': fs.readFileSync(path.join(common.selectedNode.macaroon_path, 'admin.macaroon')).toString('hex') };
          break;
      }
    }
    return { status: 200, message: 'Updated Successfully!' };
  } catch(err) {
    common.selectedNode.options = {
      url: '',
      rejectUnauthorized: false,
      json: true,
      form: null
    };
    console.error('Common Update Selected Node Options Error:' + JSON.stringify(err));    
    return { status: 502, message: err };
  }
}

common.setOptions = () => {
  if ( common.nodes[0].options &&  common.nodes[0].options.headers) { return; }
  if (common.nodes && common.nodes.length > 0) {
    common.nodes.forEach(node => {
      node.options = {
        url: '',
        rejectUnauthorized: false,
        json: true,
        form: null
      };
      try {
        if (node.ln_implementation) {
          switch (node.ln_implementation.toUpperCase()) {
            case 'CLT':
              node.options.headers = { 'macaroon': Buffer.from(fs.readFileSync(path.join(node.macaroon_path, 'access.macaroon'))).toString("base64") };
              break;
          
            case 'ECL':
              node.options.headers = { 'authorization': 'Basic ' + Buffer.from(':' + node.ln_api_password).toString('base64') };
              break;

            default:
              node.options.headers = { 'Grpc-Metadata-macaroon': fs.readFileSync(path.join(node.macaroon_path, 'admin.macaroon')).toString('hex') };
              break;
          }
        }
      } catch (err) {
        console.error('Common Set Options Error:' + JSON.stringify(err));
        node.options = {
          url: '',
          rejectUnauthorized: false,
          json: true,
          form: ''
        };
      }
    });
    common.updateSelectedNodeOptions();        
  }
}

common.findNode = (selNodeIndex) => {
  return common.nodes.find(node => node.index == selNodeIndex);
}

common.replaceNode = (selNodeIndex, newNode) => {
  let foundIndex = common.nodes.findIndex((node) => node.index == selNodeIndex);
  common.nodes.splice(foundIndex, 1, newNode);
  common.selectedNode = common.findNode(selNodeIndex);
}

common.convertTimestampToTime = (num) => {
  let myDate = new Date(+num * 1000);
  let days = myDate.getDate().toString();
  days = +days < 10 ? '0' + days : days;
  let hours = myDate.getHours().toString();
  hours = +hours < 10 ? '0' + hours : hours;
  let minutes = myDate.getMinutes().toString();
  minutes = +minutes < 10 ? '0' + minutes : minutes;
  let seconds = myDate.getSeconds().toString();
  seconds = +seconds < 10 ? '0' + seconds : seconds;
  return days + "/" + MONTHS[myDate.getMonth()].name + "/" + myDate.getFullYear() + " " + hours + ":" + minutes + ":" + seconds;
};

common.sortAscByKey = (array, key) => {
  return array.sort(function (a, b) {
    var x = +a[key]; var y = +b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

common.sortDescByKey = (array, key) => {
  const temp = array.sort(function (a, b) {
    var x = +a[key] ? +a[key] : 0; var y = +b[key] ? +b[key] : 0;
    return (x > y) ? -1 : ((x < y) ? 1 : 0);
  });
  return temp;
}

common.sortAscByStrKey = (array, key) => {
  return array.sort(function (a, b) {
    var x = a[key] ? a[key].toUpperCase() : ''; var y = b[key] ? b[key].toUpperCase() : '';
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

common.sortDescByStrKey = (array, key) => {
  const temp = array.sort(function (a, b) {
    var x = a[key] ? a[key].toUpperCase() : ''; var y = b[key] ? b[key].toUpperCase() : '';
    return (x > y) ? -1 : ((x < y) ? 1 : 0);
  });
  return temp;
}

common.newestOnTop = (array, key, value) => {
  var index = array.findIndex(function (item) {
    return item[key] === value
  });
  var newlyAddedRecord = array.splice(index, 1);
  array.unshift(newlyAddedRecord[0]);
  return array;
}

common.handleError = (errRes, fileName, errMsg) => {
  let err = JSON.parse(JSON.stringify(errRes));
  switch (common.selectedNode.ln_implementation) {
    case 'LND':
      if (err.options && err.options.headers && err.options.headers['Grpc-Metadata-macaroon']) {
        delete err.options.headers['Grpc-Metadata-macaroon'];
      }
      if (err.response && err.response.request && err.response.request.headers && err.response.request.headers['Grpc-Metadata-macaroon']) {
        delete err.response.request.headers['Grpc-Metadata-macaroon'];
      }
      break;

    case 'CLT':
      if (err.options && err.options.headers && err.options.headers.macaroon) {
        delete err.options.headers.macaroon;
      }
      if (err.response && err.response.request && err.response.request.headers && err.response.request.headers.macaroon) {
        delete err.response.request.headers.macaroon;
      }
      break;

    case 'ECL':
      if (err.options && err.options.headers && err.options.headers.authorization) {
        delete err.options.headers.authorization;
      }
      if (err.response && err.response.request && err.response.request.headers && err.response.request.headers.authorization) {
        delete err.response.request.headers.authorization;
      }
      break;

    default:
      if (err.options && err.options.headers) { delete err.options.headers; }
      break;
  }
  const msgStr = '\r\n[' + new Date().toISOString() + '] ERROR: ' + fileName + ' => ' + errMsg + ': ' + (typeof err === 'object' ? JSON.stringify(err) : (typeof err === 'string') ? err : 'Unknown Error');
  console.error(msgStr);
  if (common.selectedNode) { fs.appendFile(common.selectedNode.log_file, msgStr, () => {}) }
  const newErrorObj = {
    statusCode: err.statusCode ? err.statusCode : err.status ? err.status : (err.error && err.error.code && err.error.code === 'ECONNREFUSED') ? 503 : 500,
    message: (err.error && err.error.message) ? err.error.message : err.message ? err.message : errMsg, 
    error: (
      (err.error && err.error.error && err.error.error.error && typeof err.error.error.error === 'string') ? err.error.error.error : 
      (err.error && err.error.error && typeof err.error.error === 'string') ? err.error.error : 
      (err.error && err.error.error && err.error.error.message && typeof err.error.error.message === 'string') ? err.error.error.message :
      (err.error && err.error.message && typeof err.error.message === 'string') ? err.error.message :
      (err.message && typeof err.message === 'string') ? err.message :
      (err.error) ? err.error : (typeof err === 'string') ? err : 'Unknown Error'
    )
  };
  return newErrorObj;
}

common.getRequestIP = (req) => {
  return (typeof req.headers['x-forwarded-for'] === 'string' && req.headers['x-forwarded-for'].split(',').shift())
    || req.ip
    || req.connection.remoteAddress
    || req.socket.remoteAddress
    || (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

common.getDummyData = (data_key) => {
  let dummyDataFile = common.rtl_conf_file_path +  common.path_separator + 'ECLDummyData.log';
  return new Promise(function(resolve, reject) {
    if (dummy_data_array_from_file.length === 0) {
      fs.readFile(dummyDataFile, 'utf8', function(err, data) {
        if (err) {
          if (err.code === 'ENOENT') {
            console.error('Dummy data file does not exist!');
          } else {
            console.error('Getting dummy data failed!');
          }
        } else {
          dummy_data_array_from_file = data.split('\n');
          resolve(filterData(data_key));
        }
      });
    } else {
      resolve(filterData(data_key));
    }
  });
}

common.getMonthDays = (selMonth, selYear) => {
  return (selMonth === 1 && selYear%4 === 0) ? (MONTHS[selMonth].days+1) : MONTHS[selMonth].days;
}

filterData = (data_key) => {
  let search_string = '';
  if (common.selectedNode.ln_implementation === 'ECL') {
    switch (data_key) {
      case 'GetInfo': search_string = 'INFO: GetInfo => Get Info Response: '; break;
      case 'Fees': search_string = 'INFO: Fees => Fee Response: '; break;
      case 'Payments': search_string = 'INFO: Fees => Payments Response: '; break;
      case 'Invoices': search_string = 'INFO: Invoice => Invoices List Received: '; break;
      case 'OnChainBalance': search_string = 'INFO: Onchain => Balance Received: '; break;
      case 'Peers': search_string = 'INFO: Peers => Peers with Alias: '; break;
      case 'Channels': search_string = 'INFO: Channels => Simplified Channels with Alias: '; break;
      default: search_string = 'Random Line'; break;
    }
  } else if (common.selectedNode.ln_implementation === 'CLT') {
    switch (data_key) {
      case 'GetInfo': search_string = 'DEBUG: GetInfo => Node Information. '; break;
      case 'Fees': search_string = 'DEBUG: Fees => Fee Received. '; break;
      case 'Payments': search_string = 'DEBUG: Payments => Payment List Received: '; break;
      case 'Invoices': search_string = 'DEBUG: Invoice => Invoices List Received. '; break;
      case 'ChannelBalance': search_string = 'DEBUG: Channels => Local Remote Balance. '; break;
      case 'Peers': search_string = 'DEBUG: Peers => Peers with Alias: '; break;
      case 'Channels': search_string = 'DEBUG: Channels => List Channels: '; break;
      case 'Balance': search_string = 'DEBUG: Balance => Balance Received. '; break;
      case 'ForwardingHistory': search_string = 'DEBUG: Channels => Forwarding History Received: '; break;
      case 'UTXOs': search_string = 'DEBUG: OnChain => List Funds Received. '; break;
      case 'FeeRateperkb': search_string = 'DEBUG: Network => Network Fee Rates Received for perkb. '; break;
      case 'FeeRateperkw': search_string = 'DEBUG: Network => Network Fee Rates Received for perkw. '; break;
      default: search_string = 'Random Line'; break;
    }
  }
  let foundDataLine = dummy_data_array_from_file.find(dataItem => dataItem.includes(search_string));
  let dataStr = foundDataLine ? foundDataLine.substring((foundDataLine.indexOf(search_string)) + search_string.length) : '{}';
  return JSON.parse(dataStr);
}

module.exports = common;