import { ethers } from "hardhat";
import { Wallet, Contract } from "ethers";
import { executeContractCallWithSigners } from "../utils/execution"; // Import your custom utility

async function main() {
  // Get the signers (owners of the Safe)
  const [deployer, owner1, owner2, owner3, recipientSigner] = await ethers.getSigners();

  // Safe contract instance (the proxy address where Safe is deployed)
  const safeAddress = "0x9058c52473945B2414Ab33698B6b7dc81BdbF026"; // Safe proxy address
  const safeContract = await ethers.getContractAt("Safe", safeAddress);

  // await deployer.sendTransaction({ to: safeAddress, value: ethers.utils.parseEther("0.1") });

  // get safe balance
  const safeBalance = await ethers.provider.getBalance(safeAddress);
  console.log("Safe Balance:", ethers.utils.formatEther(safeBalance), "ETH");

  // ERC-20 contract instance (the token contract you want to transfer)
  const erc20TokenAddress = "0x0d8cc4b8d15D4c3eF1d70af0071376fb26B5669b"; // Replace with actual ERC-20 contract address
  const erc20Contract = await ethers.getContractAt("ERC20Token", erc20TokenAddress);

  // Define the transaction parameters
  const recipient = recipientSigner.address // Replace with recipient address
  const amount = ethers.utils.parseUnits("10", 18); // Amount to transfer (10 tokens with 18 decimals)

  // Build the ERC-20 transfer transaction (this will encode the transfer function)
  const methodName = "transfer";
  const methodParams = [recipient, amount];

  // Use the utility to execute the contract call and get signatures from both signers
  const resp = await executeContractCallWithSigners(
    safeContract,      // Safe proxy contract
    erc20Contract,     // ERC-20 token contract
    methodName,        // Method name: "transfer"
    methodParams,      // Parameters: [recipient, amount]
    [owner1, owner2],  // Two owner signers
  );
  const waitResp = await resp.wait();
  console.log(`ERC-20 transfer of ${amount.toString()} tokens initiated by Safe ${safeAddress}.`);
  console.log("Resp:", waitResp);

  // check the recipient balance
  const recipientBalance = await erc20Contract.balanceOf(recipient);
  console.log("Recipient Balance:", ethers.utils.formatUnits(recipientBalance, 18), "TT");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
