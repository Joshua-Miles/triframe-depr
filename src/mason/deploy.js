const fsSync = require('fs')
const fs = fsSync.promises
const exec = require('util').promisify(require('child_process').exec)
const ncp = require('ncp').ncp;
const Path = require('path')
const fetch = require('node-fetch')
const open = require('opn')
const express = require('express')
const bodyParser = require('body-parser')
const { Octokit } = require("@octokit/rest");
const { Repository, Reference, Signature, Remote, Cred } = require("nodegit")

const STATE_STORAGE = '.triframe'
const GOOGLE_CLIENT_ID = '1009774431187-m11c1cekqfsnt48pb7cl25d13kq15sj3.apps.googleusercontent.com'

const BASE_DISK_NAME = 'triframe-base'


const userName = 'joshua-miles'
const personalAccessToken = `65dd359783bf161f13d1ec31c515b0e92e9369cc`
const projectName = 'spiral'
const repoName = projectName
const gcProjectName = 'spiral-app'
const gcRegion = 'us-central1'


let octokit, gccOAuthToken;

export default async (name) => {

    gccOAuthToken = await getGoogleCredentials()

    let duplicate = await findDuplicate(name)

    if (duplicate) throw Error(`Duplicate Deployment name "${name}", please pick a different name`)

    octokit = new Octokit({
        auth: personalAccessToken
    });

    const repository = await openRepository()

    await buildProject()

    await repository.checkoutBranch('production')

    await formatDistribution()

    await addCommitAndPush(repository, name)

    const release = await createRelease(name)

    const { tarball_url } = release.data

    await createInstanceTemplate(tarball_url, name)

    await createOrUpdateInstanceGroup(name)

    await repository.checkoutBranch('master')

    console.log('Deployment Complete')
}

const rmDir = function (path) {
    if (fsSync.existsSync(path)) {
        fsSync.readdirSync(path).forEach((file, index) => {
            const curPath = Path.join(path, file);
            if (fsSync.lstatSync(curPath).isDirectory()) { // recurse
                rmDir(curPath);
            } else { // delete file
                fsSync.unlinkSync(curPath);
            }
        });
        fsSync.rmdirSync(path);
    }
};

const sendRequest = ({ method, url, body, headers }) => {
    const delimeter = url.includes('?') ? '&' : '?'
    return fetch(`${url}${delimeter}access_token=${gccOAuthToken}`, {
        method,
        body: JSON.stringify(body),
        headers: { ...headers, 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }).then(async response => {
        return response.json()
    })
        .then(async result => {
            if (!result.error) {
                return result
            } else if (result.error.code == 401) {
                await saveState({ token: null })
                gccOAuthToken = await getGoogleCredentials()
                return sendRequest({ method, url, body, headers })
            } else {
                let error = new Error(result.error.message);
                Object.assign(error, result.error)
                throw error
            }
        })
}


const get = (url, body = {}, headers = {}) => {
    const method = "GET"
    return sendRequest({ method, url, body, headers })
}

const post = (url, body = {}, headers = {}) => {
    const method = "POST"
    return sendRequest({ method, url, body, headers })
}

const patch = (url, body = {}, headers = {}) => {
    const method = "PATCH"
    return sendRequest({ method, url, body, headers })
}

const put = (url, body = {}, headers = {}) => {
    const method = "PUT"
    return sendRequest({ method, url, body, headers })
}

const del = (url, body = {}, headers = {}) => {
    const method = "DELETE"
    return sendRequest({ method, url, body, headers })
}

const openRepository = async () => {
    const repository = await Repository.open(Path.resolve(__dirname, "../.git"))
    const statuses = await repository.getStatus()
    const everythingIsCommited = statuses.length === 0

    if (!everythingIsCommited) throw Error('You have uncommitted changes. Please commit or revert, then try again.')
    return repository
}

const buildProject = async () => {
    console.log('Building Frontend')

    await exec('expo build:web')

    console.log('Building Backend')

    await exec('npx webpack --config api.config.js')

    await ncp('./web-build', './dist/public')

}

const formatDistribution = async () => {
    await ncp('./dist/public', './public')
    await ncp('./dist/index.js', './index.js')
    await sleep(3000)
    await rmDir('./web-build')
    await rmDir('./dist')
}

const addCommitAndPush = async (repository, name) => {
    await exec('git add ./public')
    await exec('git add ./index.js')
    await exec(`git commit -m "Build for Deployment ${name}"`)
    await exec('git push origin production')
}

const createRelease = async (name) => {
    return await octokit.repos.createRelease({
        name: name,
        tag_name: `deployment@${name}`,
        repo: repoName,
        target_commitish: 'production',
        owner: userName
    })
}

const findDuplicate = async (name) => {
    name = `${projectName}-${name.replace(/\./g, '-')}`
    let { items: templates } = await get(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/global/instanceTemplates`)
    return templates.find(template => template.name === name)
}

const createOrUpdateInstanceGroup = async name => {
    name = `${projectName}-${name.replace(/\./g, '-')}`
    let { items: instanceGroups } = await get(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/zones/${gcRegion}-a/instanceGroupManagers`)
    let group = instanceGroups.find(group => group.name === projectName)
    let operation;
    if (!group) {
        console.log('Creating New Instance Group...')
        operation = await post(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/zones/${gcRegion}-a/instanceGroupManagers`, {
            name: projectName,
            instanceTemplate: `projects/${gcProjectName}/global/instanceTemplates/${name}`,
            baseInstanceName: projectName,
            targetSize: 1
        })
    } else {
        console.log('Starting Rolling Update...')
        operation = await patch(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/zones/${gcRegion}-a/instanceGroupManagers/${projectName}`, {
            instanceTemplate: `projects/${gcProjectName}/global/instanceTemplates/${name}`,
        })
    }
    await completionOf(operation)
    console.log('Update Complete')
}

const createInstanceTemplate = async (tarball_url, name) => {
    name = `${projectName}-${name.replace(/\./g, '-')}`
    await findOrCreateDisk()
    await findOrCreateBucket()
    const { gcBucketName } = await getState()
    console.log('Creating Instance Template...')
    const operation = await post(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/global/instanceTemplates`, {
        "name": name,
        "description": "",
        "properties": {
            "machineType": "g1-small",
            "displayDevice": {
                "enableDisplay": false
            },
            "metadata": {
                "kind": "compute#metadata",
                "items": [
                    {
                        "key": "startup-script",
                        "value": createStartupScript(tarball_url, gcBucketName)
                    }
                ]
            },
            "tags": {
                "items": [
                    "http-server",
                    "https-server"
                ]
            },
            "disks": [
                {
                    "kind": "compute#attachedDisk",
                    "type": "PERSISTENT",
                    "boot": true,
                    "mode": "READ_WRITE",
                    "autoDelete": true,
                    "deviceName": "instance-template-5",
                    "initializeParams": {
                        "sourceImage": `projects/${gcProjectName}/global/images/${BASE_DISK_NAME}`,
                        "diskType": "pd-standard",
                        "diskSizeGb": "10",
                        "labels": {}
                    }
                }
            ],
            "canIpForward": false,
            "networkInterfaces": [
                {
                    "kind": "compute#networkInterface",
                    "network": `projects/${gcProjectName}/global/networks/default`,
                    "accessConfigs": [
                        {
                            "kind": "compute#accessConfig",
                            "name": "External NAT",
                            "type": "ONE_TO_ONE_NAT",
                            "networkTier": "PREMIUM"
                        }
                    ],
                    "aliasIpRanges": []
                }
            ],
            "labels": {},
            "scheduling": {
                "preemptible": false,
                "onHostMaintenance": "MIGRATE",
                "automaticRestart": true,
                "nodeAffinities": []
            },
            "reservationAffinity": {
                "consumeReservationType": "ANY_RESERVATION"
            },
            "shieldedInstanceConfig": {
                "enableSecureBoot": false,
                "enableVtpm": true,
                "enableIntegrityMonitoring": true
            }
        }
    })
    await completionOf(operation)
    console.log('Created Instance Template')
}

const findOrCreateDisk = async () => {
    let result = await get(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/global/images`)
    const disks = result.items || []
    const disk = disks.find(disk => disk.name === BASE_DISK_NAME)
    if (!disk) await createDisk()
}


const findOrCreateBucket = async () => {
    const { gcBucketName } = await getState()
    if(gcBucketName === undefined) return createBucket()
    let result = await get(`https://storage.googleapis.com/storage/v1/b?project=${gcProjectName}`)
    const buckets = result.items || []
    const bucket = buckets.find(bucket => bucket.name === gcBucketName)
    if (!bucket) await createBucket()
}

const createBucket = async (name = `${projectName}-bucket`) => {
    console.log(`Creating Bucket "${name}"`)
    try {
        const response = await post(`https://storage.googleapis.com/storage/v1/b?project=${gcProjectName}`, {
            name
        })
        await saveState({ gcBucketName: response.name })
        return response
    } catch(err){
        console.log('Bucket Creation Failed...')
        return await createBucket(`${name}-${createToken()}`)
    }
}

const createDisk = async () => {
    await createDiskSource()
    console.log('Creating Disk Image...')
    const operation = await post(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/global/images`, {
        "kind": "compute#image",
        "name": BASE_DISK_NAME,
        "sourceDisk": `projects/${gcProjectName}/zones/${gcRegion}-a/disks/${BASE_DISK_NAME}`,
        "storageLocations": [
            "us"
        ]
    })
    await completionOf(operation)
    console.log('Created Disk Image')
    await destroyDiskSource()
}

const createDiskSource = async () => {
    console.log('Creating Disk Source....')
    let creation = await post(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/zones/${gcRegion}-a/instances`, {
        "kind": "compute#instance",
        "name": BASE_DISK_NAME,
        "zone": `projects/${gcProjectName}/zones/${gcRegion}-a`,
        "machineType": `projects/${gcProjectName}/zones/${gcRegion}-a/machineTypes/g1-small`,
        "displayDevice": {
            "enableDisplay": false
        },
        "metadata": {
            "kind": "compute#metadata",
            "items": [
                {
                    "key": "startup-script",
                    "value": diskStartUpScript
                }
            ]
        },
        "networkInterfaces": [
            {
                "kind": "compute#networkInterface",
                "subnetwork": "projects/spiral-app/regions/us-central1/subnetworks/default",
                "accessConfigs": [
                    {
                        "kind": "compute#accessConfig",
                        "name": "External NAT",
                        "type": "ONE_TO_ONE_NAT",
                        "networkTier": "PREMIUM"
                    }
                ],
                "aliasIpRanges": []
            },
        ],
        "disks": [
            {
                "kind": "compute#attachedDisk",
                "type": "PERSISTENT",
                "boot": true,
                "mode": "READ_WRITE",
                "autoDelete": true,
                "deviceName": BASE_DISK_NAME,
                "initializeParams": {
                    "sourceImage": "projects/ubuntu-os-cloud/global/images/ubuntu-1604-xenial-v20200407",
                    "diskType": `projects/${gcProjectName}/zones/${gcRegion}-a/diskTypes/pd-ssd`,
                    "diskSizeGb": "10"
                },
                "diskEncryptionKey": {}
            }
        ],
        "canIpForward": false,
        "description": "",
        "labels": {},
        "scheduling": {
            "preemptible": false,
            "onHostMaintenance": "MIGRATE",
            "automaticRestart": true,
            "nodeAffinities": []
        },
        "deletionProtection": false,
        "reservationAffinity": {
            "consumeReservationType": "ANY_RESERVATION"
        },
        "shieldedInstanceConfig": {
            "enableSecureBoot": false,
            "enableVtpm": true,
            "enableIntegrityMonitoring": true
        }
    })
    await completionOf(creation)
    console.log('Created Disk Source')
    console.log('Stopping Disc Source')
    let stopping = await post(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/zones/${gcRegion}-a/instances/${BASE_DISK_NAME}/stop`)
    await completionOf(stopping)
    console.log('Stopped Disc Source')
}

const destroyDiskSource = async () => {
    const operation = await del(`https://compute.googleapis.com/compute/v1/projects/${gcProjectName}/zones/${gcRegion}-a/instances/${BASE_DISK_NAME}`)
    await completionOf(operation)
    console.log('Destroyed Disk Source')
}


const completionOf = (operation) => {
    return new Promise(resolve => {
        const poll = async () => {
            const result = await post(`${operation.selfLink}/wait`)
            if (result.status === 'DONE') {
                resolve(result)
            } else {
                await sleep(5000)
                poll()
            }
        }
        poll()
    })
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const getGoogleCredentials = async () => {
    const { token } = await getState()
    if (token) return token
    else return new Promise(resolve => {
        const app = express()
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.get('/token', async (req, res) => {
            res.send(`
                <html>
                    <h1>Authentication Received</h1>
                    <h3>Return to your terminal to complete the deployment process...</h3>
                    <script>
                        var fragmentString = location.hash.substring(1);
                        var params = {};
                        var regex = /([^&=]+)=([^&]*)/g, m;
                        while (m = regex.exec(fragmentString)) {
                            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
                        }
                        fetch(\`http://localhost:${5000}/save-token/\${params['access_token']}\`)
                    </script>
                </html>
            `)
        })
        app.get('/save-token/:token', (req, res) => {
            const { token } = req.params
            saveState({ token })
            resolve(token)
            res.json({ ok: true })
            server.close()
        })
        let server = app.listen(5000)
        const redirect_uri = encodeURIComponent(`http://localhost:${5000}/token`)
        const scope = encodeURIComponent('https://www.googleapis.com/auth/cloud-platform')
        open(`https://accounts.google.com/o/oauth2/v2/auth?scope=${scope}&response_type=token&redirect_uri=${redirect_uri}&client_id=${GOOGLE_CLIENT_ID}`)
    })
}



const getState = async () => {
    try {
        let result = await fs.readFile(Path.resolve(STATE_STORAGE))
        return JSON.parse(result)
    } catch (err) {
        return {}
    }
}

const saveState = async (state) => {
    state = { ...await getState(), ...state }
    return fs.writeFile(Path.resolve(STATE_STORAGE), JSON.stringify(state))
}

const diskStartUpScript = `
    curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
    sudo apt-get install -y nodejs
`

const createStartupScript = (tarball_url, gcBucketName) => `
sleep 60
cd home/isaacsmiles
apt-get update
apt-get install authbind
chmod 500 /etc/authbind/byport/80
touch /etc/authbind/byport/80
chown isaacsmiles /etc/authbind/byport/80
touch /etc/authbind/byport/443
chmod 500 /etc/authbind/byport/443
chown isaacsmiles /etc/authbind/byport/443
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy
printf '{"type":"service_account","project_id":"spiral-app","private_key_id":"cdf0aabc6ca6d16ee324a02b2fc980f1b66c613e","private_key":"-----BEGIN PRIVATE KEY-----\\\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDnMN/ljTK6I9LJ\\\\nS3TSuCQkMU23m3aEuC1n3GDsxjCLC2RkUI3tZytFhjK1N2SMO7tMUfCobDnzDoYj\\\\nEAz5dfAbERPDJkGIhkabfElez758KvG0nfusT0zvb5bn4TsBkj+tAC+ZEf/S5KQ5\\\\niUT0kg8M2arczPLvlBFkWLJGsgRIUimvlzLij9BydZSPaQrVMkhrmbLOOkm6Ockn\\\\nFPmF31KM/2iuzYco+YZLd3NREKVqZtu59cPCJ95RNSfSDoAhvTLYSTx5LcGgn+1N\\\\nZFfYuD7dGq38ifM4HOVfksuBbvfnisewih2EVPm+E25a8XjPAmrfDbXBU1ivMUYY\\\\nIC+TslLVAgMBAAECggEACZYEnDXX/GqpCwDejcoy1wlWtp4MmQFmAi0O6JWcxHcr\\\\nD3nDmMXMjOwJxQSdKuKWW1pebZPA1CvHzHZi6bxF9QLzqQWe3AFTtii+H6wV5hVS\\\\nj/GpBZw4JwlsEWtMxHDpXcwCYG9w0xbF56WiC7eh37khLr/H8768LEcwa5WZoqhc\\\\ngjYwcBk4Z8UQvBJPiSbngin0I4Fo44m//VGOg7nlHQAIfDnfOWdzXBFMPYhoUDPu\\\\nujOtButAZ/5VC7cOd3EH/3wyY/zbRTrmZxikZc2kDgePgERiRtYw8FtNQvjN9gcU\\\\niuajcU47B2nBXxlvw/DCPi0yxSiTUBhrtKxSrjrxgQKBgQD4g4ixHKq08DWAc4xz\\\\nTAkNOlKF6gB8daxg3yZDIr7WvRHsR19e54du3Q/EvPqMVyT1mqhtGz9MzgyUz2qq\\\\nJQy5xMHJp2X4PxEsm5n6cm3tpxySMeHzLQHaWjdKAwR4zzlLKMWXF48KN1HuHt79\\\\nJvOWn6sbtaFXvf0ze/JrNCFHNQKBgQDuJ8BncXESS9RLi+1I7EhaDGsKPIDVwFtC\\\\nC4gUV5hP5whO6jt4ATUy92pPQZfzEiQ2Erc01Pf4EAYNiErPtB8Rron3VV2Dz1md\\\\n0bQt88lhDM22EESKfTQfmc5ctUuQoii8KPV2Psr9yQq4eLQZg1fI/IgQUW7YgGfG\\\\nFfLt54sxIQKBgDzQw5TENSpOVml23Xohs11fVm6bEz9h9KtIMK7hQ959KnOuC7LH\\\\n6ibBRmiY7p+Fe+/2xxzcPCNpkT6he7Ljmjej5OCabKPRmzxVX9sgQbKU4LMOLgM6\\\\nkmeDCGC+WEvQOm8gLSqKg2C2pQAm4d8Ftzq3HEKNskwsnFgLDwoZGcO5AoGBAJ06\\\\na0Ef2NmObHrvx1kkfWPN3QEmDpyP4O/Kcy2S4wClc4u+AkLo8TlTtMDcejfEm1mD\\\\no6Zij88arRRUDafwr65Zv8Ylepah1vVlVAIed6316P2w4b9Yh4fxYBc+rcOv+xq2\\\\nI8/MBvHjv4soTSam2tbbOe0kBf0zUM+q//XmrrNhAoGBAPUHOWG74oZcmF3AcyOG\\\\n31G7X7gPY7Q4LecIY8czDWcVoK9CHUa/C9dBi2izC9IyTNEV+ETVdplFrANSwj1w\\\\nsnmF7ayj4nEW7ZsNPvizUr1DB1qkzPn8LwMJKIpkXW3nR41nhPMLUvwdeAP3nWJP\\\\n7YydmTUbHLNjSmiNQ6jOutOV\\\\n-----END PRIVATE KEY-----\\\\n","client_email":"1067453211142-compute@developer.gserviceaccount.com","client_id":"113525226759410066844","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/1067453211142-compute%40developer.gserviceaccount.com"}' > keyfile.json
./cloud_sql_proxy -instances=spiral-app:us-central1:spiral-db=tcp:5432 -credential_file=./keyfile.json &
mkdir ./.uploads
GOOGLE_APPLICATION_CREDENTIALS=~/keyfile.json gcsfuse ${gcBucketName} ./.uploads
curl -L -u '${userName}:${personalAccessToken}' '${tarball_url}' | tar xzf - --one-top-level="${projectName}" --strip-components 1
cd ${projectName}
npm install --only=production
export DB_HOST="127.0.0.1"
export DB_PORT="5432"
export DB_NAME="postgres"
export DB_USER="postgres"
export DB_PASSWORD="myNaAdJkJ1eF44Fz"
export BACKEND_PORT=80
npm run production
`

const createToken = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
