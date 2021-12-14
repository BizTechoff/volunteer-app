import { debug } from 'console';
import { Remult } from 'remult';
import { Branch } from '../app/core/branch/branch';
import { Tenant } from '../app/core/tenant/tenant';
import { Users } from '../app/users/users';

let folder = `D:\\documents\\אשל ירושלים\\הסבה\\`;
let branch = 'קריית אונו';

export async function importDataNew(remult: Remult) {

    console.log(`users: ${await remult.repo(Users).count()} rows`);
    console.log(`tenants: ${await remult.repo(Tenant).count()} rows`);

    console.log("starting import");
    console.time("import");
    await seed(remult);
    await importVolunteers(remult);
    await importTenants(remult);
    console.timeEnd("import");
    console.log("finished import");

    console.log(`users: ${await remult.repo(Users).count()} rows`);
    console.log(`tenants: ${await remult.repo(Tenant).count()} rows`);
}

async function seed(remult: Remult) {
    // Create admin user if not exists.
    let count = await remult.repo(Users).count();
    if (count === 0) {
        let u = remult.repo(Users).create();
        u.admin = true;
        u.name = "admin";
        u.mobile = "0555555555"
        await u.create(process.env.DEFAULT_PASSWORD);
        console.log("created admin");
    }
}
 
async function importVolunteers(remult: Remult) {
    let b = await remult.repo(Branch).findFirst({ where: row => row.name.contains(branch) });
    if (!b) {
        debug(`Found NO branch for ${branch} `);
        return;
    }
    let file = folder + '\\' + branch + '\\volunteers.txt';
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
        if (line && line.length > 0) {
            let name = '';
            let mobile = '';
            let split = line.split(',');
            if (split.length > 0) {
                name = split[0].trim();
            }
            if (split.length > 1) {
                mobile = split[1].trim();
            }
            // console.log(name, '::', mobile);

            let u = remult.repo(Users).create();
            u.bid = b;
            u.volunteer = true;
            u.name = name;
            u.mobile = mobile;
            u.email = process.env.EMAIL_TESTER!;
            try { await u.save(); }
            catch (err) {
                console.log(name, '::', mobile, '::', err);
            }
            // break;
        }
    }
}

async function importTenants(remult: Remult) {
    let b = await remult.repo(Branch).findFirst({ where: row => row.name.contains(branch) });
    if (!b) {
        debug(`Found NO branch for ${branch} `);
        return;
    }
    let file = folder + '\\' + branch + '\\tenants.txt';
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
        if (line && line.length > 0) {
            let name = '';
            let mobile = '';
            let address = '';
            let split = line.split(',');
            if (split.length > 0) {
                name = split[0].trim();
            }
            if (split.length > 1) {
                mobile = split[1].trim();
            }
            if (split.length > 2) {
                address = split[2].trim();
            }
            // console.log(name, '::', mobile, '::', address);

            let t = remult.repo(Tenant).create();
            t.bid = b;
            t.name = name;
            t.mobile = mobile;
            t.address = address;
            t.birthday = new Date(1950, 0, 1);
            t.age = new Date().getFullYear() - 1950;
            try { await t.save(); }
            catch (err) {
                console.log(name, '::', mobile, '::', address, '::', err);
            }
            // break;
        }
    }
}
