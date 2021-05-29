
const {startBrowser} = require('./utils/browser.utils')
const scraperController = require('./scrapper/pageController.scrapper');


const browserInstance = startBrowser();

const scrapOn = [
    // {
    //     name:'Pen Drives',
    //     url:'https://www.flipkart.com/computers/storage/pen-drives/pr?sid=6bo%2Cjdy%2Cuar&q=mi+max+4+5g&otracker=categorytree&page=5'
    // },
    {
        name:'Internal Hard Drive',
        url:'https://www.flipkart.com/computers/storage/internal-hard-drive/pr?sid=6bo,jdy,dus&otracker=categorytree'
    },
    // {
    //     name:'audio Players',
    //     url:'https://www.flipkart.com/computers/pr?sid=6bo&q=mi+max+4+5g&otracker=categorytree'
    // }
]

scraperController(browserInstance,scrapOn)