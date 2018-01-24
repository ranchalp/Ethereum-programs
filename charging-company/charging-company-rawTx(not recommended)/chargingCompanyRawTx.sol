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
  bytes prefix = "\x19Ethereum Signed Message:\n32"; //necessary in Solidity as of 0.4.19

struct Charge{
    address station;
    uint tokens;//maximum amount to spend
  //uint price;//cause price might change from negotiation to actual payment
    uint chargingTimeout;
  // bool started; //prevents override while unfinished, due to user's error
  // uint verifiedAmount;
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
   
 function getSpentTokens() view public returns (uint){ 
    return users[msg.sender].spent_tokens;
  }
  
   modifier isStation(address addr){
    require(stations[addr]);
    _;
  } 
     
/* modifier verify_address(uint256 message,address p, uint8 v, bytes32 r, bytes32 s) { */
/*     bytes32 hash = sha3(message); */
/*     hash= keccak256(prefix, hash);//TODO maybe add as prefix before the starting block timestamp as security measure */
/*     require(ecrecover(hash, v, r, s) == p); */
/*      _; */
/*    } */
   
/*    modifier verify_hash(uint256 message, bytes32 hash) { */
     
/*      bytes32 prefixedHash = keccak256(prefix, hash);//TODO maybe add as prefix before the starting block timestamp as security measure */
/*      bytes32 hashedMessage = sha3(message); */
/*      require(hashedMessage == hash); */
/*      _; */
/*    } */
   
   /* modifier verify(uint256 message, address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) { */
     
   /*   bytes32 prefixedHash = keccak256(prefix, hash); */
   /*   bytes32 hashedMessage = sha3(message); */
   /*   require(ecrecover(prefixedHash, v, r, s) == p && hashedMessage == hash); */
   /*   _; */
   /* } */
   
   
   modifier checkTimestamp(uint timestamp){
     require(block.timestamp<=timestamp);
     _;
   }

   /* modifier notAlreadyStarted(address user){ */
   /*   require(!users[user].charge.started); */
   /*   _; */
   /* } */

   modifier enoughTokens(uint tokens, uint requiredTokens){
     require (tokens>=requiredTokens);
     _;
   }
   
   event channelOpened(address indexed user,address indexed station, uint _value);
   
   function openChannel (uint tokenAmount,address station) public
     checkTimestamp(users[msg.sender].charge.chargingTimeout)
    enoughTokens(users[msg.sender].own_tokens,tokenAmount){ //way of locking account while charging
    // called just before starting charging, only if success

     users[msg.sender].own_tokens-= tokenAmount;
     users[msg.sender].charge.tokens+= tokenAmount;
     users[msg.sender].charge.station = station;
     timestampCharge(msg.sender);
     channelOpened(msg.sender, station, tokenAmount);
    

    //maybe set timeout to return held tokens or sth...
  }

  

  modifier isChargeable(address addr){
    require(users[addr].charge.chargingTimeout==0); //non-existant
	    /* users[addr].charge.chargingTimeout<block.timestamp);//or outdated */
    _;
  }

  /* change for checkStart for Station*/
  
  /* function startCharge(uint tokens, uint negotiatedPrice, address user) */
  /*   isStation(msg.sender) */
  /*   isChargeable(user){ */
    
  /*   timestampStart( user); */
  /*   users[user].charge.price = negotiatedPrice; //in tokens per charging unit */
    
  /* } */


  
  /* function timestampStart(address user) */
  /*   private */
  /*   { */
  /*     users[user].charge.chargingTimeout=block.timestamp+startTimeout; */
      
  /* } */
  
  function timestampCharge(address user)
    private
    {
      users[user].charge.chargingTimeout=block.timestamp+chargeTimeout;
      
  }
    //uint data; bytes32 datab = new bytes32(data); 
  function bytes32ToString (bytes32 data) public pure returns (string) {
    bytes memory bytesString = new bytes(32);
    for (uint j=0; j<32; j++) {
        byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
        if (char != 0) {
            bytesString[j] = char;
        }
    }
    return string(bytesString);
}
  
//  function setHash(bytes32 hash, uint256 message)
//  verify_hash(message,hash)
//    {
//        users[user].charge.verified_amount=hash;
//  }
  
 // modifier verifiedHash(address user){
//    require(users[user].charge.verified_amount!=0);
  //  _;
 // }
  
  /* modifier isVerified(address user){ */
  /*   require(users[user].charge.verifiedAmount!=0); */
  /*   _; */
  /* } */
  
  /* not necessary */
  /*   function finishCharge (address user, uint tokenAmount, */
  /* 			  uint8 v, bytes32 r, bytes32 s) //called by station only */
  /*   public */
  /*   isStation(msg.sender) */
  /*   verify_address(tokenAmount,user,v,r,s) */
  /*  // enoughTokens(users[user].charge.tokens,tokenAmount) */
  /* //checkTimestamp... --> not really necessary, maybe better other system to include timestamp with address to include penalisation */
  /* { */
  /*   users[user].own_tokens=users[user].charge.tokens-tokenAmount; */
  /*   users[user].spent_tokens+=tokenAmount;// just to keep track, for testing */

  /*   //Restore charge state for next one */
  /*   users[user].charge.tokens=0; */
  /*   users[user].charge.price=0; */
  /*   users[user].charge.chargingTimeout=0; */
  /*   users[user].charge.started=false; */
  /*   users[user].charge.station=0; */
  /* } */


  function finishCharge (uint tokenAmount,address station, uint timestamp) 
    //address user and station to be removed if msg.sender and tx.origin as thought
    public
   enoughTokens(users[msg.sender].charge.tokens,tokenAmount)
    checkTimestamp(users[msg.sender].charge.chargingTimeout)
    checkTimestamp(timestamp)
  //checkTimestamp... --> not really necessary, maybe better other system to include timestamp with address to include penalisation
  {
    address user = msg.sender; // TODO MAYBE NOT! MAYBE tx.origin!
    users[user].own_tokens=users[user].charge.tokens-tokenAmount;
    users[user].spent_tokens+=tokenAmount;// just to keep track, for testing

    //Restore charge state for next one
    users[user].charge.tokens=0;
    /* users[user].charge.price=0; */
    /* users[user].charge.verifiedAmount=0; */
    users[user].charge.chargingTimeout=0;
    /* users[user].charge.started=false; */
    users[user].charge.station=0;
  }
    
  /* function finishCharge (address user) //called by station only */
  /*   public */
  /*   isStation(msg.sender) */
  /*   isVerified(user) */
  /*  enoughTokens(users[user].charge.tokens,users[user].charge.verifiedAmount) */
  /* //checkTimestamp... --> not really necessary, maybe better other system to include timestamp with address to include penalisation */
  /* { */
  /*   users[user].own_tokens=users[user].charge.tokens-tokenAmount; */
  /*   users[user].spent_tokens+=tokenAmount;// just to keep track, for testing */

  /*   //Restore charge state for next one */
  /*   users[user].charge.tokens=0; */
  /*   users[user].charge.price=0; */
  /*   users[user].charge.verifiedAmount=0; */
  /*   users[user].charge.chargingTimeout=0; */
  /*   users[user].charge.started=false; */
  /*   users[user].charge.station=0; */
  /* } */

  modifier timestampSurpassed(uint timestamp){
    require(block.timestamp>timestamp);
    _;
  }

  modifier senderInvolved( address user, address station){
    require(msg.sender==user || msg.sender == station);
    _;
  }

  modifier chargeExists(address user, address station){
    require(users[user].charge.station == station);
    _;
  }
  
  modifier isOwner(address addr){
    require(owner == addr);
     _;
  }
  
  function cancelCharge(address user, address station) //only station can do
    isStation(station)
    senderInvolved(user,station)
    chargeExists(user,station)
    timestampSurpassed(users[user].charge.chargingTimeout) public { //called by user or station in the event of a problem, all tokens returned to user as if he did not receive the service, only callable after deadline

    users[user].own_tokens=users[user].charge.tokens;//return tokens
    users[user].charge.tokens=0;
    /* users[user].charge.price=0; */
    users[user].charge.chargingTimeout=0;
    /* users[user].charge.started=false; */
    users[user].charge.station=0;
  }
			
// function setTokenPrice (uint newPrice) public
//   isOwner(msg.sender){
//
//    tokenPrice = newPrice;
//
//  }

  modifier isNotStation(address addr){
    require(!stations[addr]);
    _;
  }
  
  function addStation (address newStation) public
    isNotStation(newStation)
  {
    stations[newStation]=true;
  }
  //function addStations => require (contract_owner == msg.sender)
 
  //function removeStations => require (contract_owner == msg.sender)
  
}
