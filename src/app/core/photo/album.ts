import { Users } from "../../users/users";
import { Activity } from "../activity/activity";
import { Branch } from "../branch/branch";

export class AlbumMediaType {
    static photo = new AlbumMediaType();
    static video = new AlbumMediaType();
    static text = new AlbumMediaType();
}

export class Album {

    branch: Branch = null!;

    activity: Activity = null!;

    type: AlbumMediaType = AlbumMediaType.photo;

    text: string = '';

    url: string = '';

    createdBy: Users = null!;

    created: Date = new Date();

}
