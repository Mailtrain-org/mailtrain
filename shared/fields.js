'use strict';

function parseDate(type, text) {
    const isUs = type === 'us';
    const trimmedText = text.trim();

    // try international format first YYYY-MM-DD
    const parts = trimmedText.match(/^(\d{4})\D+(\d{2})(?:\D+(\d{2})\b)$/);
    let day, month, year;
    let value;

    if (parts) {
        year = Number(parts[1]) || 2000;
        month = Number(parts[2]) || 0;
        day = Number(parts[3]) || 0;
        value = new Date(Date.UTC(year, month - 1, day));
    } else {
        const parts = trimmedText.match(/^(\d+)\D+(\d+)(?:\D+(\d+)\b)$/);
        if (!parts) {
            value = null;
        } else {
            day = Number(parts[isUs ? 2 : 1]);
            month = Number(parts[isUs ? 1 : 2]);
            year = Number(parts[3]);

            if (!day || !month) {
                value = null;
            } else {
                value = new Date(Date.UTC(year, month - 1, day));
            }
        }
    }

    return value;
}

function parseBirthday(type, text) {
    const isUs = type === 'us';
    const trimmedText = text.trim();

    let day, month, year;
    let value;

    const parts = trimmedText.match(/^(\d+)\D+(\d+)$/);
    if (!parts) {
        value = null;
    } else {
        day = Number(parts[isUs ? 2 : 1]);
        month = Number(parts[isUs ? 1 : 2]);

        if (!day || !month) {
            value = null;
        } else {
            value = new Date(Date.UTC(2000, month - 1, day));
        }
    }
    console.log(value);

    return value;
}

module.exports = {
    parseDate,
    parseBirthday
};