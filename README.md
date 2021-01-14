# Readme

- Clone repo
- ```npm install```
- ```node npm run node1```
- ```node npm run node2```
- ```node npm run node3```
- ```node npm run node4```
- ```node npm run node5```

Here we start 5 nodes in network

```json
"node1": "http://localhost:3001"
"node2": "http://localhost:3002"
"node3": "http://localhost:3003"
"node4": "http://localhost:3004"
"node5": "http://localhost:3005"
```

To make sure this nodes can talk to each other we have to register them in network:

- Run post request like this:
```
POST http://localhost:3001/register-and-broadcast-node
BODY { "nodeUrl": "http://localhost:3001" }
```

```
POST http://localhost:3001/register-and-broadcast-node
BODY { "nodeUrl": "http://localhost:3002" }
```

```
POST http://localhost:3001/register-and-broadcast-node
BODY { "nodeUrl": "http://localhost:3003" }
```

```
POST http://localhost:3001/register-and-broadcast-node
BODY { "nodeUrl": "http://localhost:3004" }
```

```
POST http://localhost:3001/register-and-broadcast-node
BODY { "nodeUrl": "http://localhost:3005" }
```

And then transactions can be done:
```
POST http://localhost:3001/transaction
BODY {
    "nodeUrl": "http://localhost:3005",
    "amount": 10,
    "sender": "http://localhost:3001",
    "recipient": "http://localhost:3005"
}
```
