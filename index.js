module.exports = {
    brogramify: function(string) {
        var open = require('nw-open-file');

        open(function(filename) {
            console.log(filename);
        });
        return '';
    }
};
