const { Metaplex, keypairIdentity, irysStorage } = require("@metaplex-foundation/js");
const { Connection, clusterApiUrl, Keypair } = require("@solana/web3.js");
const fs = require("fs");

async function createMetadata() {
  // Configure the connection to the Solana cluster
  const connection = new Connection(clusterApiUrl("mainnet-beta")); // Use "mainnet-beta" for mainnet

  // Load your keypair
  const keypairFile = fs.readFileSync("/Users/rich/.config/solana/id.json");
  const keypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));

  // Create a Metaplex instance
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
	.use(irysStorage());

  // Your token details
  const tokenMint = "rugfKQvjAGcwE37YcGKboh9ePim6Hc83EK1Y1wBzaPY";
  const tokenName = "Rug Merchants";
  const symbol = "RUGME";
  const description = "RUGME — Rug Merchants on Solana";
  const uri = "https://raw.githubusercontent.com/rdevaul/solhack/main/rugme-token/metadata.json";

  try {
    const { nft } = await metaplex.nfts().create({
      uri: uri,
      name: tokenName,
      sellerFeeBasisPoints: 0,
      symbol: symbol,
      creators: null,
      isMutable: true,
      maxSupply: null,
      uses: null,
      isCollection: false,
      collection: null,
      updateAuthority: keypair,
      mint: tokenMint,
    });

    console.log("Metadata created successfully!");
    console.log("Metadata address:", nft.metadataAddress.toString());
  } catch (error) {
    console.error("Error creating metadata:", error);
  }
}

createMetadata();
