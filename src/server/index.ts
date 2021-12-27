//import { CustomModuleLoader } from '../../../../../../repos/radweb/src/app/server/CustomModuleLoader';
//let moduleLoader = new CustomModuleLoader('/dist-server/repos/radweb/projects/');
import * as compression from 'compression';
import { config } from 'dotenv';
import * as express from 'express';
import * as jwt from 'express-jwt';
import * as fs from 'fs';
import * as helmet from 'helmet';
import { Pool } from 'pg';
import { DataProvider, Remult, SqlDatabase } from 'remult';
import { PostgresDataProvider, verifyStructureOfAllEntities,createPostgresConnection } from 'remult/postgres';
import { remultExpress } from 'remult/remult-express';
//import '../app/app.module';
// import '../app/users/*';
// import '../app/core/branch/branch';
import '../app/app-routing.module';
import '../app/common/types'
//import '../app/app.component';
import { getJwtTokenSignKey } from '../app/auth.service';
import './aws';
import { importDataNew } from './import-data';
import './send-calendar';
import './send-email';
import './send-sms';

async function startup() {
    config(); //loads the configuration from the .env file
  

    let app = express();
    app.use(jwt({ secret: getJwtTokenSignKey(), credentialsRequired: false, algorithms: ['HS256'] }));
    app.use(compression());
    app.use(
        helmet({
            contentSecurityPolicy: false,
        })
    ); 
    const api = remultExpress({
        dataProvider:async ()=>createPostgresConnection({configuration:"heroku", sslInDev: false})
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
        importDataNew(remult).then(() => console.timeEnd("noam"));
    }

    let port = process.env.PORT || 3000;
    app.listen(port);
}

startup();