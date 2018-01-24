pragma solidity ^0.4.17;

contract mortal {
    /* Define variable owner of the type address */
    address owner;
    
    /* This function is executed at initialization and sets the owner of the contract */
    function mortal() public { owner = msg.sender; }

    /* Function to recover the funds on the contract */
    function kill() public { if (msg.sender == owner) selfdestruct(owner); }
}

contract simpleContract {
  
  function simpleContract() public {
    creator = msg.sender;
  }
  
  uint public value;
  
  function testingStateChannel(uint simpleValue){
    value=simpleValue;
  }
  
  function getSimpleValue() view public returns (uint){
    return value;
  }
}
