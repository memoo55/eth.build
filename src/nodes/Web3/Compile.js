const axios = require('axios').default;


function Compile() {
  this.addInput("name","string")
  this.addInput("solidity","string")
  this.addInput("compile",-1)
  this.addOutput("bytecode","string")
  this.addOutput("abi","object")
  this.properties = { };
  this.size[0] = 210
}

Compile.title = "Compile";


Compile.prototype.onExecute = function() {
  let name = this.getInputData(0)
  let solidity = this.getInputData(1)
  if(name && solidity && (solidity!=this.solidity || name!=this.name)){
    this.solidity = solidity
    this.name = name
    this.compile(name)
  }

  this.setOutputData(0,this.bytecode?"0x"+this.bytecode:this.bytecode)
  this.setOutputData(1,this.abi)
};

Compile.prototype.onAction = function() {
  let name = this.getInputData(0)
  let solidity = this.getInputData(1)
  if(name && solidity){
    this.properties.solidity = solidity
    this.compile(name)
  }
}

Compile.prototype.compile = function(name) {
  let dependencies = {}

  console.log("this.properties.solidity",this.properties.solidity)
  dependencies[name+".sol"] = {content: this.properties.solidity};

  console.log("dependencies",dependencies)
  let solcObject = {
    language: 'Solidity',
    sources: dependencies,
    settings: {
      outputSelection: {
            '*': {
                '*': [ '*' ]
            }
      },
    }
  }

  console.log(" 🛠️  Compiling...",solcObject.sources)

  axios.post('http://localhost:48452/',solcObject)
  .then((response) => {
    console.log("response.data",response.data)
    this.properties.compiled = response.data

    console.log("COMPILED:",this.properties.compiled)

    let compiledContractObject = this.properties.compiled.contracts[name+".sol"][name]

    console.log("compiledContractObject",compiledContractObject)

    if(compiledContractObject && compiledContractObject.evm ) {
      this.bytecode = compiledContractObject.evm.bytecode.object
      this.abi = compiledContractObject.abi
    }
  })
  .catch(function (error) {
    console.log(error);
  });


}

export default Compile