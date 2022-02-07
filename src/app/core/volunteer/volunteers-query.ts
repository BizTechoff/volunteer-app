import { Allow, BackendMethod, EntityFilter, Remult } from "remult";
import { Users } from "../../users/users";

export class VolunteersQuery {

    @BackendMethod({ allowed: Allow.authenticated })
    static async byBranch(branch: string, remult?: Remult): Promise<Users[]> {
        let result = [] as Users[]
        for await (const u of remult!.repo(Users).query({
            where: {
                active: true,
                $or: [
                    { bid: { $id: branch } },
                    { branch2: { $id: branch } }
                ]
            }
        })) {
            result.push(u)
        }
        return result
    }

}
