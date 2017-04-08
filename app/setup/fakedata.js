'use strict';

let faker = require('faker');
let accounts = 100 * 1000;

let row = 0;
let getNext = () => {

    let firstName = faker.name.firstName(); // Rowan Nikolaus
    let lastName = faker.name.lastName(); // Rowan Nikolaus
    let email = faker.internet.email(firstName, lastName); // Kassandra.Haley@erich.biz

    let subscriber = {
        firstName,
        lastName,
        email,
        company: faker.company.companyName(),
        phone: faker.phone.phoneNumber()
    };

    process.stdout.write('\n' + Object.keys(subscriber).map(key => JSON.stringify(subscriber[key])).join(','));
    if (++row < accounts) {
        setImmediate(getNext);
    }
};

process.stdout.write('First name,Last name,E-Mail,Company,Phone number');
getNext();
