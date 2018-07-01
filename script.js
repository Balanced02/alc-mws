window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

/*  Base Url of api */
const baseUrl = 'https://free.currencyconverterapi.com/api/v5'

let db;
request = window.indexedDB.open("converter", 1);
request.onsuccess = event => {
  db = event.target.result
}
request.onupgradeneeded = event => {
  db = event.target.result
  let objectStore = db.createObjectStore("convertTable", {
    keyPath: "name"
  })
  objectStore.createIndex('name', 'name', {
    unique: false
  })
  objectStore.transaction.oncomplete = event => {
    let currencyTableStore = db.transaction('convertTable', 'readwrite').objectStore('convertTable')
  }
}

let state = {
  convertTo: '',
  convertFrom: '',
  amount: ''
}
/*  Utility Function for Calling Api */
const callApi = (url, data, method) => {
  console.log("Calling API... " + url);
  return new Promise(function (resolve, reject) {
    let options = {
      method: method || "GET",
    };
    if (method === "POST") {
      options.body = JSON.stringify(data);
    }
    fetch(baseUrl + url, options)
      .then(res => {
        if (res.ok) return res.json();
        reject(new Error(res.statusText));
      })
      .then(data => resolve(data))
      .catch(err => {
        reject(err);
      });
  });
};

/*  Utility Function to handle select change */
const handleInputChange = (key, value) => {
  state[key] = value
}

/*  Fill UI Select buttons with currency values */
const fillSelectButtons = () => {
  getCurrencies().then(({
    results
  }) => {
    let html = ''
    for (let key in results) {
      let obj = results[key]
      html += `<option value= ${obj.id} >  ${obj.currencyName } | ${obj.currencySymbol ? obj.currencySymbol : ''} </option>`
    }
    let currencySelector = document.getElementsByClassName('convert')
    Array.prototype.forEach.call(currencySelector, currencySelect => {
      currencySelect.addEventListener('change', () => {
        sendOutputFeedback('')
        let className = (currencySelect.className.split(' ')[0])
        let value = currencySelect.value
        handleInputChange(className, value)
      })
      currencySelect.innerHTML += html
    })
  }).catch(err => console.log(err))
}

/*  Get full list of currencies from api */
const getCurrencies = () => {
  return new Promise((resolve, reject) => {
    let options = {
      method: "GET",
    }
    callApi('/currencies').then(data => {
      resolve(data)
    }).catch(err => reject(err))
  })
}

/*  Convert Currency */
const convertCurrency = () => {
  let {
    amount,
    convertFrom,
    convertTo
  } = state
  check(state).then(checkResult => {
    if (checkResult === true) {
      convertFrom = encodeURIComponent(convertFrom)
      convertTo = encodeURIComponent(convertTo)
      let query = `${convertFrom}_${convertTo}`
      let req = db.transaction("convertTable").objectStore("convertTable").get(`${convertFrom}_${convertTo}`)
      req.onsuccess = event => {
        let result = req.result
        if (result) {
          showConversion(result, amount)
        } else
          callApi(`/convert?q=${query}&compact=ultra`).then(data => {
            data = {
              name: Object.keys(data)[0],
              rate: Object.values(data)[0]
            }
            let transaction = db.transaction(['convertTable'], "readwrite")
            transaction.oncomplete = event => {
              let currencyTableStore = db.transaction('convertTable', 'readwrite').objectStore('convertTable')
              currencyTableStore.add(
                data
              )
            }
            showConversion(data, amount)
          }).catch(err => sendOutputFeedback('Please, you have to be online for first conversion between currencies'))
      }
    }
  })
}

showConversion = (data, amount) => {
  console.log(data.rate)
  let conversion = data.rate * Number(amount)
  sendOutputFeedback(`${conversion}`)
}

/*  Utility function to check values, takes an object */
function check(obj = {}) {
  let checkArr = Object.values(obj)
  return new Promise((resolve, reject) => {
    for (let key in obj) {
      if (obj[key] === '') {
        sendOutputFeedback(`Please provide value for ${key}`)
      }
    }
    resolve(checkArr.every(each => each !== ''))
  })
}

/*  Add Listener to Convert Button  */
addListenerToConvertButton = () => {
  document.getElementsByClassName('currencySubmit')[0].addEventListener('click', () => {
    sendOutputFeedback('...getting conversion')
    convertCurrency()
  })
}

/*  Add Listener To Amount Input Field */
addListenerToAmountInputField = () => {
  let amountField = document.getElementsByClassName('currencyValue')[0]
  amountField.addEventListener('change', () => {
    handleInputChange('amount', amountField.value)
  })
}

/*  Utility Function to send output back to client */
sendOutputFeedback = (value) => {
  let output = document.getElementsByClassName('output')[0]
  output.innerHTML = value
}

window.onload = () => {
  fillSelectButtons()
  addListenerToConvertButton()
  addListenerToAmountInputField()
}