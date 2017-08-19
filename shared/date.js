'use strict';

const moment = require('moment');

const birthdayYear = 2000;

const DateFormat = {
    US: 'us',
    EU: 'eur',
    INTL: 'intl'
};

const dateFormatStrings = {
    'us': 'MM/DD/YYYY',
    'eur': 'DD/MM/YYYY',
    'intl': 'YYYY-MM-DD'
};

const birthdayFormatStrings = {
    'us': 'MM/DD',
    'eur': 'DD/MM',
    'intl': 'MM/DD'
};

function parseDate(format, text) {
    const date = moment.utc(text, dateFormatStrings[format]);

    if (date.isValid()) {
        return date.toDate();
    }
}

function parseBirthday(format, text) {
    const fullDateStr = format === DateFormat.INTL ? birthdayYear + '-' + text : text + '-' + birthdayYear;
    const date = moment.utc(fullDateStr, dateFormatStrings[format]);

    if (date.isValid()) {
        return date.toDate();
    }
}

function formatDate(format, date) {
    return moment.utc(date).format(dateFormatStrings[format]);
}

function formatBirthday(format, date) {
    return moment.utc(date).format(birthdayFormatStrings[format]);
}

function getDateFormatString(format) {
    return dateFormatStrings[format];
}

function getBirthdayFormatString(format) {
    return birthdayFormatStrings[format];
}

module.exports = {
    DateFormat,
    birthdayYear,
    parseDate,
    parseBirthday,
    formatDate,
    formatBirthday,
    getDateFormatString,
    getBirthdayFormatString
};