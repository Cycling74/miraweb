# Generate Object List Tutorial
echo "Generating Object List tutorial"
node ./scripts/gen_objList.js;

# Generate JSDoc
echo "Generating JSDoc output"
jsdoc -c ./docsConf.js
