const hre = require("hardhat");

async function main() {
  const Auth = await hre.ethers.getContractFactory("TransactionAuthorization");
  const auth = await Auth.deploy();         // Deploy contract
  await auth.waitForDeployment();           // Wait for deployment (new version)

  console.log(`Contract deployed to: ${auth.target}`); // Use `auth.target` instead of `auth.address`
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
