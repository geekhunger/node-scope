// NODE_ENV=staging name=MyServer namespace=test-group node ./test.js

import scope from "./index.js"

const {pid, apn, realm, env} = scope

console.log(pid, apn, realm, env)
console.log(scope)
