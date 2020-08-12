const twilio = require('twilio');
const rp = require('request-promise');
require('dotenv').config();
twilio(process.env.TWILIO_SID, process.env.TWILIO_KEY);
const { MessagingResponse } = twilio.twiml;


function covidData(req, res, next) {
    const twiml = new MessagingResponse();
    const receivedMsg = req.body.Body;
    const arrMsg = receivedMsg.toUpperCase().split(' ');
    return rp({
        method: 'GET',
        uri: `https://api.covid19api.com/countries`,
        json: true,
        resolveWithFullResponse: true,
    }).then(async (country) => {
        const allCountry = country.body;
        let countryData = allCountry.find(({ISO2}) => ISO2 === arrMsg[1]);
        let lastData = {};
        let message = 'Please send a right command';
        if ((arrMsg[0] === 'CASES' || arrMsg[0] === 'DEATHS') && arrMsg[1] !== 'TOTAL') {
            await rp({
                method: 'GET',
                uri: `https://api.covid19api.com/total/country/${countryData.Slug}`,
                json: true,
                resolveWithFullResponse: true,
            }).then((data) => {
                const dataJson = data.body;
                lastData = dataJson[dataJson.length - 1];
            }).catch((e) => {
                twiml.message(`${message}`);
                res.set('Content-Type', 'text/xml');
                return res.status(400).send(twiml.toString());
            });
        } else if (arrMsg[0] === 'CASES' || arrMsg[0] === 'DEATHS') {
            console.log('masuk sibin')
            await rp({
                method: 'GET',
                uri: `https://api.covid19api.com/world/total`,
                json: true,
                resolveWithFullResponse: true,
            }).then((data) => {
                console.log('kesini')
                const dataJson = data.body;
                lastData.Active = dataJson.TotalConfirmed - dataJson.TotalDeaths - dataJson.TotalRecovered;
                lastData.Deaths = dataJson.TotalDeaths;
                console.log(lastData)
            }).catch((e) => {
                twiml.message(`${message}`);
                res.set('Content-Type', 'text/xml');
                return res.status(400).send(twiml.toString());
            });
        }
        if (arrMsg[1] === 'TOTAL') {
            if (arrMsg[0] === 'CASES') {
                message = `Total Active Cases ${lastData.Active}`
            }
            if (arrMsg[0] === 'DEATHS') {
                message = `Total Deaths ${lastData.Deaths}`
            }
        }
        if (arrMsg[0] === 'CASES' && arrMsg[1] !== 'TOTAL') {
            message = `${countryData.ISO2} Active Cases ${lastData.Active}`;
        }
        if (arrMsg[0] === 'DEATHS' && arrMsg[1] !== 'TOTAL') {
            message = `${countryData.ISO2} Death ${lastData.Deaths}`;
        }
        console.log(message)
        twiml.message(`${message}`);
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }).catch((e) => {
        twiml.message(`API ERROR`);
        res.set('Content-Type', 'text/xml');
        return res.status(400).send(twiml.toString());
    });
};


module.exports = {
    covidData
};