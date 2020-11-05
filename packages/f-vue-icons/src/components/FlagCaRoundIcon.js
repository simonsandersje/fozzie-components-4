export default {
    name: 'FlagCaRoundIcon',

    props: {
    },

    functional: true,

    render (h, ctx) {
        const attrs = ctx.data.attrs || {};
        ctx.data.attrs = attrs;

        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="c-ficon c-ficon--flag.ca.round" {...ctx.data}><circle cx="256" cy="256" r="256" fill="#eee"></circle><path fill="#d80027" d="M512 256A256 256 0 0 0 367.3 25.4v461.2A256 256 0 0 0 512 256zM0 256a256 256 0 0 0 144.7 230.6V25.4A256 256 0 0 0 0 256zm300.5 33.4L345 267l-22.2-11v-22.3L278.3 256l22.2-44.5h-22.2L256 178l-22.3 33.4h-22.2l22.2 44.5-44.5-22.3V256L167 267.1l44.5 22.3-11.2 22.3H245V345h22v-33.3h44.6z"></path></svg>;
    }
};
