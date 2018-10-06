if (process.env.npm_execpath.indexOf('yarn') === -1) { 
  console.log('\u001b[31mPlease use yarn for installing dependencies\u001b[0m'); 
  process.exit(1); 
}