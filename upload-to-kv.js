var https = require('https');
var path = require('path');
var fs = require('fs');

const args = require('minimist')(process.argv.slice(2))



let directory = args['dir']

traverseDir(directory)

function traverseDir(directory) {
    fs.readdir(directory, function(err, items) {
        for (var i=0; i<items.length; i++) {
            let key = items[i]
            fs.lstat(`${directory}${key}`, (err, stats) => {
                console.log(`${directory}${key}`)
                if(err) {
                    return console.log(err); //Handle error
                }
                if(stats.isFile()) {
                    console.log(`key: ${key}`)
                    console.log(`directory: ${directory}`)
                    console.log(`pop: ${directory.split('/').pop()}`)
                    let parent = directory.split('/').pop()
                    let kvKey = key
                    if (parent != "public"){ 
                        kvKey = `${parent}/${key}`
                    }
                    uploadFile(kvKey, `${directory}${key}`)
                }
                else if(stats.isDirectory() && key != 'my-app') {
                    traverseDir(`${directory}${key}/`)
                }
            });            
        }
    });
}


function uploadFile(fileName, file) {
    //console.log(fileName)
    var headers = {
        'X-Auth-Email': 'ritakozlov@gmail.com',
        'X-Auth-Key': 'f201d9b773467b9e02d52793297b15f7c0f2c'
    };

    var options = {
        host: 'api.cloudflare.com',
        method: 'PUT',
        headers: headers,
        path: `/client/v4/accounts/75f4046a20169dc2ff68df64f8a7e2ab/storage/kv/namespaces/359eff3a1f2c4fa79e21713931e41c13/values/${fileName}`
    };


    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`)
    })


    req.on('error', (error) => {
        console.error(error)
    })

    let reqBody

    let data = '';

    // Create a readable stream
    let readableStream = fs.createReadStream(file);

    // Set the encoding to be utf8. 
    readableStream.setEncoding('UTF8');

    // Handle stream events --> data, end,
    readableStream.on('data', function(chunk) {
    data += chunk;
    req.write(chunk)
    });

    readableStream.on('end', function() {
        req.end()
    });
}