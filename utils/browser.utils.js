const puppeteer = require('puppeteer')

const startBrowser =  async ()=>{
    let browser;
    try{
        console.log("Openning browser....")
        browser = await puppeteer.launch({
            'ignoreHTTPSErrors': true
        })
    }catch(error){
        console.log("Could not create a browser instance => : ",error)
    }
    return browser
}

module.exports = {
    startBrowser
}