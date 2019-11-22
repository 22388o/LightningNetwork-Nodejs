require('dotenv').config();
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./rpc.proto', {
  keepCase: true
});
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
var lndCert = Buffer.from(process.env.LND_CERT, 'utf8');
var sslCreds = grpc.credentials.createSsl(lndCert);

var macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  var macaroon = process.env.LND_MACAROON;
  var metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});

var creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
var lightning = new lnrpc.Lightning('localhost:10009', creds);

var getInfo = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.getInfo(request, (err, response) => {
      resolve(response);
    });
  });
};

var newAddress = () => {
  return new Promise((resolve, reject) => {
    var request = {
      type: ''
    };
    lightning.newAddress(request, function(err, response) {
      resolve(response);
    });
  });
};

var walletBalance = () => {
  return new Promise((resolve, reject) => {
    request = {};
    lightning.walletBalance(request, function(err, response) {
      resolve(response);
    });
  });
};

var connectPeer = pub_key => {
  addr = pub_key.split('@');
  return new Promise((resolve, reject) => {
    var request = {
      addr: {
        pubkey: addr[0],
        host: addr[1]
      },
      perm: true
    };
    lightning.connectPeer(request, function(err, response) {
      resolve(response);
    });
  });
};

var listPeers = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.listPeers(request, function(err, response) {
      resolve(response);
    });
  });
};

var disconnectPeer = pub_key => {
  return new Promise((resolve, reject) => {
    var request = {
      pub_key
    };
    lightning.disconnectPeer(request, function(err, response) {
      resolve(response);
    });
  });
};

var openChannel = () => {
  return new Promise((resolve, reject) => {
    // this is pubkey test
    var pubkey = '02d61e6b1e69f56e1be75fc270abdb9daade494df32ce4b7bb008a0caed5e4bb3c';
    var request = {
      node_pubkey_string: pubkey,
      local_funding_amount: 1000000,
      push_sat: 0,
      target_conf: 1,
      private: false,
      min_confs: 3,
      spend_unconfirmed: false
    };
    lightning.openChannelSync(request, function(err, response) {
      resolve(response);
    });
  });
};

var channelBalance = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.channelBalance(request, function(err, response) {
      resolve(response);
    });
  });
};

var listChannel = () => {
  return new Promise((resolve, reject) => {
    var request = {
      active_only: true
    };
    lightning.listChannels(request, function(err, response) {
      resolve(response);
    });
  });
};

var addInvoice = () => {
  return new Promise((resolve, reject) => {
    var request = {
      amt_paid: 50000
    };
    lightning.addInvoice(request, function(err, response) {
      resolve(response);
    });
  });
};

var sendPayment = () => {
  return new Promise((resolve, reject) => {
    var request = {
      // dest: <bytes>,
      // dest_string: <string>,
      // amt: <int64>,
      // payment_hash: <bytes>,
      // payment_hash_string: <string>,
      payment_request:
        'lnsb10u1pwuukn8pp54v3xgpv84k8du9l00j8dc0lj7rg5qqc2vpk7496tlm8zv2uyxausdqqcqzpg8tx8z98t8vlvgv5cx9wdc7ch65puxf7e43zgaj3gyu2whvr9rwexe9nns82rpruawr79nraztg0chcg9y5zu8zyagysuvp77k2tjzngq9sezqz'
      // final_cltv_delta: <int32>,
      // fee_limit: <FeeLimit>,
      // outgoing_chan_id: <uint64>,
      // cltv_limit: <uint32>,
      // dest_tlv: <array DestTlvEntry>,
    };
    lightning.sendPaymentSync(request, function(err, response) {
      resolve(response);
    });
  });
};

var closeChannel = () => {
  return new Promise((resolve, reject) => {
    var request = {
      channel_point: {
        funding_txid_str: 'f7b8c3536f38a6e7b9429a0be075e3b4f656dc7c4972af63c057a4e361e6f87b',
        output_index: 0
      }
    };
    var call = lightning.closeChannel(request);
    call.on('data', function(response) {
      resolve(response);
    });
  });
};

var channalBalance = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.channelBalance(request, function(err, response) {
      resolve(response);
    });
  });
};

//02b91a3e09cc9e207aea58a6a172b94fd6946cc7f364b13b9419c17fee56b6dca1 alice
//02d61e6b1e69f56e1be75fc270abdb9daade494df32ce4b7bb008a0caed5e4bb3c bob
module.exports = {
  getInfo,
  walletBalance,
  newAddress,
  listPeers,
  connectPeer,
  disconnectPeer,
  listChannel,
  openChannel,
  addInvoice,
  sendPayment,
  channelBalance,
  closeChannel,
  channalBalance
};
