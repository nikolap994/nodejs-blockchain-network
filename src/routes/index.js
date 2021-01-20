const uuid = require('uuid/v1');
const nodeAddr = uuid();

const reqPromise = require('request-promise');

const Blockchain = require('../blockchain');
const bitcoin = new Blockchain();

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('pages/setup.ejs');
    });

    app.get('/wallet', function (req, res) {
        res.render('pages/wallet.ejs');
    });

    app.post("/broadcast-and-join", function(req, res) {
        const nodeUrl = req.body.nodeURI;

        if (bitcoin.networkNodes.indexOf(nodeUrl) == -1) {
            bitcoin.networkNodes.push(nodeUrl);
        }

        const registerNodes = [];
        bitcoin.networkNodes.forEach(networkNode => {
            const requestOptions = {
                uri: networkNode + '/register-node',
                method: 'POST',
                body: { nodeUrl: nodeUrl },
                json: true
            }

            registerNodes.push(reqPromise(requestOptions));
        });

        Promise.all(registerNodes)
            .then(data => {
                const bulkRegisterOptions = {
                    uri: nodeUrl + '/register-bulk-nodes',
                    method: 'POST',
                    body: { networkNodes: [...bitcoin.networkNodes, bitcoin.nodeUrl] },
                    json: true
                }

                return reqPromise(bulkRegisterOptions);
            }).then( data => {
                res.redirect('wallet');
            });
    });

    app.get('/blockchain', function (req, res) {
        res.send(bitcoin);
    });

    app.post('/transaction', function (req, res) {
        const blockIndex = bitcoin.makeNewTransaction(
            req.body.amount,
            req.body.sender,
            req.body.recipient
        );

        res.json(
            {
                message: `Transaction is added to block with index: ${blockIndex}`
            }
        );
    });

    app.get('/mine', function (req, res) {
        const latestBlock = bitcoin.getLatestBlock();
        const prevBlockHash = latestBlock.hash;
        const currentBlockData = {
            transactions: bitcoin.pendingTransactions,
            index: latestBlock.index + 1
        }
        const nonce = bitcoin.proofOfWork(prevBlockHash, currentBlockData);
        const blockHash = bitcoin.hashBlock(prevBlockHash, currentBlockData, nonce);

        // reward for mining
        bitcoin.makeNewTransaction(1, '00000', nodeAddr);

        const newBlock = bitcoin.creatNewBlock(nonce, prevBlockHash, blockHash)
        res.json(
            {
                message: 'Mining new Block successfully!',
                newBlock
            }
        );
    });


    app.post('/register-and-broadcast-node', function (req, res) {
        const nodeUrl = req.body.nodeUrl;

        if (bitcoin.networkNodes.indexOf(nodeUrl) == -1) {
            bitcoin.networkNodes.push(nodeUrl);
        }

        const registerNodes = [];
        bitcoin.networkNodes.forEach(networkNode => {
            const requestOptions = {
                uri: networkNode + '/register-node',
                method: 'POST',
                body: { nodeUrl: nodeUrl },
                json: true
            }

            registerNodes.push(reqPromise(requestOptions));
        });

        Promise.all(registerNodes)
            .then(data => {
                const bulkRegisterOptions = {
                    uri: nodeUrl + '/register-bulk-nodes',
                    method: 'POST',
                    body: { networkNodes: [...bitcoin.networkNodes, bitcoin.nodeUrl] },
                    json: true
                }

                return reqPromise(bulkRegisterOptions);
            }).then(data => {
                res.json(
                    {
                        message: 'A node registers with network successfully!'
                    }
                );
            });
    });

    app.post('/register-node', function (req, res) {
        const nodeUrl = req.body.nodeUrl;

        if ((bitcoin.networkNodes.indexOf(nodeUrl) == -1)
            && (bitcoin.nodeUrl !== nodeUrl)) {
            bitcoin.networkNodes.push(nodeUrl);

            res.json(
                {
                    message: 'A node registers successfully!'
                }
            );
        }
        else {
            res.json(
                {
                    message: 'This node cannot register!'
                }
            );
        }
    });

    app.post('/register-bulk-nodes', function (req, res) {
        const networkNodes = req.body.networkNodes;

        networkNodes.forEach(nodeUrl => {
            if ((bitcoin.networkNodes.indexOf(nodeUrl) == -1)
                && (bitcoin.nodeUrl !== nodeUrl)) {
                bitcoin.networkNodes.push(nodeUrl);
            }
        });

        res.json(
            {
                message: 'Registering bulk successfully!'
            }
        );
    });

}