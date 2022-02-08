import { Allow, BackendMethod, Remult } from "remult";
import { Activity, ActivityStatus } from "../activity/activity";
import { Tenant } from "../tenant/tenant";

export class TenantsQuery {

    @BackendMethod({ allowed: Allow.authenticated })
    // static async noActivity(branch: string, from?: Date, to?: Date, search?: string, remult?: Remult): Promise<Tenant[]> {
    static async noActivity(search?: string, remult?: Remult): Promise<Tenant[]> {
        let result = [] as Tenant[]

        let branch = remult!.user.branch!
        let from = new Date()
        from = new Date(
            from.getFullYear(),
            from.getMonth(),
            from.getDate() - from.getDay() + 1);// >= sunday midnigth this week
        let to = new Date(
            from.getFullYear(),
            from.getMonth(),
            from.getDate() + 7);// < sunday midnigth next week

        // console.log('branch', branch, 'to', to, 'from', from, 'search', search)

        let actTnts = [] as string[]
        for await (const a of remult!.repo(Activity).query({
            where: {
                bid: { $id: branch },
                date: { "<": to, ">=": from },
                status: { $ne: ActivityStatus.cancel }
            }
        })) {
            if (a.tid?.id) {
                actTnts.push(a.tid.id)
            }
        }
 
        // console.log('found', actTnts.length, 'tenants with NO activity')
        
        // search = (search ?? '').trim()
        if (!search) {
            search = ''
        }
        search = search.trim()
        for await (const t of remult!.repo(Tenant).query({
            where: {
                active: true,
                bid: { $id: branch },
                id: { $ne: actTnts },
                name: search.length > 0 ? { $contains: search } : undefined
            }
        })) {
            result.push(t)
        }

        // console.log('result.length', result.length)
        return result
    }

}
