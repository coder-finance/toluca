import merge from 'lodash.merge'
import preset from '@rebass/preset'

export default merge(preset, {
    colors: {
        // custom primary color
        primary: 'darkorange',
        number: 'gray',
        badge: 'green'
    },
    shadows: {
        card: '0 0 4px rgba(0, 0, 0, 0.125)',
    },
    variants: {
        proposal: {
            p: 2,
            bg: 'background',
            boxShadow: 'card',
            borderRadius: 2,
            meta: {
                div: {
                    p: 2,
                }
            },
            votes: {
                div: {
                    p: 2,
                },
                span: {
                    color: 'number'
                }
            },
            history: {
                m: 2,
                p: 2,
                bg: 'background',
                boxShadow: 'card',
                borderRadius: 10,
                div: {
                    p: 1
                },
                blockNumber: {
                    color: 'number'
                }
            }
        },
        voting: {
            history: {
                m: 2,
                p: 2,
                bg: 'background',
                boxShadow: 'card',
                borderRadius: 10,
                div: {
                    p: 1
                },
                voter: {
                    color: 'blue'
                }
            }
        },

        badge: {
            display: 'inline-block',
            p: 2,
            color: 'white',
            bg: 'badge',
            borderRadius: 10,
        }
    },
})