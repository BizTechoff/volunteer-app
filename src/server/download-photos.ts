import { Remult } from 'remult';
import { Photo } from '../app/core/photo/photo';


export async function downloadPhotos(remult: Remult) {
    let folder = `D:\\documents\\אשל ירושלים\\הסבה\\תמונות\\`;
    let fs = require('fs');
    for await (const p of remult.repo(Photo).query({
        where: { link: '' }
    })) {

        let data = '';// p.data.replace("data:image/png;base64,", '');
        const buf = Buffer.from(data, "base64");
        await fs.writeFile(folder + p.title, data, function (err: any) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });

        // var canvas = document.createElement("canvas");
        // canvas.pngStream();

        //data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA
        //let data = p.data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        // const data = p.data.replace(/^data:image\/\w+;base64,/, "");
        

        // await fs.writeFile(folder + p.title, buf);
        // , function(err: any) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });

        // let data = p.data.replace("image/png", "image/octet-stream");// //.replace('data:image/png;base64,', "");
        // await require('fs').writeFile(folder + p.title, data, function(err: any) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });
    }
}