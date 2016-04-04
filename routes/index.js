'use strict';

let express = require('express');
let router = new express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', {
        indexPage: true,
        title: 'Self hosted email newsletter app'
    });
});

module.exports = router;
