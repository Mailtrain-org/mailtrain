'use strict';

let FeedParser = require('feedparser');
let request = require('request');
let _ = require('./translate')._;
let util = require('util');

module.exports.fetch = (url, callback) => {
    let req = request(url);
    let feedparser = new FeedParser();
    let returned = false;
    let entries = [];

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
            return req.emit('error', new Error(util.format(_('Bad status code %s'), res.statusCode)));
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
        let item;
        while ((item = feedparser.read())) {
            let entry = {
                title: item.title,
                date: item.date || item.pubdate || item.pubDate || new Date(),
                guid: item.guid || item.link,
                link: item.link,
                content: item.description || item.summary,
                summary: item.summary || item.description,
                image_url: item.image.url
            };
            entries.push(entry);
        }
    });

    feedparser.on('end', () => {
        if (returned) {
            return;
        }
        returned = true;
        callback(null, entries);
    });
};
