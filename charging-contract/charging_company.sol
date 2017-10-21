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
  address[] private stations =  [0x6f1736d39d9b79e5a61b0d19b40a5afe57cddb69, 0xdf43425cb1ff3bd262973f56bd60c8a24de65751,0x8459f8243de86e7698d886a5fcab943855691906]; // for the moment static, will make dynamic array

  struct User{
    uint own_tokens;
    uint held_tokens;
  }
  mapping(address => User) users;


  function ChargingCompany () public Mortal() { //constructor
    //initialise stations once dynamic
    //maybe change token price
  }

  function purchaseTokens (uint token_amount) public payable{ // purchase tokens
    require ((token_amount * token_price) == msg.value);
    
    users[msg.sender].own_tokens += token_amount;
  }

   function isContained(address addr, address[] addresses) private pure returns (bool value){
    value = false;
    for (uint i=0; i<addresses.length && !value; i++)
      if (addresses[i]==addr)
	value=true;

    return value;
  }
  
  function holdTokens ( address to_hold, uint token_amount) public { //way of locking account while charging
    // called just before starting charging, only if success
    
    require (isContained(msg.sender,stations));

    require (users[to_hold].own_tokens>=token_amount);

    users[to_hold].own_tokens-= token_amount;
    users[to_hold].held_tokens-= token_amount;

    //maybe set timeout to return held tokens or sth...
    
    
  }

  function spendTokens (address to_spend, uint token_amount) public{ //spend tokens after charged, or to return actual ethers (done in a separate transaction by overlaying technology at the moment)

    require (isContained(msg.sender,stations)); 

    require(token_amount<=users[to_spend].held_tokens);

    users[to_spend].held_tokens-=token_amount;

    
    
  }

  function setTokenPrice (uint new_price) public {

    //require (msg.sender in stations);

    token_price = new_price;

  }
  
  //function addStations => require (contract_owner == msg.sender)

  //function removeStations => require (contract_owner == msg.sender)
  
}
