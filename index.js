module.exports = {
    brogramify: function (fileName) {
        var fs = require('fs'),
            parse = require('parse-code-context');

        var countLeadingSpaces = function (str) {
            return str.match(/^(\s*)/)[1].length;
        };
        var getLineObj = function (lineNum, line) {
            return {
                lineNum: lineNum,
                line: line,
                whiteSpace: countLeadingSpaces(line)
            };
        };
        var repeat = function (char, count) {
            var word;
            for (word = ''; word.length < count; word += char) {
            }
            return word;
        };
        var getLineType = function (line) {
            var res = parse(line.trim());
            return res ? res.type : null;
        };
        var getBroComment = function () {
            return '// hey bro!'
        };
        var getLinesArray = function (file) {
            var lineNum = 0;
            return file.toString("utf8", 0, file.length)
                .split('\n')
                .reduce(function (array, line) {
                    var obj = getLineObj(lineNum, line);
                    lineNum++;
                    return array.concat(obj);
                }, []);
        };
        var getLinesToComment = function (arr) {
            return arr.filter(function (lineObj) {
                return getLineType(lineObj.line) ? true : false;
            })
                .reduce(function (array, lineObj) {
                    return array.concat(getLineObj(lineObj.lineNum - .5, repeat(' ', lineObj.whiteSpace) + getBroComment()));
                }, []);
        };
        var sortByLineNum = function (a, b) {
            return a.lineNum - b.lineNum;
        };
        var combineArrays = function (original, comments) {
            return original.concat(comments).sort(sortByLineNum);
        };
        var toString = function (lineObjArray) {
            var str = '';
            lineObjArray.forEach(function (lineObj) {
                str += lineObj.line + '\n';
            });
            return str;
        };
        var getBroFileName = function (fName) {
            return 'brogramified' + fName.charAt(0).toUpperCase() + fName.slice(1);
        };

        fs.exists(fileName, function (exists) {
            if (exists) {
                fs.stat(fileName, function (error, stats) {
                    fs.open(fileName, "r", function (error, fd) {
                        var buffer = new Buffer(stats.size);

                        fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                            var data = getLinesArray(buffer),
                                insertArray = getLinesToComment(data),
                                result = combineArrays(data, insertArray);

                            fs.close(fd);

                            fs.writeFile(getBroFileName(fileName), toString(result), function (err) {
                                if (err) {
                                    throw err;
                                }
                                console.log("It's saved!");
                            });
                        });
                    });
                });
            }
        });
    }
};