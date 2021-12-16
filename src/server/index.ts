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
import { PostgresDataProvider, verifyStructureOfAllEntities } from 'remult/postgres';
import { initExpress } from 'remult/server';
//import '../app/app.module';
// import '../app/users/*';
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
    let dataProvider: DataProvider | undefined;

    // use json db for dev, and postgres for production
    if (process.env.USE_PROGRESQL || !process.env.DEV_MODE) {//if you want to use postgres for development - change this if to be if(true)
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false }// use ssl in production but not in development. the `rejectUnauthorized: false`  is required for deployment to heroku etc...
        });
        let database = new SqlDatabase(new PostgresDataProvider(pool));
        var remult = new Remult();
        remult.setDataProvider(database);
        await verifyStructureOfAllEntities(database, remult);
        dataProvider = database;
    }

    let app = express();
    app.use(jwt({ secret: getJwtTokenSignKey(), credentialsRequired: false, algorithms: ['HS256'] }));
    app.use(compression());
    app.use(
        helmet({
            contentSecurityPolicy: false,
        })
    );
    initExpress(app, {
        dataProvider
    });
    app.use(express.static('dist/volunteer-app'));
    app.use('/*', async (req, res) => {
        try {
            res.send(fs.readFileSync('dist/volunteer-app/index.html').toString());
        } catch (err) {
            res.sendStatus(500);
        }
    });

    if (process.env.IMPORT_DATA && process.env.IMPORT_DATA === "true") {
        console.time("noam")
        var remult = new Remult();
        remult.setDataProvider(dataProvider!);
        importDataNew(remult).then(() => console.timeEnd("noam"));
    }
 
    let port = process.env.PORT || 3000;
    app.listen(port);
}

startup();
