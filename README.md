# Readme

Very simple proxy object that holds information about the current NodeJS process. It's useful for working with environments on NodeJS, especially in combination with [PM2](https://www.npmjs.com/package/pm2).

This is for everyone who likes to do things like this:

```js
import scope from "nodejs-scope"

if(scope.dev) {
    //foo
} elseif (scope.env === "my-custom-environment") {
    //baz
}
```

`scope` is a proxy object containing fallowing getters:

- **pid:** ID of the process
- **apn:** Name of the process ([PM2] environment variable `name`)
- **cpu:** List auf CPUs available
- **core:** Number of CPU cores. Could be used for PM2 to set `exec_mode` and `instances` dynamically based on cores count.
- **realm:** Group name that the process belongs to ([PM2] environment variable `namespace`)
- **env:** Environment name of the process (refers to `NOVE_ENV`)
- **prod:** Returns `true` if **env** contains one of ["prd", "prod", "production"]
- **stg:** Returns `true` if **env** contains one of ["stg", "stage", "staging"]
- **dev:** Return `true` if **env** contains one of ["dev", "development"]
- **localhost:** Returns `true` if hostname contains "local"
- **manager:** Returns `true` if **apn** contains one of ["master", "primary", "manager", "lead", "main"]. If PM2 runs in 'cluster' mode then could be used to detect if the process is a master or a slave.
- **worker:** Returns `true` if **apn** contains one of ["slave", "secondary", "worker", "replica"]
- **any:** Returns always `true`

## Example

```js
import scope from "nodejs-scope"

const {pid, apn, env} = scope // unpack selected

console.log(scope)
console.log(pid, apn, env)

switch(env) {
    case "production: {
        // production environment
        break
    }
    case "development":
    default: {
        // environmant is "development" or something other
    }
}

if(scope.prod && scope.manager) {
    // production environment on leading application instance
}
```

## NodeJS

Most of the properties mentioned above aren't very useful when working with NodeJS exclusevly, except for pid, cpu, core, env, prod, stg, dev. The other properties come in handy when working with [PM2](https://www.npmjs.com/package/pm2) or [Doncron](https://www.npmjs.com/package/doncron).

For example, if you'd run `NODE_ENV=staging node ./server.js` then your process would have an environmental variable 'NODE_ENV' which maps through the proxy object `scope` to the property `scope.env`.

If you'd run your server through PM2 you'd certainly have more environmental variables like apn, realm. Or, if you plan to generate your PM2 config dynamically then you'll appreciate getters like cpu, core.

Implimentation details can be found [here](https://github.com/geekhunger/node-scope/blob/master/index.js).

## PM2

When working with 'ecosystem.config.js' in PM2, I tend to fallow simple naming conventions.

The `name` property of every application contains the evironment and the type of the instance. For example, I name my app `prod_master`.

If I have many `instances` of the same application (as a fallback or for load ballancing) then I name instances like `dev_master`, `dev_worker`.

By having the `name` property contain the environment, I can call `pm2 list` and immediately tell the difference of application environments.

By having the `name` contain a type identifier like 'manager' I can immediately tell if the application is master or an instance of a bigger swarm of workers - which becomes handy for cronjobs (since a cronjob only needs to run once - on the master instance of the application - not its slaves). Later, I can use `scope.manager` and `scope.worker` to separate the applications apart.
