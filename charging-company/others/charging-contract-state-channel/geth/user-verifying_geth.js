// var value_station=100; //100kwatts
// var h_station
// var station= "0x43d5aa87d3da82308ee7962897ce6b8db56273c8"
// to recover:
var message_station = value_station;
var result_user_addr = personal.ecRecover(h_station, "0x"+sig_station);
var hash_message_station = web3.sha3(message_station);
if (hash_message_station == h_station && result_user_addr == station){
    console.log("all good");
}

// send to station => value, user, result 
