var fs = require('fs'),
    parse = require('parse-code-context');

module.exports = {
    bromments: [
        "// hey bro!",
        "// bro, time for some gains",
        "// this code is so tight, bro!",
        "// BROTACULAR!",
        "// you're the broest bro I know, bro",
        "// good one, bro!",
        "// time for some suds, bro",
        "// cool story, bro!",
        "// almost as awesome as my K/D ratio in CoD, bro!"
    ],
    countLeadingSpaces: function (str) {
        return str.match(/^(\s*)/)[1].length;
    },
    getLineObj: function (lineNum, line) {
        return {
            lineNum: lineNum,
            line: line,
            whiteSpace: this.countLeadingSpaces(line)
        };
    },
    repeat: function (char, count) {
        var word;
        for (word = ''; word.length < count; word += char) {
        }
        return word;
    },
    getLineType: function (line) {
        var res = parse(line.trim());
        return res ? res.type : null;
    },
    getBroComment: function (lineNum) {
        return this.bromments[lineNum % this.bromments.length];
    },
    getLinesArray: function (file) {
        var self = this,
            lineNum = 0;
        return file.toString("utf8", 0, file.length)
            .split('\n')
            .reduce(function (array, line) {
                var obj = self.getLineObj(lineNum, line);
                lineNum++;
                return array.concat(obj);
            }, []);
    },
    getBroCommentsArray: function (arr) {
        var self = this;
        return arr.filter(function (lineObj) {
            return self.getLineType(lineObj.line) ? true : false;
        })
            .reduce(function (array, lineObj) {
                return array.concat(
                    self.getLineObj(
                        lineObj.lineNum - .5,
                        self.repeat(' ', lineObj.whiteSpace) + self.getBroComment(lineObj.lineNum))
                );
            }, []);
    },
    sortByLineNum: function (a, b) {
        return a.lineNum - b.lineNum;
    },
    combineArrays: function (original, comments) {
        var self = this;
        return original.concat(comments).sort(self.sortByLineNum);
    },
    concatLineObjArray: function (lineObjArray) {
        var str = '';
        lineObjArray.forEach(function (lineObj) {
            str += lineObj.line + '\n';
        });
        return str;
    },
    getBroFileName: function (fName) {
        return 'brogramified' + fName.charAt(0).toUpperCase() + fName.slice(1);
    },
    brogramify: function (fileName) {
        var self = this;

        fs.exists(fileName, function (exists) {
            self._stat(exists, fileName);
        });
    },
    _stat: function (exists, fileName) {
        var self = this;
        if (exists) {
            fs.stat(fileName, function (error, stats) {
                self._open(stats, fileName);
            });
        }
        else {
            console.log("Failed to open file, bro!");
        }
    },
    _open: function (stats, fileName) {
        var self = this;
        fs.open(fileName, "r", function (error, fd) {
            var buffer = new Buffer(stats.size);
            self._read(fd, buffer, fileName);
        });
    },
    _read: function(fd, buffer, fileName) {
        var self = this;
        fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
            self._brogramify(error, bytesRead, buffer, fileName, fd);
        });
    },
    _brogramify: function (error, bytesRead, buffer, fileName, fd) {
        var self = this,
            data = self.getLinesArray(buffer),
            insertArray = self.getBroCommentsArray(data),
            result = self.combineArrays(data, insertArray);

        fs.close(fd);

        fs.writeFile(self.getBroFileName(fileName), self.concatLineObjArray(result), self._finishWriteFile);
    },
    _finishWriteFile: function(err) {
        if (err) {
            throw err;
        }
        console.log("It's saved, bro!");
    }
};