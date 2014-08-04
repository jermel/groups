var expect = require('chai').expect;

describe('test/group', function() {
    describe('default group', function() {
        it('should emit done', function(done) {
          var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                count = 0,
                f1 = group.bind(function() {
                    count++;
                });

            group.on('done', function () {
                expect(count).to.equal(1);
                done();
            });
            setTimeout(f1);
        });

        it('should handle empty group', function(done) {
            require('../lib/groups')().newGroup().on('done', done);
        });

        it('should bind an empty group', function(done) {
            var Groups = require('../lib/groups')(),
                group1 = Groups.newGroup(),
                group2 = Groups.newGroup(),
                count = 0;

            group1.bind(group2);
            group1.on('done', function () {
                count++;
                expect(count).to.equal(2);
                done();
            });
            group2.on('done', function () {
                count++;
                expect(count).to.equal(1);
            });
        });

        it('should handle late done', function(done) {
            var Groups = require('../lib/groups')(),
                group1 = Groups.newGroup(),
                group2 = Groups.newGroup(),
                count = 0;

            group1.bind(group2);
            group2.on('done', function () {
                count++;
                expect(count).to.equal(1);
            });
            group1.on('done', function () {
                count++;
                expect(count).to.equal(2);
                done();
            });
        });

        it('should bind a group', function(done) {
            var Groups = require('../lib/groups')(),
                group1 = Groups.newGroup(),
                group2 = Groups.newGroup(),
                count = 0,
                f2 = group2.bind(function() {});

            group1.bind(group2);
            group1.on('done', function () {
                count++;
                expect(count).to.equal(2);
                done();
            });
            group2.on('done', function () {
                count++;
                expect(count).to.equal(1);
            });
            setTimeout(f2);
        });

        it('should handle group wrapped twice', function(done) {
            var Groups = require('../lib/groups')(),
                group1 = Groups.newGroup(),
                group2 = Groups.newGroup(),
                count = 0,
                f2 = group2.bind(function() {});

            group1.bind(group2);
            group1.bind(group2);
            group1.on('done', function () {
                count++;
                expect(count).to.equal(2);
                done();
            });
            group2.on('done', function () {
                count++;
                expect(count).to.equal(1);
            });
            setTimeout(f2);
        });

        it('should handle callback wrapped twice', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                count = 0,
                f1 = group.bind(function() { count++; }),
                f2 = group.bind(f1);

            group.on('done', function () {
                expect(count).to.equal(2);
                done();
            });
            setTimeout(f1);
            setTimeout(f2);
        });

        it('should handle callback error wrapped twice', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                count = 0,
                f1 = group.bind(function() { throw 'error'; }),
                f2 = group.bind(f1);

            group.on('done', function() { 
                throw 'Done should not get called';
            });
            group.on('error', function (errors) {
                expect(errors.length).to.equal(2);
                done();
            });
            setTimeout(f1);
            setTimeout(f2);
        });

        it('should bind a group and callback', function(done) {
            var Groups = require('../lib/groups')(),
                group1 = Groups.newGroup(),
                group2 = Groups.newGroup(),
                count = 0,
                f1 = group1.bind(function() {}),
                f2 = group2.bind(function() {});

            group1.bind(group2);
            group1.on('done', function () {
                count++;
                expect(count).to.equal(2);
                done();
            });
            group2.on('done', function () {
                count++;
                expect(count).to.equal(1);
            });
            setTimeout(f1);
            setTimeout(f2, 20);
        });
    }); // default group
    
    describe('error handling', function() {
        it('should emit error on exception', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                f1 = group.bind(function(){ throw 'error' });
                setTimeout(f1);

            group.on('done', function() { 
                throw 'Done should not get called';
            });
            group.on('error', function(errors) {
                expect(errors.length).to.equal(1);
                expect(errors[0].message).to.equal('error');
                done();
            });
        });

        it('should handle multiple exceptions', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                f1 = group.bind(function(){ throw 'error1' }),
                f2 = group.bind(function(){ throw 'error2' });
            setTimeout(f1);
            setTimeout(f2);

            group.on('done', function() { 
                throw 'Done should not get called';
            });
            group.on('error', function(errors) {
                expect(errors.length).to.equal(2);
                expect(errors[0].message).to.equal('error1');
                expect(errors[1].message).to.equal('error2');
                done();
            });
        });

        it('should propagate group errors', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                group2 = Groups.newGroup(),
                f1 = group.bind(function(){ throw 'error1' }),
                f2 = group2.bind(function(){ throw 'error2' });
            setTimeout(f1);
            setTimeout(f2);

            group.bind(group2);
            group.on('done', function() { 
                throw 'Done should not get called';
            });
            group.on('error', function(errors) {
                expect(errors.length).to.equal(2);
                expect(errors[0].message).to.equal('error1');
                expect(errors[1].message).to.equal('error2');
                done();
            });

            group2.on('done', function() { 
                throw 'Done should not get called';
            });
            group2.on('error', function(errors) {
                expect(errors.length).to.equal(1);
                expect(errors[0].message).to.equal('error2');
            });
        });
    });

    describe('emitter', function() {
        it('can add events', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup();

            group.on('ping', function() { 
                done();
            });
            group.emit('ping');
        });
    });
});
