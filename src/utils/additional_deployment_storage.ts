import fs from 'fs';

const path = 'additional_deployments.json';
export class AdditionalDeploymentStorage {

    public static getDeployments(): { [contractName: string]: string } {
        // create the file if it doesn't exist
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, '{}');
        }
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }

    public static insertDeploymentAddressToFile(contractName: string, address: string) {
        const deployments = this.getDeployments();
        // Add the new deployment address to the parsed object
        deployments[contractName] = address;
        // Write the updated object to the file
        fs.writeFileSync(path, JSON.stringify(deployments, null, 2));
    }
}
