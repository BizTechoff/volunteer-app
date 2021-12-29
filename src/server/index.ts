//import { CustomModuleLoader } from '../../../../../../repos/radweb/src/app/server/CustomModuleLoader';
//let moduleLoader = new CustomModuleLoader('/dist-server/repos/radweb/projects/');
import * as compression from 'compression';
import { config } from 'dotenv';
import * as express from 'express';
import * as jwt from 'express-jwt';
import * as fs from 'fs';
import * as helmet from 'helmet';
import { createPostgresConnection } from 'remult/postgres';
import { remultExpress } from 'remult/remult-express';
//import '../app/app.module';
// import '../app/users/*';
import '../app/app-routing.module';
//import '../app/app.component';
import { getJwtTokenSignKey } from '../app/auth.service';
import '../app/common/types';
import { augmentRemult } from '../app/terms';
import './aws';
import { importDataNew } from './import-data';
import './send-calendar';
import './send-email';
import './send-sms';

async function startup() {
    config(); //loads the configuration from the .env file

    let isDev = true;
    let db = process.env.DATABASE_URL;
    if (db) {
        let i = db.indexOf('@localhost');
        if (i > 0) {
            isDev = true;
            console.debug('DEV');
        }
        else {
            isDev = false;
            console.debug('PROD PROD PROD PROD PROD PROD PROD');
        }
    }

    let app = express();
    app.use(jwt({ secret: getJwtTokenSignKey(), credentialsRequired: false, algorithms: ['HS256'] }));
    app.use(compression());
    app.use(
        helmet({
            contentSecurityPolicy: false,
        })
    );
    const api = remultExpress({
        dataProvider: async () => createPostgresConnection({ configuration: "heroku", sslInDev: !isDev }),
        initRequest: async (remult) => augmentRemult(remult)
    });
    app.use(api);
    app.use(express.static('dist/volunteer-app'));
    app.use('/*', async (req, res) => {
        try {
            res.send(fs.readFileSync('dist/volunteer-app/index.html').toString());
        } catch (err) {
            res.sendStatus(500);
        }
    });

    if (process.env.IMPORT_DATA && process.env.IMPORT_DATA === "true") {

        const remult = await api.getRemult(undefined!);
        importDataNew(remult).then(() => { });
    }

    let port = process.env.PORT || 3000;
    app.listen(port);
}

startup();