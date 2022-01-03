import { debug } from 'console';
import { Remult } from 'remult';
import { Branch } from '../app/core/branch/branch';
import { Tenant } from '../app/core/tenant/tenant';
import { Langs, Users } from '../app/users/users';

let folder = `D:\\documents\\אשל ירושלים\\הסבה\\`;
let branches = [] as string[];
// branches.push('קריית אונו');
// branches.push('נס ציונה');
// branches.push('חיפה');
// branches.push('חולון');
// branches.push('זכרון יעקב');
// branches.push('חדרה');
// branches.push('יבנה');
// branches.push('נתניה');
// branches.push('עומר');
branches.push('ראשון לציון');
 
let branch = '';

let mobileCounter = 117;
 
export async function importDataNew(remult: Remult) {

    console.log(`users: ${await remult.repo(Users).count()} rows`);
    console.log(`tenants: ${await remult.repo(Tenant).count()} rows`);

    console.log("starting import");
    console.time("import");
    await seed(remult);
    // await remult.setUser({ id: "API", name: "API", roles: [], bid: '', bname: '' });

    for (const brn of branches) {
        branch = brn;
  
        // await importVolunteers(remult);
        // await importTenants(remult);
        // await importTenantVolunteers(remult);
  
    }
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
        u.mobile = "0526526063";
        await u.create(process.env.DEFAULT_PASSWORD);
        console.log("created admin");
    }
}

async function importVolunteers(remult: Remult) {
    let b = await remult.repo(Branch).findFirst({ name: { $contains: branch } });
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
            let email = '';
            let birthday: Date = null!;
            let age = 0;
            let langs = [] as string[];

            let split = line.split(',');
            // console.log(split);
            // break;
            if (split.length > 0) {
                name = split[0].trim();
            }
            if (split.length > 1) {
                mobile = split[1].trim();
            }
            if (split.length > 2) {
                email = split[2].trim().toLowerCase();
            }
            if (split.length > 3) {
                langs = split[3].split("|");
            }
            if (split.length > 4) {
                let bd = split[4].trim();
                if (bd.length > 0) {
                    birthday = new Date(bd);
                    age = new Date().getFullYear() - birthday.getFullYear();
                }
            }
            // console.log('name', name, 'mobile', mobile, 'langs', langs, 'email', email, 'birthday', birthday);
 
            let ls = [Langs.hebrew] as Langs[];
            for (const l of langs) {
                // ls.push(Langs.hebrew);
                if (l === Langs.english.caption) {
                    ls.push(Langs.english);
                }
                else if (l === Langs.russian.caption) {
                    ls.push(Langs.russian);
                }
            }

            if (email.length === 0) {
                email = process.env.EMAIL_TESTER!;
            }

            let u = remult.repo(Users).create();
            u.bid = b;
            u.volunteer = true;
            u.name = name;
            u.mobile = mobile;
            u.email = email;
            u.birthday = birthday;
            u.age = age;
            u.langs = ls;
            try { await u.save(); }
            catch (err) {
                console.log('importVolunteers.line: ', line, err);
            }
            // break; 
        }
    }
}

async function importTenants(remult: Remult) {
    let b = await remult.repo(Branch).findFirst({ name: { $contains: branch } });
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
            // console.log(split);
            // break; 
            if (split.length > 0) {
                name = split[0].trim();
            }
            if (split.length > 1) {
                mobile = split[1].trim();
            }
            if (split.length > 2) {
                address = split[2].trim();
                // if(!address.endsWith(branch) && !address.endsWith('קרית אונו')){
                //     address = address + ' ' + branch;
                // }
            }

            if (mobile.length == 0) {
                ++mobileCounter;
                mobile = mobileCounter.toString().padStart(10, '0');
            }

            // console.log(name, '::', mobile, '::', address);
            // break;
            let t = remult.repo(Tenant).create();
            t.bid = b;
            t.name = name;
            t.mobile = mobile;
            t.address = address;
            t.birthday = new Date(1902, 1, 2);
            t.age = new Date().getFullYear() - t.birthday.getFullYear();
            try { await t.save(); }
            catch (err) {
                console.log('importTenants.line: ', line, err);
            }
            // break;
        }
    }
}

async function importTenantVolunteers(remult: Remult) {
    let b = await remult.repo(Branch).findFirst({ name: { $contains: branch } });
    if (!b) {
        debug(`Found NO branch for ${branch} `);
        return;
    }
    let file = folder + '\\' + branch + '\\tenant-volunteers.txt';
    try {
        if (require('fs').existsSync(file)) {
            //file exists
        }
    } catch (err) {
        console.error(`File(${file}) NOT exists: ${err}`)
        return;
    }
    let lines: string[] = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
        if (line && line.length > 0) {
            let volunteers = [] as string[];
            let tenant = '';

            let split = line.split(',');
            if (split.length > 0) {
                volunteers = split[0].split('|').map(v => v.trim());
            }
            if (split.length > 1) {
                tenant = split[1].trim();
            }

            if (volunteers.length > 0) {

                // if (volunteers.length > 1) {
                //     console.log(volunteers);
                // break;
                // }
                // [ 'אילנה קרימוב', "גל מרקוביץ'" ]
                let t = await remult.repo(Tenant).findFirst({ name: tenant });
                if (!t) {
                    console.log(`NOT found tenant: ${tenant}`);
                    continue;
                }

                for (const v of volunteers) {
                    if (!v || v.trim().length == 0) {
                        continue;
                    }
                    let u = await remult.repo(Users).findFirst({ name: v });
                    if (!u) {
                        console.log(`NOT found volunteer: ${v} for tenant: ${t.name}`);
                        continue;
                    }
                    let f = t.defVids.find(row => row.id === u.id);
                    if (!f) {
                        t.defVids.push({ id: u.id, name: u.name });
                    }
                    // else {
                    //     console.log(`already exists volunteer: ${u.name, u.id}`);
                    // }
                }// break;

                if (t.defVids.length > 0) {
                    try { await t.save(); }
                    catch (err) {
                        console.log('importTenantVolunteers.line: ', line, err);
                    }
                }
            }
        }
    }
}
