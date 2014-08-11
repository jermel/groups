var expect = require('chai').expect;

describe('test/groups', function() {
    describe('require', function() {
        it('should return a factory', function() {
        	expect(require('../lib/groups')).to.have.property('newGroup');
        	expect(require('../lib/groups')()).to.have.property('newGroup');
        	expect(require('../lib/groups')({})).to.have.property('newGroup');
        	expect(require('../lib/groups')({
        		logger: {
        			warn: function () {}
        		}
        	})).to.have.property('newGroup');
        	expect(require('../lib/groups')({
        		timeout: 1000
        	})).to.have.property('newGroup');
        	expect(require('../lib/groups')({
        		logger: {
        			warn: function () {}
        		},
        		timeout: 2000
        	})).to.have.property('newGroup');
        });
    });
    describe('logging group factory', function() {
        it('should use logger', function() {
        	var logger = {
				warn: function() { this.warned = true;}
			},
			loggingGroups = require('../lib/groups')({
				logger: logger
			}),
			group = loggingGroups.newGroup(),
			f1 = group.wrap(function(){});

			expect(logger.warned).to.equal(undefined);
			f1();
			f1();
			expect(logger.warned).to.equal(true);
        });
    });
    describe('timed group factory', function() {
        it('should use timeout', function(done) {
        	var max = 20,
				timedGroups = require('../lib/groups')({
					timeout: max
				}),
				group = timedGroups.newGroup(),
				called = false,
				f1 = group.wrap(function(){ called = true; });
			setTimeout(f1, max + 50);

			group.on('done', function(errors) {
				expect(errors.length).to.equal(1);
				expect(errors[0].message).to.equal('GroupTimeoutError');
				done();
			});
        });

        it('should timeout with group', function(done) {
        	var max = 20,
				timedGroups = require('../lib/groups')({
					timeout: max
				}),
				group = timedGroups.newGroup(),
				group2 = require('../lib/groups')().newGroup(),
				called = false,
				called2 = false,
				calledTimeout = false,
				f1 = group.bind(function(){ called = true; }),
				f2 = group.bind(function(){ called2 = true; });

			group2.bind(group);
			setTimeout(f1, max + 20);
			setTimeout(f2, max + 30);

			group.on('done', function(errors) {
				calledTimeout = true;
				expect(errors.length).to.equal(2);
				expect(called).to.equal(true);
				expect(errors[0].message).to.equal('GroupTimeoutError');
				expect(errors[1].message).to.equal('GroupTimeoutError');
			});
			group2.on('done', function(errors) {
				expect(errors.length).to.equal(1);
				expect(called2).to.equal(true);
				expect(calledTimeout).to.equal(true);
				expect(errors[0].message).to.equal('GroupError');
				expect(errors[0].cause.length).to.equal(2);
				done();
			});
        });
    });
});
