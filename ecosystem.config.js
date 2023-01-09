module.exports = {
    apps: [{
        name: 'doclink-pro',
        script: './lib/app.js',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ssZ',
        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        args: '',
        instances: 1,
        autorestart: true,
        watch: false,
        env: {
            NODE_ENV: 'production',
        }
    }, {
        name: 'doclink-sta',
        script: './lib/app.js',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ssZ',
        args: '',
        instances: 1,
        autorestart: true,
        watch: false,
        env: {
            NODE_ENV: 'staging',
            MANAGER_ROLE:3,
            DOCTOR_ROLE:2,
            PATIENT_ROLE:1 
        }
    }, {
        name: 'doclink-dev',
        script: './app.js',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ssZ',
        args: '',
        autorestart: true,
        watch: false,
        env: {
            NODE_ENV: "development",
            MANAGER_ROLE:3,
            DOCTOR_ROLE:2,
            PATIENT_ROLE:1 
        },
    }],

    // deploy: {
    //     production: {
    //         user: 'node',
    //         host: '212.83.163.1',
    //         ref: 'origin/master',
    //         repo: 'git@github.com:repo.git',
    //         path: '/var/www/production',
    //         'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    //     }
    // }
};