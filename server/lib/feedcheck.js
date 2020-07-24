'use strict';

const fork = require('./fork').fork;
const log = require('./log');
const path = require('path');
const senders = require('./senders');
const bluebird = require('bluebird');
const feedparser = require('feedparser-promised');
const {getPublicUrl} = require('./urls');

let messageTid = 0;
let feedcheckProcess;

function spawn(callback) {
    log.verbose('Feed', 'Spawning feedcheck process');

    feedcheckProcess = fork(path.join(__dirname, '..', 'services', 'feedcheck.js'), [], {
        cwd: path.join(__dirname, '..'),
        env: {NODE_ENV: process.env.NODE_ENV}
    });

    feedcheckProcess.on('message', msg => {
        if (msg) {
            if (msg.type === 'feedcheck-started') {
                log.info('Feed', 'Feedcheck process started');
                return callback();
            } else if (msg.type === 'entries-added') {
                senders.scheduleCheck();
            }
        }
    });

    feedcheckProcess.on('close', (code, signal) => {
        log.error('Feed', 'Feedcheck process exited with code %s signal %s', code, signal);
    });
}

function scheduleCheck() {
    feedcheckProcess.send({
        type: 'scheduleCheck',
        tid: messageTid
    });

    messageTid++;
}

async function fetch(url) {
    const httpOptions = {
        uri: url,
        headers: {
            'user-agent': 'Mailtrain',
            'accept': 'text/html,application/xhtml+xml'
        }
    };

    const items = await feedparser.parse(httpOptions);

    const entries = [];
    for (const item of items) {
        let date = item.date || item.pubdate || item.pubDate;
        if (date) {
            date = (new Date(date)).toISOString();
        }

        const entry = {
            title: item.title,
            date: date,
            guid: item.guid || item.link,
            link: item.link,
            content: item.description || item.summary,
            summary: item.summary || item.description,
            imageUrl: item.image.url,
        };

        if ('mt:entries-json' in item) {
            entry.customTags = JSON.parse(item['mt:entries-json']['#'])
        }

        entries.push(entry);
    }

    return entries;
}

async function getEntryForPreview(url) {
    const entries = await fetch(url);

    let entry;
    if (entries.length === 0) {
        entry = {
            title: "Lorem Ipsum",
            date: (new Date()).toISOString(),
            guid: "c21bc6c8-d351-4000-aa1f-e7ff928084cd",
            link: "http://www.example.com/sample-item.html",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer gravida a purus in commodo. Sed risus eros, pharetra sit amet sagittis vel, porta nec magna. Sed sollicitudin blandit ornare. Pellentesque a lacinia dui. Etiam ullamcorper, nisl at pharetra fringilla, enim nunc blandit quam, nec vestibulum purus lorem in urna.",
            summary: "Aliquam malesuada nibh eget arcu egestas, id pellentesque urna egestas. Phasellus lacus est, viverra in dolor quis, aliquet elementum nisi. Donec hendrerit elit pretium vehicula pharetra. Pellentesque aliquam elit id rutrum imperdiet. Phasellus ac enim at lacus sodales condimentum vitae quis sapien.",
            imageUrl: getPublicUrl('static/mailtrain-notext.png'),
            customTags: {
                placerat: "Ligula at consequat",
                accumsan: {
                    mauris: "Placerat nec justo",
                    ornare: "Nunc egestas"
                },
                fringilla: 42,
                purus: [
                    {
                        consequat: "Vivamus",
                        enim: "volutpat blandit"
                    },
                    {
                        consequat: "Phasellus",
                        enim: "sed semper"
                    }
                ]
            }
        };
    } else {
        entry = entries[0];
    }

    return entry;
}

module.exports.spawn = bluebird.promisify(spawn);
module.exports.scheduleCheck = scheduleCheck;
module.exports.fetch = fetch;
module.exports.getEntryForPreview = getEntryForPreview;