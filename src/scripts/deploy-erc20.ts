async function main() {
    // Get the contract factory for ERC20Token
    const ERC20Token = await ethers.getContractFactory("ERC20Token");

    // Deploy the contract (TestToken with symbol TT and an initial supply of 1,000,000 TT tokens)
    const erc20 = await ERC20Token.deploy();

    // Wait for the contract to be deployed
    await erc20.deployed();

    console.log("ERC20 Token deployed to address:", erc20.address);

    // Optionally, print the total supply to verify the token has been minted
    const totalSupply = await erc20.totalSupply();
    console.log("Total Supply:", ethers.utils.formatUnits(totalSupply, 18), "TT");


    const safeAddress = "0x9058c52473945B2414Ab33698B6b7dc81BdbF026"; // Safe contract address

    // transfer 100 TT tokens to the Safe contract
    const tx = await erc20.transfer(safeAddress, ethers.utils.parseUnits("100", 18));
    await tx.wait();
    
    // check the Safe balance
    const safeBalance = await erc20.balanceOf(safeAddress);
    console.log("Safe Balance:", ethers.utils.formatUnits(safeBalance, 18), "TT");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });