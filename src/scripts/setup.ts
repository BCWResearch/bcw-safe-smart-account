const { ethers } = require("hardhat");

async function main() {
    const [deployer, owner1, owner2, owner3] = await ethers.getSigners();

    const safeAddress = "0x9058c52473945B2414Ab33698B6b7dc81BdbF026"; // Safe contract address
    const Safe = await ethers.getContractFactory("Safe");
    const safe = Safe.attach(safeAddress);
    safe.getThreshold().then((threshold) => {
        console.log("Threshold:", threshold.toNumber());
    })

    safe.getOwners().then((owners) => {
        console.log("Owners:", owners);
    });

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
