const bananojs = require('@bananocoin/bananojs');
bananojs.setBananodeApiUrl('https://kaliumapi.appditto.com/api');

const mongo = require("./database.js");

let db = mongo.getDb();
let collection;

db.then((db) => {collection = db.collection("banano"); 
});

async function send_banano(addr, id, amount) {
  let user_addr = await collection.findOne({"addr":addr});
  console.log(user_addr)
  if (user_addr) {
    if (user_addr.last_claim+80000000 > Date.now()) {
      return false;
    }
  }
  let user = await collection.findOne({"id":id});
  if (user) {
    if (user.last_claim+80000000 > Date.now()) {
      return false;
    }
  }
  let hash = await bananojs.sendBananoWithdrawalFromSeed(process.env.seed, 0, addr, amount);
  if (!user) {
    await collection.insertOne({"id":id,"last_claim":Date.now()});
    await collection.insertOne({"addr":addr,"last_claim":Date.now()});
  } else {
    await collection.replaceOne({"id":id}, {"id":id,"last_claim":Date.now()});
    await collection.replaceOne({"addr":addr}, {"addr":addr,"last_claim":Date.now()});
  }
  return hash;
}

async function check_bal(addr) {
  let raw_bal = await bananojs.getAccountBalanceRaw(addr);
  let bal_parts = await bananojs.getBananoPartsFromRaw(raw_bal);
  return bal_parts.banano
}

async function faucet_dry() {
  let bal = await check_bal("ban_3346kkobb11qqpo17imgiybmwrgibr7yi34mwn5j6uywyke8f7fnfp94uyps");
  if (Number(bal) < 1) {
    return true;
  }
  return false;
}
 
async function receive_deposits() {
  let rep = await bananojs.getAccountInfo(await bananojs.getBananoAccountFromSeed(process.env.seed, 0), true);
  rep = rep.representative;
  await bananojs.receiveBananoDepositsForSeed(process.env.seed, 0, rep);
}

async function is_valid(address) {
  return await bananojs.getBananoAccountValidationInfo(address).valid
}

module.exports = {
  send_banano: send_banano,
  faucet_dry: faucet_dry,
  check_bal: check_bal,
  receive_deposits: receive_deposits,
  is_valid: is_valid
}