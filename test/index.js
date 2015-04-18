var should = require('chai').should(),
    sinon = require('sinon'),
    EventEmitter = require('events').EventEmitter,
    bro = require('../index');

describe('brogramify', function () {
    it("should count the leading white spaces on a string", function () {
        bro.countLeadingSpaces('    word').should.equal(4);
        bro.countLeadingSpaces('word').should.equal(0);
        bro.countLeadingSpaces(' word  ').should.equal(1);
        bro.countLeadingSpaces(' wo rd  ').should.equal(1);
    });

    it("should return a line object", function () {
        var spy = sinon.spy(),
            emitter = new EventEmitter,
            line = ' line text';

        emitter.on('countLeadingSpaces', spy);
        emitter.emit('countLeadingSpaces', line);

        var result = bro.getLineObj(2, line);

        result.lineNum.should.equal(2);
        result.line.should.equal(line);
        result.whiteSpace.should.equal(1);
        sinon.assert.calledOnce(spy);
        sinon.assert.calledWith(spy, line);
    });

    it("should return a string with a given number of repeated characters", function () {
        bro.repeat(' ', 5).should.equal('     ');
        bro.repeat('b', 3).should.equal('bbb');
    });

    it("should return the line type according to parse", function () {
        var spy = sinon.spy(),
            emitter = new EventEmitter,
            line = 'var a = function(){};';

        emitter.on('parse', spy);
        emitter.emit('parse', line.trim());

        bro.getLineType(line).should.equal('function expression');

        sinon.assert.calledOnce(spy);
        sinon.assert.calledWith(spy, line);

        line = ' ';
        spy = sinon.spy();
        emitter.on('parse', spy);
        emitter.emit('parse', '');

        var result = bro.getLineType(line);

        should.not.exist(result);
        sinon.assert.calledOnce(spy);
        sinon.assert.calledWith(spy, '');
    });

    it("should return a bro comment", function () {
        bro.getBroComment(4).should.equal(bro.bromments[4]);
        bro.getBroComment(0).should.equal(bro.bromments[0]);
        bro.getBroComment(bro.bromments.length).should.equal(bro.bromments[0]);
        bro.getBroComment(bro.bromments.length-1).should.equal(bro.bromments[bro.bromments.length-1]);
    });

    it("should return an array of line objects", function () {
        var file = "var func = function() {\n" +
            "   var stuff = 123;\n" +
            "};";

        var results = bro.getLinesArray(file);

        results.length.should.equal(3);
        results[0].lineNum.should.equal(0);
        results[1].lineNum.should.equal(1);
        results[2].lineNum.should.equal(2);
    });

    it("should return an array of line objects with bro comments", function () {
        var file = "var func = function() {\n" +
                "    var stuff = 123;\n" +
                "};",
            arr = bro.getLinesArray(file);

        var results = bro.getBroCommentsArray(arr);

        results.length.should.equal(2);
        results[0].lineNum.should.equal(-.5);
        bro.countLeadingSpaces(results[0].line).should.equal(0);
        results[1].lineNum.should.equal(.5);
        bro.countLeadingSpaces(results[1].line).should.equal(4);
    });

    it("should return the difference between two object's lineNum fields", function () {
        var one = {
                lineNum: 1
            },
            two = {
                lineNum: 2
            };

        bro.sortByLineNum(one, two).should.equal(-1);
        bro.sortByLineNum(two, one).should.equal(1);
    });

    it("should join two arrays and sort them by the lineNum field", function () {
        var array1 = [
                {lineNum: 0},
                {lineNum: 2},
                {lineNum: 1}
            ],
            array2 = [
                {lineNum: 1.5},
                {lineNum: .5}
            ];

        var results = bro.combineArrays(array1, array2);

        results.length.should.equal(5);
        results[0].lineNum.should.equal(0);
        results[1].lineNum.should.equal(.5);
        results[2].lineNum.should.equal(1);
        results[3].lineNum.should.equal(1.5);
        results[4].lineNum.should.equal(2);
    });

    it("should concatenate the line field of a array of objects into a single string", function () {
        var arr = [
                {line: "Line 1"},
                {line: "Line 2"},
                {line: "Line 3"}
            ];

        var results = bro.concatLineObjArray(arr);

        results.should.equal(arr[0].line + '\n' + arr[1].line + '\n' + arr[2].line + '\n');
    });

    it("should return the brogramified file name", function () {
        var fileName = 'testFile.js';

        bro.getBroFileName(fileName).should.equal('brogramifiedTestFile.js');
    });

    it("should open a file to brogramify", function () {

    });

    it("should brogramify a file and save the result", function () {

    });
});