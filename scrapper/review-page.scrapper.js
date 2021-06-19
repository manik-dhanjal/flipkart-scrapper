
const {performance} = require('perf_hooks');
const reviewArrayParser = async (newPage,reviewsClass) => new Promise(async (resolve,reject) => {
    const allReviews = await newPage.$$eval(reviewsClass, reviewContArr => {

        return reviewContArr.map(review => {
            const obj = {}
            obj['title'] = review.querySelector('._2-N8zT').innerHTML
            obj['helpfull'] = parseInt( review.querySelector('._27aTsS > div:nth-of-type(1) > ._3c3Px5').innerHTML )
            obj['notHelpfull'] = parseInt( review.querySelector('._27aTsS > div:nth-of-type(2) > ._3c3Px5').innerHTML )
            const readmoreBtn = review.querySelector('.t-ZTKy ._1H-bmy');

            if(readmoreBtn) readmoreBtn.click();
            obj['description'] = review.querySelector('.t-ZTKy>div>div').innerHTML;
            const ratingsRaw = review.querySelector('._1BLPMq').innerHTML
            obj['ratings'] = parseInt(ratingsRaw.replace(/(\<)(.*)(\>)/,''))

            const imagesCont = Array.from( review.querySelectorAll('._2nMSwX>div') ).slice(0,8);
            console.log(review.querySelectorAll('._2nMSwX>div'))
            obj['imagesUrl'] = null;
            if(imagesCont&&imagesCont.length){
              obj['imagesUrl'] = imagesCont.map((cont)=>{
                    const linkRaw = cont.style.backgroundImage.replace(`url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzlEOUQ5RCIgZmlsbC1ydWxlPSJub256ZXJvIj48cGF0aCBkPSJNMjAgMEgyQzEgMCAwIDEgMCAydjE0YzAgMS4xLjkgMiAyIDJoMThjMSAwIDItMSAyLTJWMmMwLTEtMS0yLTItMnptMCAxNS45MmMtLjAyLjAzLS4wNi4wNi0uMDguMDhIMlYyLjA4TDIuMDggMmgxNy44M2MuMDMuMDIuMDYuMDYuMDguMDh2MTMuODRIMjB6Ii8+PHBhdGggZD0iTTEwIDEyLjUxTDcuNSA5LjUgNCAxNGgxNGwtNC41LTZ6Ii8+PC9nPjwvc3ZnPg==")`,'');
                    const link = linkRaw.replace(/(url\(\"|\"\)|\?(.*))/g,'');
                    return link;
              })
            }
            return obj
        })
       
    });
    resolve(allReviews)
})


const reviewPagePromise = (browser,link) => new Promise(async (resolve,reject)=>{

    let newPage = await browser.newPage();
    await newPage.setViewport({
        width: 1300,
        height: 600
    })
    const timeBeforeFecthReview = performance.now()
    try{
        await newPage.goto(link);
        if(await newPage.$('.ZVE96X')) await newPage.reload()
        await newPage.waitForSelector('._27M-vq, ._16PBlm',{timeout: 6000})
    }
    catch(e){
        await newPage.reload()
    }
    console.log('time to fetch review page:', performance.now() - timeBeforeFecthReview)

    const reviewsClass = await newPage.$('._27M-vq')?'._27M-vq':'._16PBlm';
    const reviewArray = await reviewArrayParser(newPage,reviewsClass)
    let nextLink = ''
    if(await newPage.$('._1LKTO3:last-of-type'))
        nextLink = await newPage.$eval('._1LKTO3:last-of-type',(link) => link.href)

    resolve({
        data:reviewArray,
        next:nextLink
    })
    await newPage.close();
})

const itrateOnReviewPages = (browser,link,numOfPage=3) => new Promise(async (resolve,reject) => {
    let reviews = [];
    let nextLink = link;
    const maxIteration = numOfPage
    let i = 1
    while(nextLink && (i <= maxIteration || i===-1)){
        const {data,next} = await reviewPagePromise(browser,nextLink)
        nextLink = next;
        reviews = [...reviews,...data]
        console.log('scrapping Review page number: '+i)
        i++
    }
    resolve(reviews)
})
module.exports = {
    reviewPagePromise,
    reviewArrayParser,
    itrateOnReviewPages
}