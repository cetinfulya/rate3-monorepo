const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const path = require('path');



const ipfs = ipfsAPI('/ip4/192.168.0.204/tcp/5001');
// const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');

// Reading file from folder
const dir = 'build';

const getFiles = dir => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, items) => {
    const res = [];
    const dirPromises = [];
    for (const itemName of items) {
      const itemPath = path.join(dir, itemName);
      if (fs.lstatSync(itemPath).isDirectory()) {
        dirPromises.push(getFiles(itemPath));
      } else {
        res.push({
          content: fs.readFileSync(itemPath),
          path: `/${itemPath}`,
        });
      }
    }
    if (dirPromises.length) {
      Promise.all(dirPromises).then((dirRes) => {
        const all = res.concat(...dirRes);
        resolve(all);
      });
    } else {
      resolve(res);
    }
  });
});

getFiles(dir).then((files) => {
  ipfs.files.add(files, { pin: true }, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    const { hash } = res[res.length - 1];
    console.log(hash);
  });
});
