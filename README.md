# mint-to-atst

As soon as a NFT has been minted, issue an attestation in the atst system from OP - the  attestation sender is the deployer of the NFT contract and the receiver is the minter

## Description
The project allows to issue an attestation from the deployer of a NFT smart contract to the minter of said NFT automatically.

We use a demo smart contract for NFT from thirweb https://thirdweb.com/thirdweb.eth/OpenEditionERC721

Alchemy is used for listening to the NFT smart contract mints and send a webhook to a cloudflare worker https://www.alchemy.com/custom-webhooks

The cloudflare worker receives mint events from the alchemy webhook. It does the atst creation from the contract deployer 

The schema for the atst is https://optimism-goerli-bedrock.easscan.org/schema/view/0xedc8a2bf856db87850a0483a7f090abc12cafcb6fa477c3732b5e52b65f4e959. It mainly a string `minted` where we store the transaction hash of the mint.

## Content
- `./worker` cloudflare worker deployed at https://worker.sliponit9471.workers.dev/ It receives POST from the alchemy webhook listening to mints. First it derives the minter address and the mint transaction hash from the body of the webhook. Then it sets up the attestation services withthose data, plus a provider, plus a signer 5the contract deployer but could be anything), plus the schema UID. Then the worker issues the attestion and returns
- `./frontend` webpage deployed on cloudflare pages at https://mint-to-atst.pages.dev/, mainly contains an embed to a thirdweb page to mint
- `./eas` contains a script to issue a attestation; unused, just for debugging
