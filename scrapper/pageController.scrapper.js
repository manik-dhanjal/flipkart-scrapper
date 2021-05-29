
const categoryScrapper = require('./category.scrapper')
const scraper = require('./pageScrapper.scrapper')
const fs = require('fs');

const saveCategory = async (fileName,data) => {
    try{
        const dataStr = JSON.stringify(data,null,4)
        fs.writeFileSync(`../data/${fileName}.json`, dataStr);
        console.log('product data saved in products.json')
    }
    catch(error){
        console.log('Error while creating file',error)
    }
}

async function scrapeAll(browserInstance,scrapOn){
    console.log(scrapOn)
    let browser;
    try{
        browser = await browserInstance;

        const dataArr = [];
        for(var i = 0; i<scrapOn.length; i++){
            let {url,name} = scrapOn[i];
            const dataObj = await categoryScrapper(browser,url)
            dataArr.push({
                name:name,
                data:dataObj
            })
        }
        saveCategory('product-data',dataArr)
    
        // await scraper(browser,url);
        browser.close();
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance,scrapOn) => scrapeAll(browserInstance,scrapOn)