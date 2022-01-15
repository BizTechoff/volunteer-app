import { debug } from 'console';
import { Remult } from 'remult';
import { Branch } from '../app/core/branch/branch';
import { Tenant } from '../app/core/tenant/tenant';
import { Langs, Users } from '../app/users/users';


export interface volunteerInfo {
    bid: string,
    name: string,
    mobile: string,
    phone: string,
    langs: string,
    birthday: Date,
    age: Date,
    email: string
}

export interface tenantInfo {
    bid: string,
    name: string,
    mobile: string,
    phone: string,
    langs: string,
    birthday: Date,
    age: Date,
    address: string,
    addressRemark: string,
    floor: string,
    apartment: string
}

export interface tenantVolunteersInfo {
    tenant: string,
    volunteers: string
}

let folder = `D:\\documents\\אשל ירושלים\\הסבה\\`;
let branches = [] as string[];
// branches.push('אשקלון');
// branches.push('זכרון יעקב');
// branches.push('חולון');
// branches.push('חיפה'); 
// branches.push('ירושלים');
// branches.push('נס ציונה');
// branches.push('קריית אונו');
// branches.push('ראשון לציון');
// branches.push('דימונה');
// branches.push('חדרה');
// branches.push('יבנה');
// branches.push('נתניה');
// branches.push('עומר');
// branches.push('קריית גת');
// -------------------------------
// -------------------------------

// נסים בוארון | 0584877770
// branches.push('דימונה');//***
// אלי לוין | 0
// branches.push('חדרה');
// אין | 0
// branches.push('יבנה');
// שניאור לנדא | 0527703130
// branches.push('נתניה');//****
// יודי פלמן | 0542006801
// branches.push('עומר');//**** 
// יוראי ברימט | 0528443544 
// branches.push('קריית גת');//****
// -------------------------------
// branches.push('לוד');// אין קובץ
// מנדי טורקוב | 0584577012 
// branches.push('טבריה');// סלולרים נראים כמו ת.ז
   
let saveToDb = false;

let vMobileCounter = 117;
let tMobileCounter = 117;

export async function importDataNew(remult: Remult) {

    console.log(`users: ${await remult.repo(Users).count()} rows`);
    console.log(`tenants: ${await remult.repo(Tenant).count()} rows`);

    console.log("starting import");
    console.time("import");
    await seed(remult);
    // await remult.setUser({ id: "API", name: "API", roles: [], bid: '', bname: '' });

    // get last volunteer's mobile counter
    vMobileCounter = 0;
    let max = await remult.repo(Users).findFirst({ mobile: { '<': '050-000-1000' } }, { orderBy: { mobile: 'desc' } })
    if (max) {
        let split = max.mobile.split('-');
        vMobileCounter = parseInt(split[split.length - 1])
    }

    // get last tenant's mobile counter
    tMobileCounter = 0;
    let tmax = await remult.repo(Tenant).findFirst({ mobile: { '<': '0000001000' } }, { orderBy: { mobile: 'desc' } })
    if (tmax) {
        tMobileCounter = parseInt(tmax.mobile)
    }

    console.log('vMobileCounter', vMobileCounter)
    console.log('tMobileCounter', tMobileCounter)

    for (const brn of branches) {
        let b = await remult.repo(Branch).findFirst({ name: { $contains: brn } });
        if (!b) {
            debug(`Found NO branch for ${brn} `);
            continue;
        }

        debug(`Importing Branch: ${brn}..`);

        await importVolunteers(b, remult);
        await importTenants(b, remult);
        await importTenantVolunteers(b, remult);

        debug(`Finished Import Branch: ${brn}..`);

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

async function importVolunteers(branch: Branch, remult: Remult) {
    let file = folder + '\\' + branch.name + '\\volunteers.txt';
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    let today = new Date();
    for (const line of lines) {
        if (line && line.length > 0) {
            let info = JSON.parse(line) as volunteerInfo;
            if (!info.mobile || info.mobile.length == 0) {
                ++vMobileCounter;
                info.mobile = '050-000-' + vMobileCounter.toString().padStart(4, '0');
            }
            info.mobile = info.mobile.padStart(10, '0');
            if (!info.email || info.email.length === 0) {
                info.email = 'biztechoff.app@gmail.com'
            }
            if (!info.langs || info.langs.length === 0) {
                info.langs = Langs.hebrew.caption;
            }

            let u = await remult.repo(Users).findFirst({ mobile: info.mobile }, { createIfNotFound: true });
            if (u.hasBranch()) {
                console.log(`Found volunteer ${u.name} and update his fields`)
                if (u.bid?.id !== branch.id) {
                    u.branch2 = branch;
                }
            }
            else {
                u.bid = branch;
                u.name = info.name;
                u.mobile = info.mobile;
            }
            u.volunteer = true;
            u.email = info.email;
            if (info.birthday && info.birthday.toString().length > 0) {
                u.birthday = new Date(info.birthday);
                u.age = today.getFullYear() - u.birthday.getFullYear();
            }
            u.langs = Langs.fromStringByCaption(info.langs);
            if (saveToDb) {
                try { await u.save(); }
                catch (err) {
                    console.log('importVolunteers.line: ', line, err);
                }
            }
        }
    }
}

async function importTenants(branch: Branch, remult: Remult) {
    let file = folder + '\\' + branch.name + '\\tenants.txt';
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    let today = new Date();
    for (const line of lines) {
        if (line && line.length > 0) {
            // console.log(line)
            let info = JSON.parse(line) as tenantInfo;
            if (!info.mobile || info.mobile.length == 0) {
                ++tMobileCounter;
                info.mobile = tMobileCounter.toString().padStart(10, '0');
            }
            info.mobile = info.mobile.padStart(10, '0');
            if (!info.langs || info.langs.length === 0) {
                info.langs = Langs.hebrew.caption;
            }
            if (!info.mobile.startsWith('05')) {
                if (!info.mobile.startsWith('000')) {
                    if (info.mobile.startsWith('00')) {
                        info.mobile = info.mobile.substring(1);
                    }
                }
            }
            let t = remult.repo(Tenant).create();
            t.bid = branch;
            t.name = info.name;
            t.mobile = info.mobile;
            t.phone = info.phone;
            t.langs = Langs.fromStringByCaption(info.langs);
            if (info.birthday && info.birthday.toString().length > 0) {
                t.birthday = new Date(info.birthday);
                t.age = today.getFullYear() - t.birthday.getFullYear();
            }
            t.address = info.address;
            t.addressRemark = info.addressRemark;
            t.floor = info.floor;
            t.apartment = info.apartment;

            if (saveToDb) {
                try { await t.save(); }
                catch (err) {
                    console.log('importTenants.line: ', line, err);
                }
            }
        } 
    }
}

async function importTenantVolunteers(branch: Branch, remult: Remult) {
    let file = folder + '\\' + branch.name + '\\tenant-volunteers.txt';
    let lines: string[] = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
        if (line && line.length > 0) {
            let info = JSON.parse(line) as tenantVolunteersInfo;
            if (info.volunteers.length > 0) {
                let t = await remult.repo(Tenant).findFirst({ name: info.tenant });
                if (!t) {
                    console.log(`NOT found tenant: ${info.tenant}`);
                    continue;
                }

                for (const v of info.volunteers.split(',')) {
                    if (!v || v.trim().length == 0) {
                        continue;
                    }
                    let u = await remult.repo(Users).findFirst({ name: v.trim() });
                    if (!u) {
                        console.log(`NOT found volunteer: ${v} for tenant: ${t.name}`);
                        continue;
                    }
                    let f = t.defVids.find(row => row.id === u.id);
                    if (!f) {
                        t.defVids.push({ id: u.id, name: u.name });
                    }
                }

                if (saveToDb) {
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
}


// async function importVolunteers1(remult: Remult) {
//     let b = await remult.repo(Branch).findFirst({ name: { $contains: branch } });
//     if (!b) {
//         debug(`Found NO branch for ${branch} `);
//         return;
//     }
//     let file = folder + '\\' + branch + '\\volunteers.txt';
//     let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
//     for (const line of lines) {
//         if (line && line.length > 0) {
//             let name = '';
//             let mobile = '';
//             let email = '';
//             let birthday: Date = null!;
//             let age = 0;
//             let langs = [] as string[];

//             let split = line.split(',');
//             // console.log(split);
//             // break;
//             if (split.length > 0) {
//                 name = split[0].trim();
//             }
//             if (split.length > 1) {
//                 mobile = split[1].trim();
//             }
//             if (split.length > 2) {
//                 email = split[2].trim().toLowerCase();
//             }
//             if (split.length > 3) {
//                 langs = split[3].split("|");
//             }
//             if (split.length > 4) {
//                 let bd = split[4].trim();
//                 if (bd.length > 0) {
//                     birthday = new Date(bd);
//                     age = new Date().getFullYear() - birthday.getFullYear();
//                 }
//             }
//             // console.log('name', name, 'mobile', mobile, 'langs', langs, 'email', email, 'birthday', birthday);

//             let ls = [Langs.hebrew] as Langs[];
//             for (const l of langs) {
//                 // ls.push(Langs.hebrew);
//                 if (l === Langs.english.caption) {
//                     ls.push(Langs.english);
//                 }
//                 else if (l === Langs.russian.caption) {
//                     ls.push(Langs.russian);
//                 }
//             }

//             if (email.length === 0) {
//                 email = process.env.EMAIL_TESTER!;
//             }
//             remult.repo(Users).query({ where: {} })
//             let u = remult.repo(Users).create();
//             u.bid = b;
//             u.volunteer = true;
//             u.name = name;
//             u.mobile = mobile;
//             u.email = email;
//             u.birthday = birthday;
//             u.age = age;
//             u.langs = ls;
//             try { await u.save(); }
//             catch (err) {
//                 console.log('importVolunteers.line: ', line, err);
//             }
//             // break;
//         }
//     }
// }

// async function importTenants1(remult: Remult) {
//     let b = await remult.repo(Branch).findFirst({ name: { $contains: branch } });
//     if (!b) {
//         debug(`Found NO branch for ${branch} `);
//         return;
//     }
//     let file = folder + '\\' + branch + '\\tenants.txt';
//     let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
//     for (const line of lines) {
//         if (line && line.length > 0) {
//             // line: name,mobile,phone,email,langs,address,addressRemark,apartment,floor
//             let name = '';
//             let mobile = '';
//             let address = '';
//             let split = line.split(',');
//             // console.log(split);
//             // break;
//             if (split.length > 0) {
//                 name = split[0].trim();
//             }
//             if (split.length > 1) {
//                 mobile = split[1].trim();
//             }
//             if (split.length > 2) {
//                 address = split[2].trim();
//                 // if(!address.endsWith(branch) && !address.endsWith('קרית אונו')){
//                 //     address = address + ' ' + branch;
//                 // }
//             }

//             if (mobile.length == 0) {
//                 ++vMobileCounter;
//                 mobile = vMobileCounter.toString().padStart(10, '0');
//             }

//             // console.log(name, '::', mobile, '::', address);
//             // break;
//             let t = remult.repo(Tenant).create();
//             // t.bid = b;
//             // t.name = name;
//             // t.mobile = mobile;
//             // t.phone = phone;
//             // t.birthday = new Date(1902, 1, 2);
//             // t.age = new Date().getFullYear() - t.birthday.getFullYear();
//             // t.address = address;
//             // t.addressRemark = addressRemark;
//             // t.floor = floor;
//             // t.apartment = apartment;
//             try { await t.save(); }
//             catch (err) {
//                 console.log('importTenants.line: ', line, err);
//             }
//             // break;
//         }
//     }
// }

// async function importTenantVolunteers1(remult: Remult) {
//     let b = await remult.repo(Branch).findFirst({ name: { $contains: branch } });
//     if (!b) {
//         debug(`Found NO branch for ${branch} `);
//         return;
//     }
//     let file = folder + '\\' + branch + '\\tenant-volunteers.txt';
//     try {
//         if (require('fs').existsSync(file)) {
//             //file exists
//         }
//     } catch (err) {
//         console.error(`File(${file}) NOT exists: ${err}`)
//         return;
//     }
//     let lines: string[] = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
//     for (const line of lines) {
//         if (line && line.length > 0) {
//             let volunteers = [] as string[];
//             let tenant = '';

//             let split = line.split(',');
//             if (split.length > 0) {
//                 volunteers = split[0].split('|').map(v => v.trim());
//             }
//             if (split.length > 1) {
//                 tenant = split[1].trim();
//             }

//             if (volunteers.length > 0) {

//                 // if (volunteers.length > 1) {
//                 //     console.log(volunteers);
//                 // break;
//                 // }
//                 // [ 'אילנה קרימוב', "גל מרקוביץ'" ]
//                 let t = await remult.repo(Tenant).findFirst({ name: tenant });
//                 if (!t) {
//                     console.log(`NOT found tenant: ${tenant}`);
//                     continue;
//                 }

//                 for (const v of volunteers) {
//                     if (!v || v.trim().length == 0) {
//                         continue;
//                     }
//                     let u = await remult.repo(Users).findFirst({ name: v });
//                     if (!u) {
//                         console.log(`NOT found volunteer: ${v} for tenant: ${t.name}`);
//                         continue;
//                     }
//                     let f = t.defVids.find(row => row.id === u.id);
//                     if (!f) {
//                         t.defVids.push({ id: u.id, name: u.name });
//                     }
//                     // else {
//                     //     console.log(`already exists volunteer: ${u.name, u.id}`);
//                     // }
//                 }// break;

//                 if (t.defVids.length > 0) {
//                     try { await t.save(); }
//                     catch (err) {
//                         console.log('importTenantVolunteers.line: ', line, err);
//                     }
//                 }
//             }
//         }
//     }
// }
