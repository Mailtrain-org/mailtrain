'use strict';

let FeedParser = require('feedparser');
let request = require('request');

module.exports.fetch = (url, callback) => {
    let req = request(url);
    let feedparser = new FeedParser();
    let returned = false;

    req.setHeader('user-agent', 'Mailtrain');
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    req.on('error', err => {
        if (returned) {
            return;
        }
        returned = true;
        callback(err);
    });

    req.on('response', res => {
        if (returned) {
            return;
        }

        if (res.statusCode !== 200) {
            return req.emit('error', new Error('Bad status code'));
        }

        req.pipe(feedparser);
    });

    feedparser.on('error', err => {
        if (returned) {
            return;
        }
        returned = true;
        callback(err);
    });

    feedparser.on('readable', () => {
        // This is where the action is!
        let meta = feedparser.meta;
        let item;

        while ((item = feedparser.read())) {
            //console.log(require('util').inspect(item, false, 22));
            console.log(item.title);
            console.log(item.description || item.summary);
            console.log('--------');
        }
    });
};

module.exports.fetch('https://andris9.wordpress.com/feed/', console.log);
