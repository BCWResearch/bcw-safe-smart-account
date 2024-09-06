const { ethers } = require("hardhat");


async function main() {
    const [deployer, owner1, owner2, owner3] = await ethers.getSigners();
    
    const safeProxyFactoryAddress = "0x64b23b4c9e4B5DB4d34abc448ff532Aa38A06BC0"; // SafeProxyFactory address
    const safeSingletonAddress = "0xe9ED62295c33307518FE1a9d790e7E65A614E8e0";  // Singleton Safe contract address

    const SafeProxyFactory = await ethers.getContractAt("SafeProxyFactory", safeProxyFactoryAddress);

    // Owners and threshold setup
    const owners = [owner1.address, owner2.address, owner3.address];
    const threshold = 2;  // Number of required approvals

    // Fallback handler address (can be set to AddressZero if not needed)
    const fallbackHandler = ethers.constants.AddressZero; // Replace this with the fallback handler address if needed
    const paymentToken = ethers.constants.AddressZero;       // Set to AddressZero for ETH
    const payment = 0;                                       // No payment required
    const paymentReceiver = ethers.constants.AddressZero;     // No specific payment receiver

    // Encoding the setup call for the Safe contract
    const safeInterface = new ethers.utils.Interface([
        "function setup(address[], uint256, address, bytes, address, address, uint256, address)"
    ]);

    // Encoding the initializer with correct parameters for the Safe setup
    const initializer = safeInterface.encodeFunctionData("setup", [
        owners,                      // List of Safe owners
        threshold,                   // Number of required approvals
        ethers.constants.AddressZero, // `to` address (no delegate call here)
        "0x",                        // Data payload for optional delegate call
        fallbackHandler,              // Fallback handler address
        paymentToken,                 // Payment token (0 = ETH)
        payment,                      // Payment amount (0 in this case)
        paymentReceiver               // Payment receiver (set to zero)
    ]);

    console.log("Encoded initializer:", initializer); // Optional: log the encoded initializer for debugging

    // Deploying a proxy using createProxyWithNonce
    const saltNonce = 123;  // A nonce value, change it if needed
    const tx = await SafeProxyFactory.createProxyWithNonce(safeSingletonAddress, initializer, saltNonce);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Get the deployed proxy address from the event
    const proxyAddress = receipt.events.find(e => e.event === 'ProxyCreation').args.proxy;
    console.log("New Safe proxy deployed at:", proxyAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });