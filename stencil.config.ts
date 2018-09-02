import { Config } from '@stencil/core';
import { sass } from '@stencil/sass'

export const config: Config = {
    namespace: 'wcdatepicker',
    devServer: {
        openBrowser: false,
        port: 5000
    },
    plugins: [
        sass()
    ],
    outputTargets:[
        {
            type: 'dist'
        },
        {
            type: 'www',
            serviceWorker: null
        }
    ]
};
