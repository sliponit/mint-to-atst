import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // OP goerli

// Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

// Gets a default provider (in production use something else like infura/alchemy)
// const provider = ethers.getDefaultProvider("optimism-goerli");
const ALCHEMY_API_KEY = ""; // TODO??
const provider = new ethers.AlchemyProvider("optimism-goerli", ALCHEMY_API_KEY)
const output = await provider.getBlockNumber();
console.log(output);

// Connects an ethers style provider/signingProvider to perform read/write functions.
// MUST be a signer to do write operations!
// eas.connect(provider);

const mnemonic = ""; // TODO??
const signer = ethers.Wallet.fromPhrase(mnemonic, provider);
eas.connect(signer);


// Initialize SchemaEncoder with the schema string
const schemaEncoder = new SchemaEncoder("string minted");
const encodedData = schemaEncoder.encodeData([
  { name: "minted", value: "test from mjs", type: "string" },
]);
console.log('encodedData', encodedData)

const schemaUID = "0xedc8a2bf856db87850a0483a7f090abc12cafcb6fa477c3732b5e52b65f4e959";

const tx = await eas.attest({
  schema: schemaUID,
  data: {
    recipient: "0x0AF858Ce3a3A1BcDFFCBF863d9010FF588Cb38B8",
    expirationTime: 0,
    revocable: true, // Be aware that if your schema is not revocable, this MUST be false
    data: encodedData,
  },
});

const newAttestationUID = await tx.wait();

console.log("New attestation UID:", newAttestationUID);
