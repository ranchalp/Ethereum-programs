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

  uint token_price = 1 wei;
  uint public testing_public = 1 wei;
  address[] private stations =  [0x6f1736d39d9b79e5a61b0d19b40a5afe57cddb69, 0xdf43425cb1ff3bd262973f56bd60c8a24de65751,0x8459f8243de86e7698d886a5fcab943855691906]; // for the moment static, will make dynamic array
  
  struct User{
    uint own_tokens;
    //uint held_tokens; not necessary anymore, now held inside each transaction with the other data structure
    uint spent_tokens;
  }

  mapping(address => User) users;
  
  uint constant STATE_FREE = 0;
  uint constant STATE_HOLD = 1;
  uint constant STATE_SPEND = 2;
  uint constant AGREEMENT_THRESHOLD = 5; //watts;//can be set per tx or defined to change with time etc.
  struct TransactionSettings{
    uint WxToken; // Watts per Token spent, price agreed upon token held
    address thirdParty;
    uint tokenAmount;
  }
  
  struct Transaction {
    address counterparty;
    uint watts; //Watts declared
    TransactionSettings settings;
    uint state; 
  }

  mapping(address => Transaction) curtx; //only current transaction
  mapping(address => Transaction[]) unrestxs; //only stores unresolved transactions
  
  uint constant MAX_TXS = 10; //at the moment, 10 unresolved transactions per user

  function ChargingCompany () public Mortal() { //constructor
    //initialise stations once dynamic
    //maybe change token price
  }

  event purchasetokens_debug(uint var1, uint var2, uint var3, uint var4, bool var5);
  function purchaseTokens (uint token_amount) public payable{ // purchase tokens
    purchasetokens_debug(token_amount,token_price,token_amount*token_price,msg.value,(token_amount*token_price)==msg.value);
    require ((token_amount * token_price) == msg.value);
    
    users[msg.sender].own_tokens += token_amount;
  }

  function getTokenPrice() view public returns (uint){ // view instead of constant (?)
    return token_price;
  }

  function getMyTokens() view public returns (uint){ // view instead of constant (?)
    return users[msg.sender].own_tokens;
  }

   function isContained(address addr, address[] addresses) private pure returns (bool value){
    value = false;
    for (uint i=0; i<addresses.length && !value; i++)
      if (addresses[i]==addr)
	value=true;

    return value;
  }

   function equals(TransactionSettings tx1,TransactionSettings tx2)private pure returns (bool value){
     return tx1.WxToken == tx2.WxToken &&
       tx1.thirdParty == tx2.thirdParty &&
       tx1.tokenAmount == tx2.tokenAmount;
   }

   function agreed(uint nwatts1,uint nwatts2)private pure returns (bool value){//checks that both parties agree on the watts declared
     uint aux;
     if(nwatts1<nwatts2){ //biggest always nwatts1
       aux = nwatts1;
       nwatts1 = nwatts2;
       nwatts2 = aux;
     }

     return (nwatts1-nwatts2)<AGREEMENT_THRESHOLD;
   }
  
   function holdTokens ( address counterparty, uint tokenAmount, uint WxToken, address thirdParty) public { //way of locking account while charging
    // called just before starting charging, only if succes

    bool isStation = isContained(msg.sender,stations);
    require (unrestxs[msg.sender].length<MAX_TXS);
    require (unrestxs[counterparty].length<MAX_TXS);

    //if they already disagreed without solution,
    //chances are they will disagree again, do not allow
    require (findTx(unrestxs[msg.sender],counterparty)==0);
    require (findTx(unrestxs[counterparty],msg.sender)==0);
    
    if(isStation){ // station
      require(!isContained(counterparty,stations)); // only one must be a valid station
      require(users[counterparty].own_tokens>=tokenAmount); //enough money to put on hold
    }else{ // user
      require(isContained(counterparty,stations));// at least one must be a valid station
      require(users[msg.sender].own_tokens>=tokenAmount); //enough money to put on hold
      users[msg.sender].own_tokens-= tokenAmount;
    }

    require(unrestxs[msg.sender].length<MAX_TXS);//not full, to add new transaction
    require(curtx[counterparty].counterparty>0 || //either current tx not set  
	    (curtx[counterparty].counterparty==msg.sender &&
	     curtx[counterparty].state==STATE_FREE)); //or current transaction is this one (addr and hasn't been held yet)
    // if this is not the case, then user/station should cancel first the tx, and add it to failed txs.
    

    curtx[msg.sender]  = Transaction(counterparty, 0, TransactionSettings(WxToken,thirdParty,tokenAmount),STATE_FREE);

    if(curtx[counterparty].state==STATE_FREE && curtx[counterparty].counterparty==msg.sender){ //if other tx was already set, put both on HOLD and go on;
      require(equals(curtx[msg.sender].settings,curtx[counterparty].settings)); //both agents must agree on price and third party 
      curtx[counterparty].state=STATE_HOLD;
      curtx[msg.sender].state=STATE_HOLD;
    }
    
    //#TODO
    //- Add function to cancel transaction if counterparty does not add his' (different from addding to failed txs) (that is, if STATE_FREE)
    //- Think about how to reduce # transactions
    //- multisig address applied here...? (check papers)
    
    
  }
   //#TODO
   //problem -> if malicious adversary, fee from gas into putting and cancelling transaction not recovered
   function cancelTransaction() public{
     require(curtx[msg.sender].counterparty!=address(0)
	     && curtx[msg.sender].state==STATE_HOLD);
     require(curtx[curtx[msg.sender].counterparty].state==STATE_FREE);
     // counterparty did not send his transaction to update state, whole thing is cancelled
     curtx[msg.sender]= Transaction(address(0), 0, TransactionSettings(0,address(0),0),STATE_FREE); //cancelled... but feees paid
   }
   
  
  function spendTokens (address counterparty, uint nwatts) public{ //spend tokens after charged, or to return actual ethers (done in a separate transaction by overlaying technology at the moment)

    bool isStation = isContained(msg.sender,stations);
    require(equals(curtx[msg.sender].settings,curtx[counterparty].settings));//both transactions must comply
    require(curtx[msg.sender].state == STATE_HOLD);
    uint tokensConsumed = nwatts/curtx[msg.sender].settings.WxToken;
    uint remainder = nwatts - curtx[msg.sender].settings.WxToken * tokensConsumed;
    tokensConsumed = remainder>0? tokensConsumed+1 :tokensConsumed; // if not exact, then ceil rounding.

    require(curtx[msg.sender].settings.tokenAmount>=tokensConsumed); // TODO WHAT HAPPENS IF THIS IS NOT TRUE...? -> THIS SHOULD NEVER HAPPEN...
    if(isStation){
      require(!isContained(counterparty,stations)); // only one must be a valid station
    }else{ // user
      require(isContained(counterparty,stations));// at least one must be a valid station
    }

    curtx[msg.sender].watts = nwatts;
    if (curtx[counterparty].state == STATE_SPEND){ //if other transaction already waiting for this one
      if (agreed(curtx[msg.sender].watts,curtx[counterparty].watts)){//all ok, can finish

	address user = (isStation)? counterparty: msg.sender;
	users[user].own_tokens+= curtx[user].settings.tokenAmount-tokensConsumed;//free unspent tokens
       
      } else { //there was a dispute, they do not agree on the amount of watts transferred
	unrestxs[msg.sender].push(curtx[msg.sender]);
	unrestxs[counterparty].push(curtx[counterparty]); 
	// TODO
	// - make function to enable resolving this situation
	// - create state machine maybe...? one per person involved'd be best I guess
	// - program function to cancel held transactions (not failed, but in STATE SPEND OR STATE HOLD)
	// - what happens if station decides not to transfer... ?  (after timeout, user should be considered to be right...? [third party can check block number or sth, that'd be best])
      }
      
      //reinitialise
      curtx[msg.sender]= Transaction(address(0), 0, TransactionSettings(0,address(0),0),STATE_FREE); //cancelled... but feees paid;
      curtx[counterparty]= Transaction(address(0), 0, TransactionSettings(0,address(0),0),STATE_FREE); //cancelled... but feees paid;
    }else{//first transaction of the two
      curtx[msg.sender].state = STATE_SPEND; //set as ready and wait for next.
    }
  }

  function setTokenPrice (uint new_price) public {

    require (isContained(msg.sender,stations));

    token_price = new_price;

  }

  function findTx(Transaction[] txs, address counterparty) private pure returns (uint value){
    value = uint(-1);
    for (uint i=0; i<txs.length && value==uint(-1); i++)
      if (txs[i].counterparty==counterparty){ // as only one transaction per 2 agents, easy to identify, just look for counterparty
	value=i;
      }
    return value;
  }
  
  function resolveTransaction(address user, address station, address winner) public{
    Transaction memory txuser;
    Transaction memory txstation;
    uint txuser_index=findTx(unrestxs[user],station);
    uint txstation_index=findTx(unrestxs[station],user);
    txuser = unrestxs[user][txuser_index];
    txstation = unrestxs[station][txstation_index];
    require(txuser_index!=uint(-1) && txstation_index!=uint(-1));
    require (txuser.settings.thirdParty ==
	     txstation.settings.thirdParty);
    require (txuser.settings.thirdParty ==
	     msg.sender);
    require (txuser.counterparty == station);
    require (txstation.counterparty == user);
    require (txstation.state == STATE_SPEND ||
	     txuser.state == STATE_SPEND); //at least one in spend, but maybe both

    Transaction memory txwin;
    if (winner == user){
      txwin = txuser;
    }else{
      txwin = txstation;
    }

    uint tokensConsumed = txwin.watts/txwin.settings.WxToken;
    uint remainder = txwin.watts - txwin.settings.WxToken * tokensConsumed;
    tokensConsumed = remainder>0? tokensConsumed+1 :tokensConsumed; // if not exact, then ceil rounding.
    users[user].own_tokens+= txwin.settings.tokenAmount-tokensConsumed;
  }
  //function addStations => require (contract_owner == msg.sender)
 
  //function removeStations => require (contract_owner == msg.sender)
  
}
