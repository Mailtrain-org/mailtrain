'use strict';

const Page = require('./page');
let flash;

class Flash extends Page {
    getText() {
        return this.element('alert').getText();
    }
    clear() {
        return this.driver.executeScript(`
            var elements = document.getElementsByClassName('alert');
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        `);
    }
}

module.exports = driver => flash || new Flash(driver, {
    elementToWaitFor: 'alert',
    elements: {
        alert: 'div.alert:not(.js-warning)'
    }
});
