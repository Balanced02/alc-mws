/*  Base Url of api */
const baseUrl = 'https://free.currencyconverterapi.com/api/v5'

let state = {
  convertTo: '',
  convertFrom: '',
  amount: ''
}

/*  Utility Function for Calling Api */
const callApi = (url, data, method) => {
  console.log("Calling API... " + url);
  return new Promise(function(resolve, reject) {
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
  console.log(state)
}

/*  Fill UI Select buttons with currency values */
const fillSelectButtons = () => {
  getCurrencies().then(({results}) => {
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
        handleInputChange( className, value )
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
    callApi('/currencies').then(data => resolve(data)).catch(err => reject(err))
  })
}

/*  Convert Currency */
const convertCurrency = () => {
  let { amount, convertFrom, convertTo } = state
  check(state).then(checkResult => {
    if (checkResult === true) {
      convertFrom = encodeURIComponent(convertFrom)
      convertTo = encodeURIComponent(convertTo)
      let query = `${convertFrom}_${convertTo}`
      callApi(`/convert?q=${query}&compact=ultra`).then(data => {
        console.log(data)
        let conversionCurrency = Object.keys(data)
        let conversionRate = Object.values(data)
        let conversion = conversionRate[0] * Number(amount)
        sendOutputFeedback(`${conversion}`)
      }).then(err => console.log(err))
    }
  })
}

/*  Utility function to check values, takes an object */
function check (obj = {}) {
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
  output.innerHTML=value
}

window.onload = () => {
  fillSelectButtons()  
  addListenerToConvertButton()
  addListenerToAmountInputField()
}