import { Entity, Field, IdEntity } from "remult";
import { terms } from "../../terms";

@Entity<VolunteerCraw>('VolunteersCraws', { allowApiCrud: true })
export class VolunteerCraw extends IdEntity {

    @Field({ caption: terms.name,  })
    name: string = '';

    @Field({ caption: terms.volunteer })
    vid1: string = '';

    @Field({ caption: terms.volunteer })
    vid2: string = '';

    @Field({ caption: terms.volunteer })
    vid3: string = '';

    @Field({ caption: terms.volunteer })
    vid4: string = '';

    @Field({ caption: terms.volunteer })
    vid5: string = '';
}
