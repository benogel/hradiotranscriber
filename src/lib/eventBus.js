const EventBus = function () {
    var that = this;
    that.events = {};

    that.addEventListener = function(type, handler, ctx) {
        ctx = ctx || window;
        if (that.events.hasOwnProperty(type))
            that.events[type].push({handler, ctx});
        else
            that.events[type] = [{handler, ctx}];
    };

    that.removeEventListener = function(type, handler, ctx) {
        ctx = ctx || window;
        if (!that.events.hasOwnProperty(type))
            return;

        var index = that.events[type].indexOf({handler, ctx});
        if (index != -1)
            that.events[type].splice(index, 1);
    };

    that.fireEvent = function(type, args) {
        if (!that.events.hasOwnProperty(type))
            return;
        if (!args) 
            args = [];
        var evs = that.events[type], l = evs.length;
        for (var i = 0; i < l; i++) {
            evs[i].handler.apply(evs[i].ctx, [args]);
        }
    };
}
const eventBus = new EventBus();
export let getEventBus = function () {
    return eventBus;
}
/*function () { 
    return eventBus;
} //eventBus; */