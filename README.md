# solhack
solana token experiments - this repo documents various experimets in
creating Solana tokens and converting Polygon tokens to Solana tokens
by way of the wormhole bridge and the official Solana `token-upgrade`
program, which is part of the [Solana Preogram
Library](https://spl.solana.com/).

This README has turned into a long saga relating to my efforts to
build a token-conversion pipeline that would start with a bog-standard
ERC-20 token on Polygon and end with a token-2022 SPL token on
Solana. It proved to be more complicated than anticiapted, due to
problems with Solana code and documentation.  However, with generous
help from Jon Wong of the Solana Foundation and Gage Bachik, I was
able to wade through these issues and produce a functioning pipeline.

## Setup

To follow along, you will need to have a current version of [Rust](https://www.rust-lang.org/tools/install)
installed, and to install the Solana dev tools. I installed Rust by means of rustup: 

	https://www.rust-lang.org/tools/install

I installed the solana dev tools as follows:

	sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"
	
I cloned the SPL repo as follows:

	git clonw git@github.com:solana-labs/solana-program-library.git
	
## Plan

The original plan was to create two new tokens, the ERC-20 "Polygon
House of Rugs" *$PHOR* token and the `token-2022` SPL "House of Rugs"
*$HOR* token, and then set up a conversion path that would involve
using the [Wormhole](https://portalbridge.com/) bridge as an
intermediate state.

The idea is that the user would bridge the *$PHOR* token to Solana, and
then interact with a dapp that would call the functionality of the SPL
`token-upgrade` program to convert the Wormhole wrapped *$PHOR* to
native *$HOR*.

As it turned out, I was forced to create a second target-conversion
token, "House of Rugs and Son" *$HOR2*. This is because the bridged
*$PHOR* token ended up with eight decimals of precision 🤦‍♂️ whereas
the standard for SPL tokens is nine, and the `token-upgrade` program
will only convert between tokens of the same precision
	
## *$PHOR* &mdash; Polygon House of Rugs
I started by creating the "Polygon House of Rugs" ERC-20 token on Polygon.

The Polygon House of Rugs token was created using an exact copy of the
**$XNET** contract, but with different metadata. It was deployed to the
Polygon blockchain at 0xD900a24B97b192138EFb950bCE410d33b805667B

## Polygon House of Rugs (Wormhole) on Solana
I used the wormhole bridge to bridge **$PHOR** to Solana, resulting in the
creation of a the Solana SPL token **Polygon House of Rugs
(Wormhole)** at address 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx 

## *$HOR* House of Rugs

To create the `token-2022` SPL $HOR token, I followed the tutorial
found here:
https://solana.com/developers/guides/getstarted/how-to-create-a-token

*NOTE*: This tutorial is for a token-2022 token, not a Tokenkeg
(original SPL token program) token.  Thus, the token was created with
the metadata extension, and not metaplex. 

I made a keypair with solana-keygen:

	solana-keygen grind --starts-with nic:1

The results was nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf.json
&mdash; a standard Solana keypair file.

I made the token with:

	spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
	--enable-metadata nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf.json

The token was created as a `token-2022` token with the metadata
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
	
### Notes on $HOR

This process worked as expected, and resulted in a functional token
with nine digits of precision.  However, the token wasn't compatible
for conversion from the bridged *$PHOR* token using the SPL
`token-upgrade` program because the bridged *$PHOR* token had only
eight decimals of precision, for some reason.  Thus, it was necessary
to create *$HOR2* &mdash; see below.

## **HOR2** &mdash; House of Rugs and Son

Once again, I made a keypair with solana-keygen:

	solana-keygen grind --starts-with hor:1
	
I then made the new `token-2022` token, with metadata and 8 decimals:
	spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
	--enable-metadata hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X.json --decimals 8 

Result &mdash; a new token: 
	hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X

I configured the metadata as follows: 
	spl-token initialize-metadata hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X  'House of Rugs and Son' 'HOR2' \
	'https://raw.githubusercontent.com/rdevaul/solhack/main/hor2-token/metadata.json' 
	
## Token Upgrade Program
I installed the token upgrade program CLI by means of the rust crate,
as documented here: https://spl.solana.com/token-upgrade

	cargo install spl-token-upgrade-cli
	
I then configured the token upgrade program to convert from the
**Polygon House of Rugs (Wormhole)** token to the **$HOR** as
follows:

	spl-token-upgrade create-escrow 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf

This resulted in the following:

	Creating escrow account ARKhhao3rJm3uHZ5krtnjsLQRBTiKmE86rvzikooub24 owned by escrow authority 2dqH4tuY7aFG1BPuY5p3WPixbE7LSJt4kRZgZqEszbNh 
	Signature: 5FTW7p8NzDcuyzwKuPefCr5VtznwXPoSkbyZF7AoCPXYJr9gPyvXEUzANiqLaa1K98kP291wdbKztyDiJJuXSxZA

I then minted 100,000 **$HOR** to the escrow authority, as so:

	spl-token mint nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 100000 ARKhhao3rJm3uHZ5krtnjsLQRBTiKmE86rvzikooub24

I then tried to do the token exchange:
		spl-token-upgrade exchange 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf

Unfortunately, performing the token exchange didn't work - the error I got was: 

	Burning tokens from account 2qCeEX17Ho9MLtZv7ps1aBeUvQYtXGv8jaV9RX1kQ3jS, receiving tokens into account 88UkgA9epNEKhEbjK3Xo3hCB3o14QkW1QCMFuBjq7RZS
	error: send transaction: error: send transaction: RPC response error -32002: Transaction simulation failed: Attempt to load a program that does not exist 
### Fixes to Broken Solana Foundation Code

So, after much wailing and gnashing of teeth, I fixed this. Here is the saga:

I confirmed that the cargo-installed `spl-token-upgrade-cli` program
references an undeployed Solana program.  Well, crap.

No problem, I thought.  I'll just build from source, deploy my own
version of the `token-upgrade` program (see below), and then when I
build the CLI from source it will reference the correct thing.

Yeah.

I did that, and the result was a program that panics due to some
horrible Rust type conversion fiasco, presumably due to changes in the
underlying Solana libraries.  And after reaching out to the original
maintainers and geting a reference to a pull request that, after
application, didn't fix the problem, I did something even more
horible: I hacked the CLI to hard-code the addresses for the
`create-escrow` function.  The result, when I run it, is:

	original_mint: 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx
	new_mint: nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	Creating escrow account Co8SWR5qUDAVZzM9r4BBZ6eooeRRKAnVUXPh9voFLysr owned by escrow authority D3Ft42xKmrHTBpvvFcUkQ5GJQBL9tnmiqEkWWe8MHV6m
	Signature: 42wTPyppPuahdxp77CfXBNqYpQBRWczcWuTWuCvvdd7LFLAFkffd5UEV8yKwAX1PuuVBzY4DUtRBRXr9DzRewtNK

Yay! success. Now I'm going to mint a bunch of conversion tokens to this new escrow authority, as so: 

	spl-token mint nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 100000 Co8SWR5qUDAVZzM9r4BBZ6eooeRRKAnVUXPh9voFLysr

And now to convert tokens!

	../target/debug/spl-token-upgrade exchange 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	
The result is an error, but becuse there is a mismatch in the decimals of the old (wormhole) vs new (Solana native) token:

	original_mint: 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx
	new_mint: nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	Burning tokens from account 2qCeEX17Ho9MLtZv7ps1aBeUvQYtXGv8jaV9RX1kQ3jS, receiving tokens into account 88UkgA9epNEKhEbjK3Xo3hCB3o14QkW1QCMFuBjq7RZS
	error: send transaction: error: send transaction: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1; 4 log messages:
	  Program HFZYzdJjbJnFxCWFFn6DYXV1YvQmoJF2hEjXz8McR2eH invoke [1]
	  Program log: Original and new token mint decimals mismatch: original has 8 decimals, and new has 9
	  Program HFZYzdJjbJnFxCWFFn6DYXV1YvQmoJF2hEjXz8McR2eH consumed 12151 of 200000 compute
	  Program HFZYzdJjbJnFxCWFFn6DYXV1YvQmoJF2hEjXz8McR2eH failed: custom program error: 0x1 

So, I built a new token with only 8 decimals, the $HOR2
*hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X* token (see below),
edited the hard-coded address in `token-upgrade`, and createda new
escrow authority:

	../target/debug/spl-token-upgrade create-escrow  5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X 
	
Result:

	original_mint: 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx
	new_mint: hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X
	Creating escrow account EZzargHA27aHuMMqyGV1MULJ3h8zFEP2bbKAKZmXwTww owned by escrow authority EkBik1Tsw7j3a5vubyZ7g2pHRWDh4vXrUj76JVbJ1sn1
	Signature: xSLw2Afrsq2xAWcEQdC2bJ5HZykqLGfaK3jkHGoeMvga2vXUob8ZpweJT9XnbdtuSdVFM26AeEB5cx3MVMFkaQU

I then minted 100,000 $HOR2 to the escrow authority

	spl-token mint hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X 100000 EZzargHA27aHuMMqyGV1MULJ3h8zFEP2bbKAKZmXwTww
	
I then attempted the conversion... would it work?

	../target/debug/spl-token-upgrade exchange 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx  hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X
	
Results &mdash; *YES!* 🎉

	original_mint: 5bPiJLZ9sy4x7hEd5VsarMhCZzcnC1k4xY7CieGBr1Xx
	new_mint: hor9dsfaPnMHMKAtKbWYDzojBmXiDd3KYEHYycWY21X
	Burning tokens from account AGHu4aiGkzKi5no3AsXjBVhy6hNGfLJZoxcdQGRKxyWu, receiving tokens into account DvsaVN8ox4xQUt1JCGmprJVkaAAYPvckF9G1SPr8XbNw
	Signature: 4gcUijNPv6SzwQetq2mBDMTvDfavBBGx2tqewq8Rj8e9kAjXbaNduMEwdVCHnX42vjrRvVnUYd7nJaAjZKYjCsWv
	
## upgrade-ui

I was generously given access to a non-public repo with a prototype
token-conversion UI by Jon Wong of the Solana Foundation. 🙏🙏🙏 With
some work, I was able to customize this for our purposes.  The current
production version for the test tokens is deployed here:
https://token-upgrade-ui-app-blond.vercel.app/
	
## build & deploy token-upgrade program
Unlike the token programs, there is not token-upgrae program deployed
by default.  I cloned the solana-programs repo and built the token
upgrade program as so:

	git clone https://github.com/solana-labs/solana-program-library.git
	cd solana-program-library/token-upgrade
	cargo build-bpf --manifest-path=Cargo.toml
	
I then deployed the program to the solana main-net.  This was a
painful process, because the publicly available RPC endpoint just
doesn't work for this kind of data-intensive task.  I finally ended up
signing up for a commercial service — Syndica — which charges us
$199/month for the privilage of high-bandwidth, low-latancy
interactions with the Solana main net at > 100 tps.

	solana config set -u "https://solana-mainnet.api.syndica.io/api-key/<secret-api-key>"
	solana program deploy target/deploy/spl_token_upgrade.so --max-sign-attempts 1000
	
This was fairly expensive, costing over 0.5 $SOL to accomplish

The end result is a deployed program at: *HFZYzdJjbJnFxCWFFn6DYXV1YvQmoJF2hEjXz8McR2eH*

### New Tokenkeg Token

To debug this situation, I created a new old-school Tokenkeg token
(with no metadata) as follows:

	spl-token create-token
	
result:

	Creating token GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
	Address:  GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK
	Decimals:  9
	Signature: 5D3SxkCNNYnhqG7DNUm2Zg2KWCKnnQyPm8ajtRuefc9mXj4wQycnNBggYpXiLinTmRZf3tiruRwyawbYSHFijoFA

I then created a token account for it and minted some tokens:

	spl-token create-account GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK
	<reate-account GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK
	Creating account 9vbMuBmFut3YLpmZLvXttnYvHWdkWtsp5X2TkueSNP2R

	spl-token mint GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK 100000

I then created a new token-upgrade escrow account to conver the new token into the $HOR token

	spl-token-upgrade create-escrow GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	<wuh8HD31v3yfaknjAgC2CqKK nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	Creating escrow account 8GANteYo3UZfxzLmyHX1XDEUA2pRSTTSfKR6W1yuqQBm owned by escrow authority CV9jWikrx574ErtuREYaWFvbXDxTTxcFrBx7pTTC1RFz
	Signature: 3KZtVFehoXy8r4ScuFBaRkLxw3wii7AbwUguGj5WHwrXCxtVm4GESp4XpqP5995t1ss8RpZu4wgov29YWZQXbWDj

I minted 100000 $HOR to the escrow account

	spl-token mint nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf 100000 8GANteYo3UZfxzLmyHX1XDEUA2pRSTTSfKR6W1yuqQBm
	<YGAnwf 100000 8GANteYo3UZfxzLmyHX1XDEUA2pRSTTSfKR6W1yuqQBm
Minting 100000 tokens
	Token: nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf
	Recipient: 8GANteYo3UZfxzLmyHX1XDEUA2pRSTTSfKR6W1yuqQBm

I then ran the token exchange:

	spl-token-upgrade exchange GkmhtfyV8nzGjTJpHmdiwuh8HD31v3yfaknjAgC2CqKK nicyFsRJAWS42LpiaYGNv9rbSGi38UcZoXEA6YGAnwf

4yN7H8T3XFc1AGGYEJ4SgWm2zSDdq7w71dHHSRPBzveMgGT342yuhRYbNhijZn1RWuXyqUT56jNd3A685ot2tbXH

## Rug Merchants
*NOTE: This documentation is deprecated, as it turns out that we need
to create $X as a token-2022 program token in order to be compatible
with the Solana token upgrade program*

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



