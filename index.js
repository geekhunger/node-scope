// This module merges information from PM2 and core modules of NodeJS and provides insights about environments, application process ID's, along other useful things.

import {cpus, hostname} from "os"
import process from "process"
import Type from "type-approve"
const {assert, type} = Type

const CMD_ARGS = process.argv.slice(2)
const ENV_RAW = CMD_ARGS[0] || process.env.NODE_ENV || ""
const ENV_PARSED = /^(\-{2,2})?(prd|prod|production|live|public)$/i.test(ENV_RAW.trim()) ? "production" : "development"

let scope = {
    get pid()       {return process.pid},
    get apn()       {return this.app_name},
    get cpu()       {return cpus()},
    get core()      {return this.cpu.length},

    get namespace() {return this.app_group},
    get env()       {return this.node_env},
    get env_short() {return this.env === "production" ? "prod" : "dev"},
    get prod()      {return this.env === "production"},
    get dev()       {return this.env !== "production"}, // any other environment like "development" or "staging"

    get localhost() {return hostname().indexOf("local") > -1},
    get manager()   {return new RegExp("(master|primary|manager|lead|main)", "i").test(this.apn)},
    get worker()    {return new RegExp("(slave|secondary|worker|replica|swarm)", "i").test(this.apn)},
    get tester()    {return new RegExp("(local|localhost|test|demo|debug)", "i").test(this.apn)},
    get any()       {return true},
}

const hidden = {writable: true, enumerable: false}
Object.defineProperty(scope, "node_env", {...hidden, value: ENV_PARSED})
Object.defineProperty(scope, "app_name", {...hidden, value: process.env.name}) // PM2 variable
Object.defineProperty(scope, "app_group", {...hidden, value: process.env.namespace}) // PM2 variable, normally equals to scope.env()

const subtract = (inA, fromB) => inA.filter(value => !fromB.includes(value))

/*
    Publicly accessible namespace with constants (only getter functions) that can be used to fetch information about current process, application and environment and classify its type.
    This is especially useful when trying to run code only for certain conditions, for example, run a cronjob when the app instance is running in production mode and only if the current application process contains the "master" substring in it's name.
    This proxy is also useful for development purposes, but not exclusevly.
    We can make pre-validation checks before a property is defined of retrieved, for example, checking if key is defined before retrieving it. This way we can never run into problems with typos that produce undefined values.
*/
export default new Proxy(scope, {
    get: (origin, property, self) => {
        const visible_keys = Object.keys(origin)
        const hidden_keys = subtract(Object.getOwnPropertyNames(origin), visible_keys)
        if(hidden_keys.includes(property) || (visible_keys.includes(property) && type({nil: origin[property]}))) return origin[property]
        assert(!type({nil: origin[property]}), `Scope namespace for '${property}' is not defined! ${ENV_PARSED, process.env.name}`)
        return origin[property]
    }
})
