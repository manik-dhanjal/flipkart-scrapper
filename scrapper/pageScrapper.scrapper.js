
const {reviewPage,reviewArrayParser,itrateOnReviewPages} = require('./review-page.scrapper')
const {performance} = require('perf_hooks');

    const scraper = async (page,browser,url) =>new Promise(async (resolve,reject) =>  {
        // let page = await browser.newPage();
    
        await page.setViewport({
            width: 1300,
            height: 600
        })
        await page.goto(url);
        const scrappedProducts = []
        var countPage = 1;
        var countProduct = 1;
        const maxNumberOfPages = 20;
        const maxNumberOfProducts = 1;
        async function scrapeCurrentPage(){
            const PageT0 = performance.now();
            console.log('Product collection page number: ',countPage)
            countPage++;
            if(await page.$('.ZVE96X')) await page.reload()
            try{
                await page.waitForSelector('._1YokD2',{timeout: 6000});
            }
            catch(e){
                await page.reload()
            }
            
            let urls = await page.$$eval('._1fQZEK,._4ddWXP>a:first-of-type', links => {
                //max number of products
                links = links.map(el => el.href)
                return links;
            });

            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.setViewport({
                    width: 1300,
                    height: 600
                })
                const timeBeforeFetch = performance.now()
                try{
                    await newPage.goto(link);
                    await newPage.waitForSelector('.B_NuCI',{timeout: 6000});
                }
                catch(e){
                    console.log('Error in product page',e)
                    await newPage.goto(link);
                }
                console.log('time to fetch the page: ',performance.now()-timeBeforeFetch)

                dataObj['title'] = await newPage.$eval('.B_NuCI', text => text.textContent);
                console.log('Scrapping Product: ',dataObj.title)
                dataObj.pricing = await newPage.evaluate(()=>{
                    
                    const sellingPriceCont = document.querySelector('._30jeq3')
                    const mrpCont = document.querySelector('._2p6lqe')
                    const discountCont = document.querySelector("._31Dcoz>span")

                    const priceParser = (div) => {
                        if(!div) return 0;
                        const alteredText = div.innerHTML.replace(/(<!--|-->|₹|,|(% off))/g,'');
                        return parseInt(alteredText);
                    }
                    return {
                        sellingPrice: priceParser(sellingPriceCont),
                        mrp: priceParser(mrpCont),
                        discountCont: priceParser(discountCont)
                    }
                })
                dataObj['imageUrl'] = await newPage.$eval('._3li7GG', div =>{
                    const imageLadder = Array.from(div.querySelectorAll('._3GnUWp li .q6DClP'))
                    if(!imageLadder.length){
                        let mainImage = div.querySelector('img').src
                        mainImage = mainImage.replace(/image\/\d+\/\d+\//,'image/').replace(/(url\(\"|\"\)|\?(.*))/g,'').slice(5,mainImage.length-3)
                        return [mainImage]
                    }
                    return imageLadder.map( cont => {
                        let imageUrl = cont.style.backgroundImage;
                        return imageUrl.replace(/image\/\d+\/\d+\//,'image/').replace(/(url\(\"|\"\)|\?(.*))/g,'')
                    })
                });
                dataObj['stock'] =  await newPage.evaluate(() => {
                    //check if out of stock is present
                    let el = document.querySelector("._16FRp0")
                    return el ? 0 : 99
                })
                try{
                    dataObj['specification'] = await newPage.evaluate(()=>{
                        let tempData = {}
                        const specificationCont = document.querySelector('._3dtsli')
        
                        if(!specificationCont) return null;
        
                        const withSubSection = Array.from( specificationCont.querySelectorAll('._3k-BhJ') )
                        withSubSection.forEach((section)=>{
                            const sectionNameCont = section.querySelector('.flxcaE')
                            
                            const sectionName = sectionNameCont? sectionNameCont.innerHTML:'General';
                            
                             if(section.querySelectorAll('table tr td').length===1){
                                tempData[sectionName] = section.querySelector('table tr td ._21lJbe').innerHTML
                            }
                            else{
                                tempData[sectionName] = {}
                                const tableRow = Array.from(section.querySelectorAll('table tr'))
                                tableRow.forEach((row)=>{
                                    const key = row.querySelector('._1hKmbr').innerHTML;
                                    const value = row.querySelector('.URwL2w li').innerHTML;
                                        tempData[sectionName][key] = value;
        
                                })
                            }
                        
                        })
                        return tempData
                    })
                }
                catch(e){
                    console.log(e,'specification')
                }
                dataObj['description'] = await newPage.evaluate(()=>{
                    const descCont = document.querySelector('._1mXcCf>p');
                    return descCont?descCont.innerHTML:null
                })
                const isMoreRatingBtnExist =await newPage.$('.JOpGWq>a');
                if(!isMoreRatingBtnExist){
                        if(await newPage.$('._16PBlm'))
                        dataObj['reviews'] =await reviewArrayParser(newPage,'._16PBlm')
                        else
                        dataObj['reviews'] = []
                }
                else{
                    const moreRatingLink =await newPage.$eval('.JOpGWq>a',(linkCont)=>{
                        return linkCont.href
                    });
                    dataObj['reviews'] = await itrateOnReviewPages(browser,moreRatingLink,5)
                }
                console.log('Product Scrapped: ',dataObj.title)

                resolve(dataObj);
                await newPage.close();
            });
            const averageListOfPages = [];
            for(link in urls){
                console.log('product number: ',countProduct);
 
                const t0 = performance.now();

                let currentPageData = await pagePromise(urls[link]);
                
                const t1 = performance.now();
                console.log('Time to scrap Product: ' , (t1 - t0) , 'ms');
                averageListOfPages.push(t1 - t0);

                scrappedProducts.push(currentPageData);
                countProduct++;
            }
            const average = averageListOfPages.reduce((a, b) => a + b) / averageListOfPages.length;
            console.log('Average Time to scrap Product: ' + average + 'ms');

            let nextButtonExist = false;

            const PageT1 = performance.now();
            console.log('Average Time to scrape Page: ' , (PageT1-PageT0) , 'ms');
                try{
                    const nextButton = await page.$eval('._1LKTO3:last-of-type', a => a.href);
                    nextButtonExist = true;
                }
                catch(err){
                    nextButtonExist = false;
                }
                if(nextButtonExist&&countPage<=maxNumberOfPages){
                    await page.click('._1LKTO3:last-of-type');   
                    return scrapeCurrentPage(); // Call this function recursively
                }

            return scrappedProducts;
        }
        let data = await scrapeCurrentPage();
        resolve(data);
    })


module.exports = scraper;