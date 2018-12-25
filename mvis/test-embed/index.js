'use strict';

const http = require('http');
const https = require('https');
const express = require('express');
const hbs = require('hbs');
const router = require('../ivis-core/server/lib/router-async').create();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const clientName = 'admin';

const port = 3000;

const app = express();
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const agent = new https.Agent({
    ca: fs.readFileSync('../server/certs/ca-crt.pem'),
    key: fs.readFileSync('../server/certs/' + clientName + '-key.pem'),
    cert: fs.readFileSync('../server/certs/' + clientName + '-crt.pem')
});



const embedDist = path.join(__dirname, '..', 'ivis-core', 'embedding', 'dist', 'ivis.js');
app.use('/ivis.js', express.static(embedDist));

router.getAsync('/favicon.ico', async (req, res) => {
    res.status(404).send('Not found');
});

router.getAsync('/:mtUserId/:panelId', async (req, res) => {
    const mtUserId = Number.parseInt(req.params.mtUserId);
    const panelId = Number.parseInt(req.params.panelId);

    const url = `https://localhost:8445/api/mt-embedded-panel/${mtUserId}/${panelId}`;
    const resp = await axios.get(url, { httpsAgent: agent });
    const panelInfo = resp.data;

    res.render('panel', {
        token: panelInfo.token,
        panelId: panelId,
        ivisSandboxUrlBase: panelInfo.ivisSandboxUrlBase
    });
});


app.use(router);


const server = http.createServer(app);

server.on('listening', () => {
    console.log('Express', `WWW server listening on HTTP port ${port}`);
});


server.listen(port, '0.0.0.0');

