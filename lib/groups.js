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
        _uid = 0, /* unique id for asyncs in this group */
        _count = 0,
        _errors = [],
        _args = [],
        _timer,
        _asyncs = {}
        _inBind = false;

    events.EventEmitter.call(me);

    function onError(err) {
        if (Array.isArray(err)) {
            _errors.push.apply(_errors, err);
        } else if (!(err instanceof Error)) {
            err = new Error(err);
            _errors.push(err);
        } else {
            _errors.push(err);
        }
    }

    function doneCheck() {
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

    function afterComplete(err) {
        _count--;
        if (arguments.length > 0) {
            onError(err);
        }

        doneCheck();
    }

    if (options.timeout) {
        _timer = setTimeout(function groupTimeout() {
            var key, async;
            /* notify each async that has not finished of timeout error */

            for (key in _asyncs) {
                async = _asyncs[key];
                if (typeof async === 'function') {
                    async(new Error('GroupTimeout'));
                } else {
                    //stop listening to this group's doneEvent
                    async.async.removeListener(doneEvent, async.callback);
                    async.callback(new Error('GroupTimeout'));
                }
            }
        }, options.timeout);
    }

    /**
     * Returns an async process that this group monitors
     * @param {function, group} async - callback or group that needs to be added to a group
     */
    me.bind = function bind(async, bindOptions) {
        var called = false,
            _id = _uid++,
            _afterGroup;
        bindOptions = bindOptions || { thisArg: null };
        _count++;

        if (async instanceof Group) {
            _asyncs[_id] = { 
                async: async,
                callback: _afterGroup
            };

            _afterGroup = function(err) {
                delete _asyncs[_id];
                afterComplete.apply(null, arguments);
            };
            async.once(doneEvent, _afterGroup);
            return async;
        }

        return _asyncs[_id] = function wrapper(error, result) {
            if (_inBind) {
                return async.call(bindOptions.thisArg, error, result);
            }
            if (called) { 
                options.logger.warn('Ignored invocation of callback %s because it was called more than once', async);
                return;
            }

            called = true;
            delete _asyncs[_id];

            try {
                _inBind = true;
                async.call(bindOptions.thisArg, error, result);
                if (error) {
                    onError(error);
                }
            } catch (err) {
                onError(err);
            }
            _inBind = false;
                
            afterComplete();
        };
    };

    me.wrap = me.bind;

    me.on = me.addListener = function addListener(type, listener) {
        Group.prototype.on.apply(me, arguments);
        if (type === 'done') {
            doneCheck();
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