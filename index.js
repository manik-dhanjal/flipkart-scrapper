
const {startBrowser} = require('./utils/browser.utils')
const scraperController = require('./scrapper/pageController.scrapper');
const express = require('express')
const app = express();
const browserInstance = startBrowser();

app.get('/',(req,res)=>{

    console.log('server is working');
    res.send('hello world!')
})

app.get('/start-scrapping',(req,res)=>{
    

    const scrapOn = [
        {
            name:'Pen Drives',
            url:'https://www.flipkart.com/computers/storage/pen-drives/pr?sid=6bo%2Cjdy%2Cuar&otracker=categorytree&page=5'
        },
        {
            name:'Internal Hard Drive',
            url:'https://www.flipkart.com/computers/storage/internal-hard-drive/pr?sid=6bo,jdy,dus&otracker=categorytree'
        },
        {
            name:'audio Players',
            url:'https://www.flipkart.com/computers/pr?sid=6bo&q=mi+max+4+5g&otracker=categorytree'
        }
    ]
    res.send('Initited srapping')
    scraperController(browserInstance,scrapOn)
})

app.get('/download', function(req, res){
    const file = `${__dirname}/data/product-data.json`;
    res.download(file); // Set disposition and send it.
  });

app.get('/stop-scrapping',async (req,res) => {
   let browser = await browserInstance
   browser.close();
    res.send('Browser instance and scrapping stopped')
})
const PORT = process.env.port||3000;
app.listen(PORT,()=>{
    console.log('scrapper server listening at PORT:',PORT)
})
