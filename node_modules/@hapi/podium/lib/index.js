'use strict';

const Hoek = require('@hapi/hoek');
const Teamwork = require('@hapi/teamwork');
const Validate = require('@hapi/validate');


const internals = {
    schema: {
        base: Validate.object({
            name: Validate.string().required(),
            clone: Validate.boolean(),
            tags: Validate.boolean(),
            spread: Validate.boolean(),
            channels: Validate.array().items(Validate.string()).single().unique().min(1)
        })
    }
};


internals.schema.event = internals.schema.base.keys({
    shared: Validate.boolean()
});


internals.schema.listener = internals.schema.event.keys({
    listener: Validate.func().required(),
    context: Validate.object(),
    count: Validate.number().integer().min(1),
    filter: {
        tags: Validate.array().items(Validate.string()).single().unique().min(1).required(),
        all: Validate.boolean()
    }
});


exports = module.exports = internals.Podium = class {

    constructor(events, options) {

        // Use descriptive names to avoid conflict when inherited

        this._eventListeners = new Map();
        this._notificationsQueue = [];
        this._eventsProcessing = false;
        this._sourcePodiums = [];

        if (events) {
            this.registerEvent(events, options);
        }
    }

    static decorate(target, source) {

        internals.Podium.constructor.call(target);

        for (const name of source._eventListeners.keys()) {
            target._eventListeners.set(name, {
                handlers: null,
                flags: source._eventListeners.get(name).flags
            });
        }
    }

    static validate(events) {

        const normalized = [];
        events = [].concat(events);
        for (let event of events) {
            if (typeof event === 'string') {
                event = { name: event };
            }

            normalized.push(Validate.attempt(event, internals.schema.event, 'Invalid event options'));
        }

        return normalized;
    }

    registerEvent(events, options = {}) {

        events = Hoek.flatten([].concat(events));
        for (let event of events) {
            if (!event) {
                continue;
            }

            if (event instanceof internals.Podium) {
                this.registerPodium(event);
                continue;
            }

            if (typeof event === 'string') {
                event = { name: event };
            }

            if (options.validate !== false) {                                                       // Defaults to true
                event = Validate.attempt(event, internals.schema.event, 'Invalid event options');
            }

            const name = event.name;
            if (this._eventListeners.has(name)) {
                Hoek.assert(event.shared, `Event ${name} exists`);
                continue;
            }

            this._eventListeners.set(name, { handlers: null, flags: event });
            for (const podium of this._sourcePodiums) {
                if (!podium._eventListeners.has(name)) {
                    podium._eventListeners.set(name, { handlers: null, flags: event });
                }
            }
        }
    }

    registerPodium(podiums) {

        podiums = [].concat(podiums);

        for (const podium of podiums) {
            if (podium._sourcePodiums.indexOf(this) !== -1) {
                continue;
            }

            podium._sourcePodiums.push(this);
            for (const name of podium._eventListeners.keys()) {
                if (!this._eventListeners.has(name)) {
                    this._eventListeners.set(name, { handlers: null, flags: podium._eventListeners.get(name).flags });
                }
            }
        }
    }

    async emit(criteria, data, _generated) {

        criteria = internals.criteria(criteria);

        const name = criteria.name;
        Hoek.assert(name, 'Criteria missing event name');

        const event = this._eventListeners.get(name);
        Hoek.assert(event, `Unknown event ${name}`);

        if (!event.handlers &&
            !this._sourcePodiums.length) {

            return;
        }

        Hoek.assert(!criteria.channel || typeof criteria.channel === 'string', 'Invalid channel name');
        Hoek.assert(!criteria.channel || !event.flags.channels || event.flags.channels.indexOf(criteria.channel) !== -1, `Unknown ${criteria.channel} channel`);
        Hoek.assert(!event.flags.spread || Array.isArray(data) || typeof data === 'function', 'Data must be an array for spread event');

        if (typeof criteria.tags === 'string') {
            Object.assign({}, criteria);
            criteria.tags = { [criteria.tags]: true };
        }

        if (criteria.tags &&
            Array.isArray(criteria.tags)) {

            // Map array to object

            const tags = {};
            for (const tag of criteria.tags) {
                tags[tag] = true;
            }

            Object.assign({}, criteria);
            criteria.tags = tags;
        }

        if (event.handlers) {
            const processing = [];

            const handlers = event.handlers.slice();                // Clone in case handlers are changed by listeners
            for (const handler of handlers) {
                if (handler.channels &&
                    (!criteria.channel || handler.channels.indexOf(criteria.channel) === -1)) {

                    continue;
                }

                if (handler.filter) {
                    if (!criteria.tags) {
                        continue;
                    }

                    const match = Hoek.intersect(criteria.tags, handler.filter.tags, { first: !handler.filter.all });
                    if (!match ||
                        handler.filter.all && match.length !== handler.filter.tags.length) {

                        continue;
                    }
                }

                if (handler.count) {
                    --handler.count;
                    if (handler.count < 1) {
                        internals.removeHandler(this, criteria.name, handler);
                    }
                }

                if (!_generated &&
                    typeof data === 'function') {

                    data = data();
                    _generated = true;
                }

                const update = internals.flag('clone', handler, event) ? Hoek.clone(data) : data;
                const args = internals.flag('spread', handler, event) && Array.isArray(update) ? update : [update];

                if (internals.flag('tags', handler, event) &&
                    criteria.tags) {

                    args.push(criteria.tags);
                }

                try {
                    const result = handler.context ? handler.listener.apply(handler.context, args) : handler.listener(...args);
                    if (result &&
                        typeof result.then === 'function') {

                        processing.push(result);
                    }
                }
                catch (err) {
                    processing.push(Promise.reject(err));
                }
            }

            if (processing.length) {
                await Promise.all(processing);
            }
        }

        if (this._sourcePodiums.length) {
            const podiums = this._sourcePodiums.slice();         // Clone in case modified while processing
            await Promise.all(podiums.map((podium) => podium.emit(criteria, data, _generated)));
        }
    }

    on(criteria, listener, context) {

        criteria = Object.assign({}, internals.criteria(criteria));
        criteria.listener = listener;
        criteria.context = context;

        if (criteria.filter &&
            (typeof criteria.filter === 'string' || Array.isArray(criteria.filter))) {

            criteria.filter = { tags: criteria.filter };
        }

        criteria = Validate.attempt(criteria, internals.schema.listener, 'Invalid event listener options');

        const name = criteria.name;
        const event = this._eventListeners.get(name);
        Hoek.assert(event, `Unknown event ${name}`);
        Hoek.assert(!criteria.channels || !event.flags.channels || Hoek.intersect(event.flags.channels, criteria.channels).length === criteria.channels.length, `Unknown event channels ${criteria.channels && criteria.channels.join(', ')}`);

        event.handlers = event.handlers || [];
        event.handlers.push(criteria);

        return this;
    }

    addListener(criteria, listener, context) {

        return this.on(criteria, listener, context);
    }

    once(criteria, listener, context) {

        criteria = Object.assign({}, internals.criteria(criteria), { count: 1 });

        if (listener) {
            return this.on(criteria, listener, context);
        }

        const team = new Teamwork.Team();
        this.on(criteria, (...args) => team.attend(args), context);
        return team.work;
    }

    few(criteria, context) {

        Hoek.assert(typeof criteria === 'object', 'Criteria must be an object');
        Hoek.assert(criteria.count, 'Criteria must include a count limit');

        const team = new Teamwork.Team({ meetings: criteria.count });
        this.on(criteria, (...args) => team.attend(args), context);
        return team.work;
    }

    removeListener(name, listener) {

        Hoek.assert(this._eventListeners.has(name), `Unknown event ${name}`);
        Hoek.assert(typeof listener === 'function', 'Listener must be a function');

        const event = this._eventListeners.get(name);
        const handlers = event.handlers;
        if (!handlers) {
            return this;
        }

        const filtered = handlers.filter((handler) => handler.listener !== listener);
        event.handlers = filtered.length ? filtered : null;
        return this;
    }

    removeAllListeners(name) {

        Hoek.assert(this._eventListeners.has(name), `Unknown event ${name}`);
        this._eventListeners.get(name).handlers = null;
        return this;
    }

    hasListeners(name) {

        Hoek.assert(this._eventListeners.has(name), `Unknown event ${name}`);
        return !!this._eventListeners.get(name).handlers;
    }
};


internals.removeHandler = function (emitter, name, handler) {

    const event = emitter._eventListeners.get(name);
    const handlers = event.handlers;
    const filtered = handlers.filter((item) => item !== handler);
    event.handlers = filtered.length ? filtered : null;
};


internals.criteria = function (criteria) {

    if (typeof criteria === 'string') {
        return { name: criteria };
    }

    return criteria;
};


internals.flag = function (name, handler, event) {

    return (handler[name] !== undefined ? handler[name] : event.flags[name]) || false;
};
