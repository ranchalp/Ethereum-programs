// Contract for Company with charging stations
// such as electric cars
pragma solidity ^0.4.17;

// we use a token-based system
// each toke_unit can be equivalent for an amount of charging units
// this can be decided outside of the blockchain (in the charging poll itself)
// or instead one can have it integrated in the blockchain
// token price must be defined within the contract
// this enables abstraction and usage of contract from outside blockchain program
// (currently solidity does not allow I/O)

contract Mortal {
  /* Define variable owner of the type address */
  address owner;

  /* This function is executed at initialization and sets the owner of the contract */
  function Mortal() public { owner = msg.sender; }

  /* Function to recover the funds on the contract */
  function kill() public { if (msg.sender == owner) selfdestruct(owner); }
}

contract ChargingCompany is Mortal {

  uint private token_price = 1 wei;
  uint public testing_public = 1 wei;
  uint private chargeTimeout = 86400*15;//15 days
  address owner;
  mapping (address => bool) stations;

  struct Charge{
    address station;
    uint tokens;//maximum amount to spend
    bool committed;
    uint chargingTimeout;
    bytes32 hash;
    uint tokenAmount;
  }
  
  struct User{
    uint own_tokens;
    uint spent_tokens;
    Charge charge; //maybe mapping in following version...
  }

  mapping(address => User) users;


  function ChargingCompany () public Mortal() { //constructor
    //initialise stations once dynamic
    //maybe change token price
    owner = msg.sender;
    
  }

  function purchaseTokens (uint token_amount) public payable{ // purchase tokens
    require ((token_amount * token_price) == msg.value);
    
    users[msg.sender].own_tokens += token_amount;
  }

  function getTokenPrice() view public returns (uint){ 
    return token_price;
  }

  function getMyTokens() view public returns (uint){
    return users[msg.sender].own_tokens;
  }

  function isAddressStation(address addr)
    view public returns (bool){
    return stations[addr];
  }
  
  function getSpentTokens() view public returns (uint){ 
    return users[msg.sender].spent_tokens;
  }
  
  modifier isStation(address addr){
    require(stations[addr]);
    _;
  } 


  modifier verify_address(bytes32 hash,address p, uint8 v, bytes32 r, bytes32 s) {
    require(verify_addressF(hash,p,v,r,s));
    _;
  }

  function verify_addressF(bytes32 hash,address p, uint8 v, bytes32 r, bytes32 s) pure returns(bool) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(prefix, hash);
    return (ecrecover(prefixedHash, v, r, s) == p);
  }
   
  function checktimestampF(uint timestamp) public view returns(bool){
    return block.timestamp<=timestamp;
  }
 
  modifier checkTimestamp(uint timestamp){
    require(checktimestampF(timestamp));
    _;
  }
   
  function hasEnoughTokens(uint tokens, uint requiredTokens) public pure returns(bool){
    return tokens>=requiredTokens;
  }
  modifier enoughTokens(uint tokens, uint requiredTokens){
    require (hasEnoughTokens(tokens,requiredTokens));
    _;
  }
   
  event channelOpened(address indexed user,address indexed station, uint _value);
   
  modifier checkTimestampEmpty(address user){
    require(users[user].charge.chargingTimeout==0);
    _;
  }  

  function openChannel (uint tokenAmount,address station) public
    checkTimestampEmpty(msg.sender)
    enoughTokens(users[msg.sender].own_tokens,tokenAmount){ //way of locking account while charging
    // called just before starting charging, only if success

    users[msg.sender].own_tokens-= tokenAmount;
    users[msg.sender].charge.tokens= tokenAmount;//restore state properly
    users[msg.sender].charge.station = station;
    timestampCharge(msg.sender);
    channelOpened(msg.sender, station, tokenAmount);

  }
   
  //necessary as events not supported by web3.js yet
  function getChannelTimeout(address user, address station, uint tokenAmount) view public returns (uint){ 
    if(users[user].charge.station==station && users[user].charge.tokens==tokenAmount)
      return users[user].charge.chargingTimeout;
    else
      return 0;
  }
  
  function timestampCharge(address user)
    private
  {
    users[user].charge.chargingTimeout=block.timestamp+chargeTimeout;
      
  }
  
  modifier verify(uint tokenAmount, uint timestamp, address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) {
     
    //bytes32 prefixedHash = keccak256(prefix, hash);
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 hashedMessage = sha3(prefix,tokenAmount,timestamp);
    require(ecrecover(hash, v, r, s) == p && hashedMessage == hash);
    _;
  }

  function verify_hashF(uint tokenAmount, uint timestamp, bytes32 hash) public pure returns(bool) {
    bytes32 hashedMessage = sha3(tokenAmount,timestamp);//prefix not needed anymore
    return (hashedMessage == hash);
  }
  
  modifier verify_hash(uint tokenAmount, uint timestamp, bytes32 hash) {
     
    //bytes32 prefixedHash = keccak256(prefix, hash);
    /* bytes32 hashedMessage = sha3(tokenAmount,timestamp);//prefix not needed anymore */
    require (verify_hashF(tokenAmount,timestamp,hash));
    _;
  }


  function isNotCommitted(address user) public view returns(bool) {
    bytes32 zero;
    return(users[user].charge.hash==zero);
  }
  
  modifier notCommitted(address user){
    require(isNotCommitted(user));
    _;
  }

  function commitToClose(address user,uint tokenAmount, uint timestamp,bytes32 hash)
    notCommitted(user)
    enoughTokens(users[user].charge.tokens,tokenAmount)
    checkTimestamp(timestamp)
    verify_hash(tokenAmount,timestamp,hash)
  {
    users[user].charge.hash = hash;
    users[user].charge.tokenAmount = tokenAmount;
  }

  modifier isCommitted(address user){
    require(users[user].charge.hash!=0);
    _;
  }
    
  function getHash(address user) view public returns (bytes32){ 
    return users[user].charge.hash;
  }
    

  modifier timestampLate(address user){
    require(block.timestamp>users[user].charge.chargingTimeout);
    _;
  }
    
  function closeChannelLate (address user) public
    timestampLate(user){//only when runout of time
    users[user].own_tokens+=users[user].charge.tokens;//give evth back to user
    
    //Restore charge state for next one
    users[user].charge.tokens=0;
    users[user].charge.chargingTimeout=0;
    users[user].charge.station=0;
    users[user].charge.committed=false;
  }
  
  function closeChannel (address user,uint8 v, bytes32 r, bytes32 s) //after calling commitToClose
    public
    checkTimestamp(users[user].charge.chargingTimeout)
    isCommitted(user)
    verify_address(users[user].charge.hash,user,v,r,s)
    isStation(msg.sender)//must be station // adding penalties and another timeout not really necessary, could also be user
  {
    users[user].own_tokens+=users[user].charge.tokens-users[user].charge.tokenAmount;
    users[user].spent_tokens+=users[user].charge.tokenAmount;// just to keep track, for testing

    //Restore charge state for next charge
    users[user].charge.tokens=0;
    users[user].charge.chargingTimeout=0;
    users[user].charge.station=0;
    users[user].charge.committed=false;
  }

  modifier senderInvolved( address user, address station){
    require(msg.sender==user || msg.sender == station);
    _;
  }

  /* modifier chargeExists(address user, address station){ */
  /*   require(users[user].charge.station == station); */
  /*   _; */
  /* } */
  
  modifier isOwner(address addr){
    require(owner == addr);
    _;
  }

  modifier isNotStation(address addr){
    require(!stations[addr]);
    _;
  }
  
  function addStation (address newStation) public
    isNotStation(newStation)
    isOwner(msg.sender)
  {
    stations[newStation]=true;
  }

  function removeStation (address newStation) public
    isStation(newStation)
    isOwner(msg.sender)
  {
    stations[newStation]=false;
  }
  
}

  // The function commitToClose and closeChannel must be decoupled because of the following error: 
  //chargingCompanyStateChannel.sol:238:54: Compiler error: Stack too deep, try removing local variables.
  /*   function closeChannel (address user,uint tokenAmount, uint timestamp,bytes32 hash,uint8 v, bytes32 r, bytes32 s)  */
  /*   //address user and station to be removed if msg.sender and tx.origin as thought */
  /*   public */
  /*  enoughTokens(users[msg.sender].charge.tokens,tokenAmount) */
  /*   checkTimestamp(users[msg.sender].charge.chargingTimeout) */
  /*   checkTimestamp(timestamp) */
  /*   verify(tokenAmount,timestamp,msg.sender,user,hash,v,r,s) */
  /*   isStation(msg.sender)//must be station */
  /* //checkTimestamp... --> not really necessary, maybe better other system to include timestamp with address to include penalisation */
  /* { */
  /*   users[user].own_tokens=users[user].charge.tokens-tokenAmount; */
  /*   users[user].spent_tokens+=tokenAmount;// just to keep track, for testing */

  /*   //Restore charge state for next one */
  /*   users[user].charge.tokens=0; */
  /*   /\* users[user].charge.price=0; *\/ */
  /*   /\* users[user].charge.verifiedAmount=0; *\/ */
  /*   users[user].charge.chargingTimeout=0; */
  /*   /\* users[user].charge.started=false; *\/ */
  /*   users[user].charge.station=0; */
  /* } */
