'use strict';

const page = require('./page');

module.exports = driver => Object.assign(page(driver), {
    elementToWaitFor: 'alert',
    elements: {
        alert: 'div.alert:not(.js-warning)'
    },
    getText() {
        return this.element('alert').getText();
    },
    clear() {
        return this.driver.executeScript(`
            var elements = document.getElementsByClassName('alert');
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        `);
    }
});
