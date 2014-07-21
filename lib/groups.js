var events = require('events'),
    util = require('util'),
    doneEvent = '_group_done_pvt',
    defaults = {
        logger: console,
        timeout: false
    },
    defaultFactory,
    defaultProp;

function Group(options) {
    var me = this,
        _count = 0,
        _errors = [],
        _args = [],
        _finished = false,
        _timer;

    function onError(err) {
        if (Array.isArray(err)) {
            _errors.push.apply(_errors, err);
        } else if (!(err instanceof Error)) {
            err = new Error(err);
            _errors.push(err);
        }
    }

    function afterComplete(err) {
        _count--;
        if (arguments.length > 0) {
            onError(err);
        }

        if (_count < 1) {
            var errs = (_errors.length > 0 && _errors) || undefined;
            clearTimeout(_timer);
            if (errs === undefined) {
                me.emit('done');
                me.emit(doneEvent);
            } else {
                me.emit('error', errs);
                me.emit(doneEvent, errs);
            }
        }
    }

    events.EventEmitter.call(me);

    if (options.timeout) {
        _timer = setTimeout(function groupTimeout(){
            _finished = true;
            _count = 1;
            afterComplete(new Error('GroupTimeout - exceeded timeout of ' + options.timeout));
        }, options.timeout);
    }

    /**
     * @param {function, group} async - callback or group that needs to be added to a group
     */
    this.wrap = function wrap(async, thisArg) {
        var called = false;
        _count++;

        if (async instanceof Group) {
            async.on(doneEvent, afterComplete);
            return async;
        }

        return function wrapper(error, result) {
            if (_finished) {
                options.logger.warn('Ignored invocation of callback %s because group is already done', async);
                return;
            }
            if (called) { 
                options.logger.warn('Ignored invocation of callback %s because it was called more than once', async);
                return;
            }

            called = true;

            try {
                async.call(thisArg, error, result);
            } catch (err) {
                onError(err);
            }
                
            afterComplete();
        }
    };
}
util.inherits(Group, events.EventEmitter);
    

function Groups(options) {
    var config = Object.create(defaults);

    if (options === undefined || options === null) {
        options = {};
    }

    if (options.logger !== undefined && options.logger != null) {
        config.logger = options.logger;
    }
    if (typeof options.timeout === 'number' && options.timeout > 0) {
        config.timeout = options.timeout;
    }

    return {
        newGroup: function newGroup() {
            return new Group(config);
        }
    };
}

defaultFactory = Groups();
for (defaultProp in defaultFactory) {
    Groups[defaultProp] = defaultFactory[defaultProp];
}

module.exports = Groups;