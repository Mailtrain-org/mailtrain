module.exports = {


    // This is the main config file
    name: 'ZoneMTA',

    // Process identifier
    ident: 'zone-mta',

    // Run as the following user. Only use this if the application starts up as root
    // user: "zonemta"
    // group: "zonemta"

    log: {
        level: 'info'
    },

    dbs: {
        // MongoDB connection string
        mongo: 'mongodb://127.0.0.1:27017/zone-mta',

        // Redis connection string
        redis: 'redis://localhost:6379/2',

        // Database name for ZoneMTA data in MongoDB. In most cases it should be the same as in the connection string
        sender: 'zone-mta'
    },

    api: {
        maildrop: false,
        user: 'mailtrain',
        pass: 'mailtrain'
    },

    smtpInterfaces: {
        // Default SMTP interface for accepting mail for delivery
        feeder: {
            enabled: true,

            // How many worker processes to spawn
            processes: 1,

            // Maximum allowed message size 30MB
            maxSize: 31457280,

            // Local IP and port to bind to
            host: '127.0.0.1',
            port: 2525,

            // Set to true to require authentication
            // If authentication is enabled then you need to use a plugin with an authentication hook
            authentication: true,

            // How many recipients to allow per message
            maxRecipients: 1,

            // Set to true to enable STARTTLS. Do not forget to change default TLS keys
            starttls: false,

            // set to true to start in TLS mode if using port 465
            // this probably does not work as TLS support with 465 in ZoneMTA is a bit buggy
            secure: false,
        }
    },

    plugins: {
        "core/email-bounce": false,
        "core/http-bounce": {
            enabled: "main",
            url: "http://localhost:3000/webhooks/zone-mta"
        },
        "core/default-headers": {
            enabled: ["receiver", "main", "sender"],
            futureDate: false,
            xOriginatingIP: false
        },
        'mailtrain-main': {
            enabled: ['main']
        },
        'mailtrain-receiver': {
            enabled: ['receiver'],
            username: 'mailtrain',
            password: 'mailtrain'
        }
    },

    zones: {
        default: {
            preferIPv6: false,
            ignoreIPv6: true,
            processes: 1,
            connections: 5,
            pool: 'default'
        }
    }

};
