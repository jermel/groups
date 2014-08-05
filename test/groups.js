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
				expect(errors[0].message).to.equal('GroupTimeout');

				expect(errors.length).to.equal(1);
				done();
			});
        });
    });
});
