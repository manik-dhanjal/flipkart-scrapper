const scraper = require('./pageScrapper.scrapper');

const handleReadMoreBtn = async (page) => {
    const isReadMoreBtnExist = await page.$('._1WMVGk')
    if(!isReadMoreBtnExist) return null;
    
    await page.$eval('._1WMVGk',(readMore)=>{
        readMore.click()
    })
    return null;
}

const findSubCategories = async (page) => {

        if(!await page.$('a._2SqgSY')) return [];

        await handleReadMoreBtn(page);
        const listOfSubCategory = await page.$$eval('a._2SqgSY',categories => {
            categories = categories.map(el =>{
                return{
                    link:el.href,
                    name:el.innerHTML
                }
            })
            return categories;
        })
   
        return listOfSubCategory
}
const scrapedCategory = async (page,browser,url) =>{
    try{
    await page.goto(url);
    } catch(err){
        console.log(err.message,'Category goto method')
        return {
            name:'',
            products:[],
            children:[],
            error:err.message
        }
    }
    try{
        await page.waitForSelector('._2aDURW',{timeout:6000})
    }catch(err){
        console.log(err,'in Category Page')
        page.reload();
    }
    const rootDataObj = {};
    const listOfSubCategories = await findSubCategories(page)
    if(!listOfSubCategories.length){
        const {link,name} = await page.$eval('._1jJQdf',(category) => {
            return {
                link:category.href,
                name:category.innerHTML
            }
        })
       
        return {
            name:name,
            products:await scraper(page,browser,link),
            children:[]
        }
    }
    const dataArr = [];
    for(category of listOfSubCategories){
        dataArr.push( {
            name:category.name,
            child:await scrapedCategory(page,browser,category.link),
            products:[]
        })
    }
    return dataArr
}
const categoryScrapper =(browser,rootUrl) => new Promise(async (resolve,reject) => {
    let page = await browser.newPage();
    await page.setViewport({
        width: 1300,
        height: 600
    })
    const everthing =await scrapedCategory(page,browser,rootUrl)
    await page.close();
    resolve(everthing)
})



module.exports = categoryScrapper