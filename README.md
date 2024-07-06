# solhack
solana token experiments

## setup

I installed the solana dev tools as follows:

	sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"
	
## House of Rugs
I'm following the tutorial found here: https://solana.com/developers/guides/getstarted/how-to-create-a-token

*NOTE*: This tutorial is for a token-2022 token, not a tokenkeg token.  Thus, the token was created with the metadata extension, and not metaplex.

*NOTE*: these activities were done in a scratch "foo-token" directory
that is not checked in.

I made a keypair with solana-keygen:

	solana-keygen grind --starts-with nic:1

The results was nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf.json

I made the token with:

	spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
	--enable-metadata nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf.json

The token was created as a token-2022 token with the metadata
extension. Results:

	Creating token nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

I set the metadata as follow:

	spl-token initialize-metadata nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf \
	'House of Rugs' 'HOR'\
	https://raw.githubusercontent.com/rdevaul/solhack/main/hor-token/metadata.json
	
I minted tokens with:

	spl-token mint nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 1000
	
I sent tokens to my wallet with:

	spl-token transfer nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 100 \
	425VB7Phq4EApekN5qkrZWefeZwGwThThXhXT8SPbvtU --fund-recipient
	
	
## Rug Merchants
The Rug Merchants token (ticker `$RUGME`) is an SPL token created with
the old school" tokenkeg program.  This is the maximally-compatible
way to create a SPL token, and this is the technique that will be used
to create the $X token.  To create this token, I'm following the
documentation provided here: https://spl.solana.com/token

I made a keypair with solana-keygen:

	solana-keygen grind --starts-with rug:1 

Results: `rugfKQvjAGcwE37YcGKboh9ePim6Hc83EK1Y1wBzaPY.json`

I created the token using:

	spl-token create-token rugfKQvjAGcwE37YcGKboh9ePim6Hc83EK1Y1wBzaPY.json
	
Results:

	Address:  rugfKQvjAGcwE37YcGKboh9ePim6Hc83EK1Y1wBzaPY
	Decimals:  9
	Signature: R9gc79AFNRZ3t1MHJjUoHxPaHQ1v7ABKoowa9P4xMK4Eq5A9QhNyGyZSBGXvd9tvSu3wdtthP4BCth1HEr3hRLW
	
To add metadata, I'm relying on metaplex program &mdash;
https://developers.metaplex.com/token-metadata &mdash; the
documentation there is lousy.  Here are the steps I'm taking to add the metadata:

npm install @metaplex-foundation/js @solana/web3.js

I created the metadata.json file and the setmeta.js script in the
rugme-token directory



