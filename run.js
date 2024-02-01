import dotenv from 'dotenv';
import * as path from 'node:path'
dotenv.config();
import fs from 'fs';
import FileParser from './parser/FileParser.js'

function parseDirectory(directory) {

    fs.readdir(directory, (err, files) => {
       
        if (err) throw err

        for (const file of files) {
            const filePath = path.join(directory, file);

            fs.stat(filePath, (err, fileStat) => {
                
                if (err) throw err;

                // run on subdirectory
                if (fileStat.isDirectory()) {
                    parseDirectory(filePath);
                    return;
                }

                // check file
                if (file.endsWith(process.env.TARGET_FILE_EXTENSION)) {
                   // console.log("found " + filePath);
                    FileParser(filePath);
                }
            })
        }
    });

}

parseDirectory(process.env.UNREAL_MODULE_PATH);