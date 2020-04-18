const fs = require('fs').promises
const exec = require('util').promisify(require('child_process').exec)
const ncp = require('ncp').ncp;
const Path = require('path')
const { Repository } = require("nodegit")

export default async (name) => {

    const repository = await Repository.open(Path.resolve(__dirname, "../.git"))
    const statuses = await repository.getStatus()
    const everythingIsCommited = statuses.length === 0

    if(!everythingIsCommited) throw Error('You have uncommitted changes. Please commit or revert, then try again.')

    console.log('Building Frontend')
    
    await exec('expo build:web')

    console.log('Building Backend')

    await exec('npx webpack --config api.config.js')

    await repository.checkoutBranch('production')
    
    await ncp('./web-build', './public')
    await ncp('./dist/index.js', './index.js')

    await deleteFolderRecursive('./web-build')

    // await repository.checkoutBranch('master')
   
    console.log('DEPLOYING', name)
}

// Steps:
//  1. Make sure everything is commited
//  2. Create a production build of the frontend named "public"
//  3. Create a production build of the backend
//  4. Checkout the dist branch
//  5. Add and commit the production builds, package, and package lock
//  6. Push
//  7. Create a release from the dist branch
//  8. Update an instance template on gcloud, using the release url in the startup script
//  9. Create a rolling update to the new instance template
//  10. Switch back to the master branch


const deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };