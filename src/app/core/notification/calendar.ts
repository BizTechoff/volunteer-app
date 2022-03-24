import { Entity, Field, IdEntity } from "remult";

@Entity('calendar',
    (options, remult) => {
        options.allowApiCrud = false
    }
)
export class Calendar extends IdEntity {

    @Field({ includeInApi: false })
    email!: string//name

    @Field({ includeInApi: false })
    display!: string

    @Field({ includeInApi: false })
    clientId!: string

    @Field({ includeInApi: false })
    secretId!: string

    @Field({ includeInApi: false })
    tokenId!: string

    @Field({})
    frame!: string

    @Field({})
    color!: string


    async hashAndSetPassword(clientId: string, secretId: string, tokenId: string) {
        let hash = await import('password-hash')
        this.clientId = hash.generate(clientId);
        this.secretId = hash.generate(secretId);
        this.tokenId = hash.generate(tokenId);
    }

    async passwordMatches(clientId: string, secretId: string, tokenId: string) {
        let hash = await import('password-hash')
        let result = true
        result &&= !this.clientId || hash.verify(clientId, this.clientId)
        result &&= !this.secretId || hash.verify(secretId, this.secretId)
        result &&= !this.tokenId || hash.verify(tokenId, this.tokenId)
        return result
    }

}
