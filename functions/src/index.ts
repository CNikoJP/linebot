'use strict'

//Importing firebase + dialogflow fulfillment usability
const Functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const cheerio = require('cheerio');
const rp = require('request-promise');
//Enabling debug on dialogflow
process.env.DEBUG = 'dialogflow:debug';


exports.dialogflowLineBot = Functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    const intentMap = new Map();

    //Gets the current time (JST)
    function nowTime(_agent) {
        const date = new Date();
        const nowTime = "現在の時刻は" + (date.getHours() + 9) + "時" + date.getMinutes() + "分" + "です";
        _agent.add(nowTime)
    }
    intentMap.set('今何時か教えて', nowTime);
    //intentMap.set(INTENTS.TIME_INTENT, nowTime);

    //Gets the current day of the week (JST)
    function today(_agent){
        const date = new Date();
        const hours = date.getHours();
        let day = date.getDay();

        if (hours >= 15) {
            day = day + 1;
        }
        const week = ["日", "月", "火", "水", "木", "金", "土"][day];
        _agent.add("今日は" + week + "曜日です");
    }
    intentMap.set('今日は何曜日', today);


    

    function yamanoteLine(_agent) {
        const options = {
            uri: `https://transit.yahoo.co.jp/traininfo/detail/21/0/`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        rp(options)
            .then( ($) => {
                
                console.log($('dd[class=normal]').text());
                _agent.add($('dd[class=normal]').text());
            })
            .catch((err) => {
                console.log(err);
            });


        // const URL_YAMANOTE_LINE = "https://transit.yahoo.co.jp/traininfo/detail/21/0/";
        // let $ = cheerio.load(URL_YAMANOTE_LINE);
        // let lineInfo = $('html dd.normal p').contents();

        // console.log(lineInfo);

        // _agent.add(lineInfo);
    }
    intentMap.set('線情報', yamanoteLine);
    
    
    
    
    agent.handleRequest(intentMap);
});


