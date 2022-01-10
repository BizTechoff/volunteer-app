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
import './aws-s3';
import { generateUploadURL } from './aws-s3';
import { importDataNew } from './import-data';
import './send-calendar';
import './send-email';
import './send-sms';
  
export function isDevMode() {
    let result = false;
    let db = process.env.DATABASE_URL;
    if (db) {
        let i = db.indexOf('@localhost');
        if (i > 0) {
            result = true;
        }
    }
    return result;
}

async function startup() {
    config(); //loads the configuration from the .env file

    let enviroment = 'NO enviroment'.toUpperCase();
    let isDev = isDevMode();
    enviroment = 'PROD PROD PROD PROD PROD PROD PROD';
    if (isDev) {
        enviroment = 'DEV';
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

    app.get("/api/s3Url", async (req, res) => {//?key=[key]&f=[fname]
        let result: { url: string, error: string } = { url: '', error: '' };
        // console.log('s3Url CALLED !');
        let key = req.query.key as string;
        if (key === process.env.AWS_CLIENT_KEY!) {
            let fName = req.query.f as string;
            let branch = req.query.branch as string;
            // console.log('fName', fName);
            if (fName && fName.length > 0) {
                result.url = await generateUploadURL(fName, branch)
            }
            else {
                result.error = 's3Url.NO File Name'
            }
        }
        else {
            result.error = 's3Url.NOT ALLOWED'
        }
        // console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    })

    app.use(express.static('dist/volunteer-app'));

    app.use('/*', async (req, res) => {
        try {
            res.send(fs.readFileSync('dist/volunteer-app/index.html').toString());
        } catch (err) {
            res.sendStatus(500);
        }
    });

    console.debug(enviroment);

    // const remult = await api.getRemult(undefined!);
    // downloadPhotos(remult).then(() => { });

    if (process.env.IMPORT_DATA && process.env.IMPORT_DATA === "true") {

        const remult = await api.getRemult(undefined!);
        importDataNew(remult).then(() => { });
    }

    let port = process.env.PORT || 3000;
    app.listen(port);
}

startup();