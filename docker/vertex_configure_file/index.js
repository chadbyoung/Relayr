#!/usr/bin/env node
'use strict'
const VertexClient = require('./src/Vertices');
const UserClient = require('./src/Users');
const DeviceClient = require('./src/Devices');
const fs = require('fs.promised')
const path = require('path');
const exec = require( "child_process" ).exec;

if (process.argv.length !== 5) {
  console.log(`Usage : ${process.argv[1]} <vertex name> <vertex location> <relayr api token>`)
  process.exit(1)
}

const authorizationToken = process.argv[4] // '9azAB4CHO7N5JQBKNs51HlN558mDQ8eUwx2rIbqdq0pvTlqajnwtIZxW5V5YHCiq'
const vertexName = process.argv[2] // 'Vertex Name'
const vertexLocation = process.argv[3] // 'Vertex Location'
const configRoot = process.env['CONFIG_ROOT'] || '/etc' // './etc'
const configOwner = process.env['CONFIG_OWNER'] || 'relayr'

const vertexClient = new VertexClient({
  authorization: 'Bearer ' + authorizationToken,
  swaggerUrl: 'http://services-docs.relayr.io/swaggers/vertex-backend_prod.yaml'
})

const userClient = new UserClient({
  authorization: 'Bearer ' + authorizationToken
})

const deviceClient = new DeviceClient({
  authorization: 'Bearer ' + authorizationToken
})

const vertexConfig = {
  "logger": {
    "level": "info",
  },
  "port": 1883,
  "uplink": {
    "uri": "https://prod-vertex.relayr.io/",
    "publish": "#/data",
    "subscribe": "#/cmd"
  },
  "redisPersistence": {
    "enabled": true,
    "redisPort": 6379
  },
  "staticAcl": {}
}

const sysHealthConfig = {
  "servers": [{ "host": "localhost" }],
  "protocol": "mqtt",
  "devices": {
    "gateway": {}
  },
  "interval": 5000
}

var userId
var vertexId
var vertexToken
var sysHealthDeviceId
var sysHealthUser
var sysHealthPassword

function registerVertex() {
  console.log('Querying user details')
  return userClient.getUserInfo().then(userInfo => {
    userId = userInfo.id
    console.log(`User is : ${userId}`)
    console.log(`Creating a Vertex named '${vertexName}'`)
    return vertexClient.addVertex({
      name: vertexName,
      location: vertexLocation
    })
  }).then(vertex => {
    vertexId = vertex.id
    vertexToken = vertex.token
    console.log(`Vertex created with id ${vertexId}`)
    console.log('Creating Vertex device')
    return deviceClient.addDevice({
      name: vertexName,
      owner: userId,
      model: 'd02bae2d-aa25-46a2-82de-02fcce1f315e',
      firmwareVersion: '1.0.0'
    })
  }).then(healthDevice => {
    sysHealthDeviceId = healthDevice.id
    console.log(`Device created with id ${sysHealthDeviceId}`)
    return vertexClient.addVertexDevice(vertexId, {
      "deviceId": sysHealthDeviceId,
      "transport": "mqtt",
      "configuration": {}
    })
  }).then(healthDeviceCreds => {
    console.log('Obtained vertex credentials for device')
    sysHealthUser = healthDeviceCreds.credentials.user
    sysHealthPassword = healthDeviceCreds.credentials.password
  })
}

function writeConfigs () {
  console.log(`Writing configs under ${configRoot}`)
  vertexConfig.uplink.username = vertexId
  vertexConfig.uplink.password = vertexToken
  sysHealthConfig.devices.gateway = {
    user: sysHealthUser,
    password: sysHealthPassword,
    clientId: vertexId
  }

  return fs.mkdir(configRoot).catch(() => {})
    .then(fs.mkdir(path.resolve(configRoot, 'vertex')).catch(() => {}))
    .then(fs.mkdir(path.resolve(configRoot, 'relayr-system-health-adapter')).catch(() => {}))
    .then(fs.writeFile(path.resolve(configRoot, 'vertex', 'config'), JSON.stringify(vertexConfig, null, 2)))
    .then(fs.writeFile(path.resolve(configRoot, 'relayr-system-health-adapter', 'config'), JSON.stringify(sysHealthConfig, null, 2)))
    .then(() => {
        exec(`chown -R ${configOwner}:${configOwner} ${path.resolve(configRoot, "vertex")}`)
        exec(`chown -R ${configOwner}:${configOwner} ${path.resolve(configRoot, "relayr-system-health-adaptor")}`)
    })
}


registerVertex().then(writeConfigs).catch(err => {
  console.log('reason', err)
  console.log('status', err.statusCode)
})
