# solhack
solana token experiments

## setup

I installed the solana dev tools as follows:
	sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"
	
## House of Rugs
I'm following the tutorial found here: https://solana.com/developers/guides/getstarted/how-to-create-a-token

*NOTE*: This tutorial is for a token-2022 token, not a tokenkeg token.  Thus, the token was created 

I made a keypair with solana-keygen:
	solana-keygen grind --starts-with nic:1

The results was nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf.json

I made the token with:
	spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
	--enable-metadata nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf.json

The token was created as a token-2022 token with the metadata
extension. Results:
	Creating token nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

I set the metadata as follow:
	spl-token initialize-metadata nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 'House of Rugs' 'HOR' https://raw.githubusercontent.com/rdevaul/solhack/main/hor-token/metadata.json
	
I minted tokens with:
	spl-token mint nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 1000
	
I sent tokens to my wallet with:
	spl-token transfer nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 100 425VB7Phq4EApekN5qkrZWefeZwGwThThXhXT8SPbvtU --fund-recipient
	
	
