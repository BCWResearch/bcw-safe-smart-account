import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { AdditionalDeploymentStorage } from "../utils/additional_deployment_storage";

task("deploy-proxy", "Deploys the proxy contract").setAction(async (_, hre) => {
    const { ethers } = hre;
    const [
        deployer,
        owner1,
    ] = await ethers.getSigners();

    console.log("Deploying Safe contract proxy");
    const deployments = await hre.deployments.all();
    const safeProxyFactoryAddress = deployments["SafeProxyFactory"]?.address;
    const safeSingletonAddress = deployments["Safe"]?.address;
    if (!safeProxyFactoryAddress || !safeSingletonAddress) {
        console.error("SafeProxyFactory or Safe contract not found in deployments");
        return;
    }
    console.log("SafeProxyFactory address:", safeProxyFactoryAddress);
    console.log("Safe address:", safeSingletonAddress);

    const SafeProxyFactory = await ethers.getContractAt("SafeProxyFactory", safeProxyFactoryAddress);

    // Owners and threshold setup
    const owners = [deployer.address, owner1.address];
    const threshold = 2; // Number of required approvals

    // Fallback handler address (can be set to AddressZero if not needed)
    const fallbackHandler = ethers.constants.AddressZero; // Replace this with the fallback handler address if needed
    const paymentToken = ethers.constants.AddressZero; // Set to AddressZero for ETH
    const payment = 0; // No payment required
    const paymentReceiver = ethers.constants.AddressZero;

    // Encoding the setup call for the Safe contract
    const safeInterface = new ethers.utils.Interface([
        "function setup(address[], uint256, address, bytes, address, address, uint256, address)",
    ]);

    // Encoding the initializer with correct parameters for the Safe setup
    const initializer = safeInterface.encodeFunctionData("setup", [
        owners, // List of Safe owners
        threshold, // Number of required approvals
        ethers.constants.AddressZero, // `to` address (no delegate call here)
        "0x", // Data payload for optional delegate call
        fallbackHandler, // Fallback handler address
        paymentToken, // Payment token (0 = ETH)
        payment, // Payment amount (0 in this case)
        paymentReceiver, // Payment receiver (set to zero)
    ]);

    // Deploying a proxy using createProxyWithNonce
    const saltNonce = 123; //new Date().getTime(); // Random nonce for the proxy
    const tx = await SafeProxyFactory.createProxyWithNonce(safeSingletonAddress, initializer, saltNonce);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Get the deployed proxy address from the event
    const proxyAddress = receipt.events.find((e: any) => e.event === "ProxyCreation").args.proxy;
    console.log("New Safe proxy deployed at:", proxyAddress);

    AdditionalDeploymentStorage.insertDeploymentAddressToFile("SafeProxyFactory", safeProxyFactoryAddress);
    AdditionalDeploymentStorage.insertDeploymentAddressToFile("Safe", safeSingletonAddress);
    AdditionalDeploymentStorage.insertDeploymentAddressToFile("SafeProxy", proxyAddress);
});


/// LOGS
/*
    Deploying Safe contract proxy
    SafeProxyFactory address: 0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67
    Safe address: 0x41675C099F32341bf84BFc5382aF534df5C7461a
    New Safe proxy deployed at: 0xC883BaAf2952371BcFC5fA339354BC0e485F9Eb4
*/
