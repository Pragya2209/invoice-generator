const REACT_APP_API_ENDPOINT = 'https://invoice-generator-w0vq.onrender.com'//process.env.REACT_APP_API_ENDPOINT

function getMessage(responeObj) {
    let message = responeObj.message
    if (typeof responeObj.error === 'string')
        message = responeObj.error
    return message
}

const siginInApi = async (requestObj) => {
    const response = await fetch(REACT_APP_API_ENDPOINT + '/api/user/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObj),
    });

    let responeObj = await response.json()
    return { data: responeObj.data, status: response.status, message: getMessage(responeObj) };
}

const getUserDetails = async () => {
    const response = await fetch(REACT_APP_API_ENDPOINT + '/api/user/getUserDetails', {
        method: 'GET',
        headers: { Authorization: ` ${localStorage.usertoken}` }
    });

    let responeObj = await response.json()
    return { data: responeObj.data, status: response.status, message: responeObj.message || responeObj.error };
}

const createInvoice = async (requestObj) => {
    const response = await fetch(REACT_APP_API_ENDPOINT + '/api/invoice/createInvoice', {
        method: 'POST',
        headers: { 
            Authorization: ` ${localStorage.usertoken}`,
           'Content-Type': 'application/json'
         },
        body: JSON.stringify(requestObj)
    });
    return response
    let responeObj = await response.json()
    return { data: responeObj.data, status: response.status, message: responeObj.message || responeObj.error };
}


const getList = async () => {
    const response = await fetch(REACT_APP_API_ENDPOINT + '/api/invoice/getList', {
        method: 'GET',
        headers: { Authorization: ` ${localStorage.usertoken}` }
    });

    let responeObj = await response.json()
    return { data: responeObj.data, status: response.status, message: responeObj.message || responeObj.error };
}

const getInvoiceList = async () => {
    const response = await fetch(REACT_APP_API_ENDPOINT + '/api/invoice/getInvoiceList', {
        method: 'GET',
        headers: { Authorization: ` ${localStorage.usertoken}` }
    });

    let responeObj = await response.json()
    return { data: responeObj.data, status: response.status, message: responeObj.message || responeObj.error };
}

export {
    getInvoiceList,
    createInvoice,
    siginInApi,
    getUserDetails,
    getList,
}