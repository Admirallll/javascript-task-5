'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let allEvents = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} state
         * @returns {Object} this emitter with new event
         */
        on: function (event, context, handler) {
            if (!allEvents.hasOwnProperty(event)) {
                allEvents[event] = [];
            }
            allEvents[event].push({ context, handler });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} emitter
         */
        off: function (event, context) {
            let namespaces = getNamespacesForDelete(Object.keys(allEvents), event);
            for (let namespace of namespaces) {
                offOneNamespace(allEvents, namespace, context);
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} emitter
         */
        emit: function (event) {
            for (let eventName of getNamespacesForEmit(event)) {
                callHandlers(allEvents, eventName);
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} emitter
         */
        several: function (event, context, handler, times) {
            let counter = 0;
            if (times <= 0) {
                return this.on(event, context, handler);
            }

            return this.on(event, context, () => {
                handler.call(context);
                counter++;
                if (counter >= times) {
                    offOneNamespace(allEvents, event, context);
                }
            });
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} emitter
         */
        through: function (event, context, handler, frequency) {
            let counter = 0;
            if (frequency <= 0) {
                return this.on(event, context, handler);
            }

            return this.on(event, context, () => {
                if (counter % frequency === 0) {
                    handler.call(context);
                }
                counter++;
            });
        }
    };
}

function offOneNamespace(allEvents, namespace, context) {
    allEvents[namespace] = allEvents[namespace].filter(
        subscription => subscription.context !== context
    );
}

function callHandlers(allEvents, eventName) {
    if (eventName in allEvents) {
        for (let subscription of allEvents[eventName]) {
            subscription.handler.call(subscription.context);
        }
    }
}

function getNamespacesForDelete(namespaces, name) {
    return namespaces.filter(namespace => namespace.startsWith(name + '.') || namespace === name);
}

function getNamespacesForEmit(namespace) {
    let eventNames = [];
    let namespaceParts = namespace.split('.');
    while (namespaceParts.length > 0) {
        eventNames.push(namespaceParts.join('.'));
        namespaceParts.pop();
    }

    return eventNames;
}
