import { Remult } from "remult";
import { Tenant } from "../app/core/tenant/tenant";
import { Users } from "../app/users/users";

export async function exportData(remult: Remult) {
    await exportAddresses(remult)
}

export async function exportVolunteers(remult: Remult) {
    let branches = [
        'עומר',
        'קריית אונו',
        'חולון ב',
        'זכרון יעקב',
        'יבנה',
        'אילת נוער',
        'נס ציונה',
        'שדרות',
        'דימונה'
    ]

    let result: { bname: string, vnames: string[] }[] = []
    // let count = 10;
    for await (const v of remult.repo(Users).query({ where: { volunteer: true } })) {
        let f = result.find(itm => itm.bname === v.bid!.name)
        if (!f) {
            f = { bname: v.bid!.name, vnames: [] }
            result.push(f)
        }
        f.vnames.push(v.name)
    }
    for (const itm of result) {
        if (branches.includes(itm.bname)) continue
        // --count
        // if(count == 0) break;
        console.log()
        console.log(itm.bname)
        console.log('------------')
        itm.vnames.sort((a, b) => a.localeCompare(b))
        for (const adr of itm.vnames) {
            console.log(adr)
        }
    }
}

export async function exportAddresses(remult: Remult) {
    let result: { bname: string, addresses: string[] }[] = []
    for await (const t of remult.repo(Tenant).query({})) {
        let f = result.find(itm => itm.bname === t.bid.name)
        if (!f) {
            f = { bname: t.bid.name, addresses: [] }
            result.push(f)
        }
        f?.addresses.push(`${t.name}: ${t.address}`)
    }
    for (const itm of result) {
        console.log()
        console.log(itm.bname)
        console.log('------------')
        itm.addresses.sort((a, b) => a.localeCompare(b))
        for (const adr of itm.addresses) {
            console.log(adr)
        }
    }
}