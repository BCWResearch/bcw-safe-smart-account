import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { AdditionalDeploymentStorage } from "../utils/additional_deployment_storage";

task("deploy-test-erc20", "Deploys erc20 test token and fund desired owners").setAction(async (_, hre) => {
    const additional_deployments = AdditionalDeploymentStorage.getDeployments();
    const safeProxyAddress = additional_deployments["SafeProxy"];

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

    // Store the contract address in deployments
    AdditionalDeploymentStorage.insertDeploymentAddressToFile("ERC20Token", erc20.address);

    // funding half amount to owner4 as a treasury
    const [deployer, owner1, owner2, owner3, treasury] = await ethers.getSigners();
    const tx = await erc20.transfer(treasury.address, totalSupply.div(2));
    await tx.wait();

    // check the treasury balance
    const treasuryBalance = await erc20.balanceOf(treasury.address);
    console.log("Treasury Balance:", ethers.utils.formatUnits(treasuryBalance, 18), "TT");

    if (!safeProxyAddress) {
        console.error("SafeProxy not found in deployments to fund");
        return;
    }

    // transfer other half to SafeProxy
    const tx2 = await erc20.transfer(safeProxyAddress, totalSupply.div(2));
    await tx2.wait();

    // check the Safe balance
    const safeBalance = await erc20.balanceOf(safeProxyAddress);
    console.log("Safe Balance:", ethers.utils.formatUnits(safeBalance, 18), "TT");
});