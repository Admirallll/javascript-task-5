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
    let namespaces = {};

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
            let namespaceParts = event.split('.');
            let currentNamespace = namespaces;
            for (let namespacePart of namespaceParts) {
                if (!(namespacePart in currentNamespace)) {
                    currentNamespace[namespacePart] = {};
                }
                currentNamespace = currentNamespace[namespacePart];
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
            let eventNames = getNamespacesForDelete(namespaces, event);
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
    let namespaceParts = name.split('.');
    for (let part of namespaceParts) {
        if (!(part in namespaces)) {
            return [];
        }
        namespaces = namespaces[part];
    }
    let result = getAllNamespacesRecursively(namespaces, name);
    result.push(name);

    return result;
}

function getAllNamespacesRecursively(namespaces, startNamespace) {
    let result = [];
    let currentNamespace = startNamespace;
    for (let namespace of Object.keys(namespaces)) {
        if (currentNamespace.length > 0) {
            currentNamespace += '.';
        }
        result.push(currentNamespace + namespace);
        currentNamespace += namespace;
        for (let resultNamespace of getAllNamespacesRecursively(namespaces[namespace])) {
            result.push(currentNamespace + '.' + resultNamespace);
        }
    }

    return result;
}

function parseNamespace(namespace) {
    let eventNames = [];
    let dotIndex = -1;
    do {
        dotIndex = namespace.lastIndexOf('.');
        eventNames.push(namespace);
        namespace = namespace.substring(0, dotIndex);
    } while (dotIndex > 0);

    return eventNames;
}
