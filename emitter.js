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
            if (!(event in allEvents)) {
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
            let eventNames = getNamespacesForDelete(Object.keys(allEvents), event);
            for (let eventName of eventNames) {
                allEvents[eventName] = allEvents[eventName].filter(
                    currentEvent => currentEvent.context !== context
                );
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} emitter
         */
        emit: function (event) {
            for (let eventName of parseNamespace(event)) {
                callEvent(allEvents, eventName);
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
            let state = 0;
            this.on(event, context, () => {
                if (state < times) {
                    handler.call(context);
                }
                state++;
            });

            return this;
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
            let state = 0;
            this.on(event, context, () => {
                if (state % frequency === 0) {
                    handler.call(context);
                }
                state++;
            });

            return this;
        }
    };
}

function callEvent(allEvents, eventName) {
    if (!(eventName in allEvents)) {
        return;
    }
    for (let event of allEvents[eventName]) {
        event.handler.call(event.context);
    }
}

function getNamespacesForDelete(namespaces, name) {
    return namespaces.filter(namespace => namespace.startsWith(name));
}

function parseNamespace(namespace) {
    let eventNames = [];
    let namespaceParts = namespace.split('.');
    while (namespaceParts.length > 0) {
        eventNames.push(namespaceParts.join('.'));
        namespaceParts.pop();
    }

    return eventNames;
}
