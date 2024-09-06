import "@nomiclabs/hardhat-ethers";
import type { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-deploy";
import dotenv from "dotenv";
import yargs from "yargs";
import { getSingletonFactoryInfo } from "@safe-global/safe-singleton-factory";

const argv = yargs
    .option("network", {
        type: "string",
        default: "hardhat",
    })
    .help(false)
    .version(false).argv;

// Load environment variables.
dotenv.config();
const { NODE_URL, INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, PK, SOLIDITY_VERSION, SOLIDITY_SETTINGS } = process.env;

const DEFAULT_MNEMONIC = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
    sharedNetworkConfig.accounts = [PK];
} else {
    sharedNetworkConfig.accounts = {
        mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
    };
}

if (["mainnet", "rinkeby", "kovan", "goerli", "ropsten", "mumbai", "polygon"].includes(argv.network) && INFURA_KEY === undefined) {
    throw new Error(`Could not find Infura key in env, unable to connect to network ${argv.network}`);
}

import "./src/tasks/local_verify";
import "./src/tasks/deploy_contracts";
import "./src/tasks/show_codesize";
import { BigNumber } from "@ethersproject/bignumber";
import { DeterministicDeploymentInfo } from "hardhat-deploy/dist/types";

const primarySolidityVersion = SOLIDITY_VERSION || "0.7.6";
const soliditySettings = SOLIDITY_SETTINGS ? JSON.parse(SOLIDITY_SETTINGS) : undefined;

const deterministicDeployment = (network: string): DeterministicDeploymentInfo => {
    console.log(`Deterministic deployment for network ${network}`);
    const info =
    // {
    //     "gasPrice": 100000000000,
    //     "gasLimit": 100000,
    //     "signerAddress": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    //     "transaction": "0xf8a98085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf38401224980a01fe9be4c26b513775d67a0c2804df30e25733d749d28e3f4a1dbc9aa3d1b6bf5a03180812632be250062828d977867c6fc5722a9c3b7393839ba755331d18e43eb",
    //     "address": "0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0"
    // }

    {
        "gasPrice": 100000000000,
        "gasLimit": 100000,
        "signerAddress": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
        "transaction": "0xf8a98085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf38401224980a01fe9be4c26b513775d67a0c2804df30e25733d749d28e3f4a1dbc9aa3d1b6bf5a03180812632be250062828d977867c6fc5722a9c3b7393839ba755331d18e43eb",
        "address": "0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0"
    }


    //getSingletonFactoryInfo(parseInt(network));
    if (!info) {
        throw new Error(`
        Safe factory not found for network ${network}. You can request a new deployment at https://github.com/safe-global/safe-singleton-factory.
        For more information, see https://github.com/safe-global/safe-contracts#replay-protection-eip-155
      `);
    }
    const returnVal = {
        factory: info.address,
        deployer: info.signerAddress,
        funding: BigNumber.from(info.gasLimit).mul(BigNumber.from(info.gasPrice)).toString(),
        signedTx: info.transaction,
    };
    // console.log(`Deterministic deployment info: ${JSON.stringify(returnVal)}`);
    return returnVal;
};

const userConfig: HardhatUserConfig = {
    paths: {
        artifacts: "build/artifacts",
        cache: "build/cache",
        deploy: "src/deploy",
        sources: "contracts",
    },
    solidity: {
        compilers: [{ version: primarySolidityVersion, settings: soliditySettings }, { version: "0.6.12" }, { version: "0.5.17" }],
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
            }
        },
        hardhat: {
            allowUnlimitedContractSize: true,
            blockGasLimit: 100000000,
            gas: 100000000,
            accounts: {
                mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
            }
        },
        mainnet: {
            ...sharedNetworkConfig,
            url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        },
        gnosis: {
            ...sharedNetworkConfig,
            url: "https://rpc.gnosischain.com",
        },
        ewc: {
            ...sharedNetworkConfig,
            url: `https://rpc.energyweb.org`,
        },
        goerli: {
            ...sharedNetworkConfig,
            url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
        },
        mumbai: {
            ...sharedNetworkConfig,
            url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
        },
        polygon: {
            ...sharedNetworkConfig,
            url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
        },
        volta: {
            ...sharedNetworkConfig,
            url: `https://volta-rpc.energyweb.org`,
        },
        bsc: {
            ...sharedNetworkConfig,
            url: `https://bsc-dataseed.binance.org/`,
        },
        arbitrum: {
            ...sharedNetworkConfig,
            url: `https://arb1.arbitrum.io/rpc`,
        },
        fantomTestnet: {
            ...sharedNetworkConfig,
            url: `https://rpc.testnet.fantom.network/`,
        },
        avalanche: {
            ...sharedNetworkConfig,
            url: `https://api.avax.network/ext/bc/C/rpc`,
        },
    },
    deterministicDeployment,
    namedAccounts: {
        deployer: 0,
    },
    mocha: {
        timeout: 2000000,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};
if (NODE_URL) {
    userConfig.networks!.custom = {
        ...sharedNetworkConfig,
        url: NODE_URL,
    };
}
export default userConfig;
