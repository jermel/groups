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

            group.on('done', function (err) {
                expect(count).to.equal(1);
                expect(err).to.equal(undefined);
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
            group1.on('done', function (err) {
                count++;
                expect(count).to.equal(2);
                expect(err).to.equal(undefined);
                done();
            });
            group2.on('done', function (err) {
                count++;
                expect(count).to.equal(1);
                expect(err).to.equal(undefined);
            });
        });

        it('should handle late done', function(done) {
            var Groups = require('../lib/groups')(),
                group1 = Groups.newGroup(),
                group2 = Groups.newGroup(),
                count = 0;

            group1.bind(group2);
            group2.on('done', function (err) {
                count++;
                expect(count).to.equal(1);
                expect(err).to.equal(undefined);
            });
            group1.on('done', function (err) {
                count++;
                expect(count).to.equal(2);
                expect(err).to.equal(undefined);
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
            group1.on('done', function (err) {
                count++;
                expect(count).to.equal(2);
                expect(err).to.equal(undefined);
                done();
            });
            group2.on('done', function (err) {
                count++;
                expect(count).to.equal(1);
                expect(err).to.equal(undefined);
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
            group1.on('done', function (err) {
                count++;
                expect(count).to.equal(2);
                expect(err).to.equal(undefined);
                done();
            });
            group2.on('done', function (err) {
                count++;
                expect(count).to.equal(1);
                expect(err).to.equal(undefined);
            });
            setTimeout(f2);
        });

        it('should handle callback wrapped twice', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                count = 0,
                f1 = group.bind(function() { count++; }),
                f2 = group.bind(f1);

            group.on('done', function (err) {
                expect(err).to.equal(undefined);
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

            group.on('done', function (errors) {
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
            group1.on('done', function (err) {
                expect(err).to.equal(undefined);
                count++;
                expect(count).to.equal(2);
                done();
            });
            group2.on('done', function (err) {
                expect(err).to.equal(undefined);
                count++;
                expect(count).to.equal(1);
            });
            setTimeout(f1);
            setTimeout(f2, 20);
        });

        it('should bind(fn, fn)', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                msg,
                f1 = group.bind(function(){ msg = 'success'; }, function(){ msg = 'error'; });

            setTimeout(f1.success);
            group.on('done', function(errors) {
                expect(errors).to.equal(undefined);
                expect(msg).to.equal('success');
                done();
            });
        });
    }); // default group
    
    describe('error handling', function() {
        it('should emit error on exception', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                f1 = group.bind(function(){ throw 'error' });
            
            setTimeout(f1);
            group.on('done', function(errors) {
                expect(errors.length).to.equal(1);
                expect(errors[0].message).to.equal('error');
                done();
            });
        });

        it('bind() emits error on invocation', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                f1 = group.bind();

            setTimeout(f1);
            group.on('done', function(errors) {
                expect(errors.length).to.equal(1);
                done();
            });
        });

        it('bind(non-function) emits error on invocation', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                count = 0;

            setTimeout(group.bind()); count++;
            setTimeout(group.bind(true)); count++;
            setTimeout(group.bind(false)); count++;
            setTimeout(group.bind(0)); count++;
            setTimeout(group.bind(1)); count++;
            setTimeout(group.bind(null)); count++;
            setTimeout(group.bind(undefined)); count++;
            setTimeout(group.bind('')); count++;
            setTimeout(group.bind('string')); count++;
            setTimeout(group.bind({})); count++;
            setTimeout(group.bind([])); count++;

            group.on('done', function(errors) {
                expect(errors.length).to.equal(count);
                done();
            });
        });

        it('bind(fn, fn) emits error on failure invocation', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                err,
                f1 = group.bind(function(){}, function(){ err = 'error'; });

            setTimeout(f1.failure);
            group.on('done', function(errors) {
                expect(errors.length).to.equal(1);
                expect(err).to.equal('error');
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

            group.on('done', function(errors) {
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
            group.on('done', function(errors) {
                expect(errors.length).to.equal(2);
                expect(errors[0].message).to.equal('error1');
                expect(errors[1].message).to.equal('GroupError');
                expect(errors[1].cause[0].message).to.equal('error2');
                done();
            });

            group2.on('done', function(errors) {
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

    describe('options.thisArg', function() {
        it('should bind(fn, opts.thisArg)', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                thisArg = {},
                f1 = group.bind(function(){ this.msg = 'success'; }, { thisArg: thisArg});

            setTimeout(f1);
            group.on('done', function(errors) {
                expect(errors).to.equal(undefined);
                expect(thisArg.msg).to.equal('success');
                done();
            });
        });
        it('should bind(success, fn, opts.thisArg)', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                thisArg = {},
                f1 = group.bind(function(){ this.msg = 'success'; },
                    function(){ this.msg = 'failure'; },
                    { thisArg: thisArg});

            setTimeout(f1.success);
            group.on('done', function(errors) {
                expect(errors).to.equal(undefined);
                expect(thisArg.msg).to.equal('success');
                done();
            });
        });
        it('should bind(fn, failure, opts.thisArg)', function(done) {
            var Groups = require('../lib/groups')(),
                group = Groups.newGroup(),
                thisArg = {},
                f1 = group.bind(function(){ this.msg = 'success'; },
                    function(){ this.msg = 'failure'; },
                    { thisArg: thisArg});

            setTimeout(f1.failure);
            group.on('done', function(errors) {
                expect(errors.length).to.equal(1);
                expect(thisArg.msg).to.equal('failure');
                done();
            });
        });
        it('should bind(fn, opts.thisArg) on timeout', function(done) {
            var max = 10,
                Groups = require('../lib/groups')({timeout: max}),
                group = Groups.newGroup(),
                thisArg = {},
                f1 = group.bind(function(error){ this.error = error; }, { thisArg: thisArg});

            setTimeout(f1.failure, max + 20);
            group.on('done', function(errors) {
                expect(errors.length).to.equal(1);
                expect(thisArg.error.message).to.equal('GroupTimeout');
                done();
            });
        });
        it('should bind(fn, failure, opts.thisArg) on timeout', function(done) {
            var max = 1,
                Groups = require('../lib/groups')({timeout: max,
                    logger: { warn: function() {} }
                }),
                group = Groups.newGroup(),
                thisArg = {},
                f1 = group.bind(function(){ this.msg = 'success'; },
                    function(error){ this.error = error; },
                    { thisArg: thisArg});

            setTimeout(f1.success, max + 20);
            group.on('done', function(errors) {
                expect(errors.length).to.equal(1);
                expect(thisArg.error.message).to.equal('GroupTimeout');
                done();
            });
        });
    });
});
