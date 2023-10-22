/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const EASContractAddress = "0x4200000000000000000000000000000000000021"; // OP goerli

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		if (request.method.toUpperCase() === "GET") return new Response("OK");
    if (request.method.toUpperCase() !== "POST") return new Response("Invalid method");

		try { // TODO check signature
			const body = await request.json();
			const fromAddress = body?.event?.activity[0]?.fromAddress;
			if (!fromAddress) throw new Error("Invalid Body");

			const hash = body?.event?.activity[0]?.hash || "";

			// Initialize the sdk with the address of the EAS Schema contract address
			const eas = new EAS(EASContractAddress);

			// Gets a default provider (in production use something else like infura/alchemy)
			// const provider = ethers.getDefaultProvider("optimism-goerli");
			const provider = new ethers.AlchemyProvider("optimism-goerli", env.ALCHEMY_API_KEY)
			const output = await provider.getBlockNumber();
			console.log("Receiver and block", { fromAddress, output, hash });

			const signer = ethers.Wallet.fromPhrase(env.MNEMONIC, provider);
			eas.connect(signer);

			// Initialize SchemaEncoder with the schema string
			const schemaEncoder = new SchemaEncoder("string minted");
			const encodedData = schemaEncoder.encodeData([
				{ name: "minted", value: "tx hash " + hash, type: "string" },
			]);
			const schemaUID = "0xedc8a2bf856db87850a0483a7f090abc12cafcb6fa477c3732b5e52b65f4e959";

			const tx = await eas.attest({
				schema: schemaUID,
				data: {
					recipient: fromAddress,
					expirationTime: 0,
					revocable: true, // Be aware that if your schema is not revocable, this MUST be false
					data: encodedData,
				},
			});
			
			const newAttestationUID = await tx.wait();
			console.log("New attestation UID:", newAttestationUID);
			return new Response("OK");
		} catch (e) {
      return new Response("Error thrown " + e.message);
    }
		
	},
};
