
const {startBrowser} = require('./utils/browser.utils')
const scraperController = require('./scrapper/pageController.scrapper');
const express = require('express')
const app = express();
const browserInstance = startBrowser();

app.get('/scrapper',(req,res)=>{

    console.log('server is working');
    res.send('hello world!')
})

app.get('/scrapper/start',(req,res)=>{
    

    const scrapOn = [
        {
            name:'Computers',
            url:'https://www.flipkart.com/computers/pr?sid=6bo&otracker=categorytree'
        },
        {
            name:'Mobiles',
            url: 'https://www.flipkart.com/mobiles/pr?sid=tyy,4io&otracker=categorytree'
        }
    ]
    res.send('Initited srapping')
    scraperController(browserInstance,scrapOn)
})

app.get('/scrapper/download', function(req, res){
    const file = `${__dirname}/data/product-data.json`;
    res.download(file); // Set disposition and send it.
  });

app.get('/scrapper/stop',async (req,res) => {
   let browser = await browserInstance
   browser.close();
    res.send('Browser instance and scrapping stopped')
})
const PORT = process.env.port||8080;
app.listen(PORT,()=>{
    console.log('scrapper server listening at PORT:',PORT)
})
