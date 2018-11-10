export default {
    readFileSync: (filename) => {
        if (filename === '/.mjmlconfig') {
            return '{ "packages": [] }';
        } else {
            console.log('readFileSync - unknown file name "' + filename + '"');
        }
    }
};