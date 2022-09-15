use std::str::FromStr;
use hex_literal::hex;
use tokio::time::Duration;
use web3::types::{BlockNumber, U64, Address, Log};
use web3::transports::http::Http;
use ethabi::{
    decode, ParamType,
};

use crate::config::Config;
use crate::discord::discord_webhook_post;
use crate::ipfs::lookup_proposal_on_ipfs;

use std::fs;
use crate::github_app::ClientPool;
use nom_pem;
use hubcaps::JWTCredentials;
use hubcaps::comments::CommentOptions;

async fn decode_payload_proposal_created(config: &Config, logs: &Vec<Log>, pool: &ClientPool) {
    println!("> ProposalCreated processing... {} entries", logs.len());

    let mut cids = vec![];

    for log in logs {
        let buf: &Vec<u8> = &log.data.0;
        let decoded = decode(&[
            ParamType::Uint(256),                               // proposalId
            ParamType::Address,                                 // proposer
            ParamType::Array(Box::new(ParamType::Address)),     // targets
            ParamType::Array(Box::new(ParamType::Uint(256))),   // values
            ParamType::Array(Box::new(ParamType::String)),      // signatures
            ParamType::Bytes,                                   // calldatas
            ParamType::Uint(256),                               // startBlock
            ParamType::Uint(256),                               // endBlock
            ParamType::String,                                  // description
            ParamType::String                                   // ipfsCid
            ], &buf);
        let unwrapped = decoded.unwrap();

        println!("decoded] {:?}, {:?}, {}, {}", unwrapped[6], unwrapped[7], unwrapped[8], unwrapped[9]);
        cids.push(unwrapped[9].to_string());

        // TODO: Write to README.md? Or make a new file e.g. Log.md? TBD
        //       Or put it in the github wiki
        // This is for demo purposes atm
        if let Ok(proposal) = lookup_proposal_on_ipfs(&config,
            &unwrapped[9].to_string())
            .await {
            println!("[CREATED] successful decode: {}", unwrapped[9]);

            let github = pool.get(proposal.github_app_installation_id.parse::<u64>().unwrap());
            let repo_owner_name = "coder-finance";
            let repo_name = "demo-dao";

            // TODO: make this pull request track from the proposal
            // we need something on chain/ipfs to remember this pull request
            let pull_request_num = 9;
        
            let result = github
                .repo(repo_owner_name, repo_name)
                .pulls()
                .get(pull_request_num)
                .comments()
                .create(&CommentOptions { body: 
                    format!("### Proposal 0x{} Created\n Initiator: {}\nOn Block {}\nView on [Etherscan](https://ropsten.etherscan.io/tx/{:#x})", 
                        unwrapped[0], proposal.title, proposal.initiator, log.block_number.unwrap(), log.transaction_hash.unwrap()
                    ).to_string() } )
                .await
                .unwrap();
        } else {
            println!("[CREATED] failed to decode: {}", unwrapped[9]);
        }
    }
}

async fn decode_payload_proposal_voted_on(config: &Config, logs: &Vec<Log>, pool: &ClientPool) {
    for log in logs {
        let buf: &Vec<u8> = &log.data.0;

        let decoded = decode(&[
            ParamType::Address,                                 // voter
            ParamType::Uint(256),                               // proposalId
            ParamType::Uint(8),                                 // support
            ParamType::Uint(256),                               // weight
            ParamType::String                                   // reason
            ], &buf);
        let unwrapped = decoded.unwrap();

        println!("decoded] 0x{}, {}, {}, {}, {}", unwrapped[0], unwrapped[1], unwrapped[2], unwrapped[3], unwrapped[4]);
    }
}

async fn decode_payload_proposal_executed(config: &Config, logs: &Vec<Log>, pool: &ClientPool) {
    for log in logs {
        let buf: &Vec<u8> = &log.data.0;
    
        let decoded = decode(&[
            ParamType::Uint(256),                               // proposalId
            ParamType::String                                   // ipfsCid
            ], &buf);
        let unwrapped = decoded.unwrap();

        println!("[ProposalExecuted] 0x{}, ipfs: {}", unwrapped[0], unwrapped[1]);

        // TODO: bulk lookup or something
        if let Ok(payload) = lookup_proposal_on_ipfs(&config,
            &unwrapped[9].to_string())
            .await {
            println!("[EXECUTED] successful decode: {}", unwrapped[9]);
        } else {
            println!("[EXECUTED] failed to decode: {}", unwrapped[9]);
        }
        // TODO: Look up the commit on github
        // TODO: add comment on the pull request
    }
}

async fn decode_payload_proposal_verified(config: &Config, logs: &Vec<Log>, pool: &ClientPool) {
    for log in logs {
        let buf: &Vec<u8> = &log.data.0;

        let decoded = decode(&[
            ParamType::Uint(256),                               // proposalId
            ParamType::String                                   // ipfsCid
            ], &buf);
    
        let unwrapped = decoded.unwrap();
    
        // TODO: make these flexible
        // ideally, github_app should log this into blockchain/ipfs, and we can just look it up
        let installation_id = 29084972;
        let github = pool.get(installation_id);
        let repo_owner_name = "coder-finance";
        let repo_name = "demo-dao";

        // TODO: make this pull request track from the proposal
        // we need something on chain/ipfs to remember this pull request
        let pull_request_num = 9;
    
        let result = github
            .repo(repo_owner_name, repo_name)
            .pulls()
            .get(pull_request_num)
            .comments()
            .create(&CommentOptions { body: 
                format!("### Proposal 0x{}\n Verified by noob\nOn Block {}\nView on [Etherscan](https://ropsten.etherscan.io/tx/{:#x})", 
                    unwrapped[0], log.block_number.unwrap(), log.transaction_hash.unwrap()
                ).to_string() } )
            .await
            .unwrap();
    
        println!("[ProposalVerified] 0x{}, ipfs: {}: Written '{}', result: {}", unwrapped[0], unwrapped[1], result.body, result.id);
    }
}

async fn decode_payload_proposal_merged(config: &Config, logs: &Vec<Log>, pool: &ClientPool) {
    for log in logs {
        let buf: &Vec<u8> = &log.data.0;
    
        let decoded = decode(&[
            ParamType::Uint(256),                               // proposalId
            ParamType::String                                   // ipfsCid
            ], &buf);
        let unwrapped = decoded.unwrap();
    
        println!("[ProposalMerged] 0x{}", unwrapped[0]);
        // TODO: payout what is promised
    }
}

async fn poll_for_event(config: &Config,
    web3: &web3::Web3<Http>,
    from_block: U64,
    event_hash: web3::types::H256
) -> web3::Result<Vec<Log>> {
    let address_dao = &config.address_dao;

    println!("Querying starting from block #{}", from_block);

    let filter = web3::types::FilterBuilder::default()
        .from_block(BlockNumber::Number(from_block))
        // .from_block(BlockNumber::Number(block_num))
        .address(vec![Address::from_str(address_dao).unwrap()])
        .topics(
            Some(vec![
                event_hash]),
            None,
            None,
            None,
        )
        .build();

    let filter = web3.eth_filter().create_logs_filter(filter).await?;
    let logs = filter.logs().await?;
    let query_deets = format!("Querying starting from block #{}\nNew logs retrieved: {}", from_block, &*logs.len().to_string());

    discord_webhook_post(&config, query_deets, None).await;

    Ok(logs)
}

pub async fn poll_ethereum(config: &Config) -> web3::Result<()>{
    let app_id = config.app_id;
    let api = &config.api_path;
    let eth_url = &config.ethereum_node;
    let sleep_time = config.poll_period;
    let priv_key_path = &config.app_private_key_path;

    println!("Polling period set to {}", sleep_time);

    discord_webhook_post(&config, format!("Starting Toluca.\nPolling period set to {}", sleep_time), None).await;

    let transport = web3::transports::Http::new(&eth_url)?;
    let web3 = web3::Web3::new(transport);

    let mut block_num = web3.eth().block_number().await?;
    println!("Listening from block #{}", block_num);

    // Read the PEM file.
    let key = fs::read(priv_key_path)?;
    let key = nom_pem::decode_block(&key).unwrap();
    let pool = ClientPool::new(
        api.to_string(),
        JWTCredentials::new(app_id, key.data).unwrap(),
    );

    loop {
        // ProposalCreated : look this up in etherscan https://ropsten.etherscan.io/address/0x346787C77d6720db91Ce140120457e20Fdd4D02c#events
        // alternatively: Run it on https://emn178.github.io/online-tools/keccak_256.html

        // ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)
        let created_logs = poll_for_event(&config, &web3, U64::from(0), hex!("b88787ccad609a4d41058c8a0928927dd2516296c139d218d1e9131c2c219bd3").into()).await?;
        decode_payload_proposal_created(&config, &created_logs, &pool).await;

        // let executed_logs = poll_for_event(&config, &web3, U64::from(0), hex!("712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f").into()).await?;
        // decode_payload_proposal_executed(&executed_logs, &pool).await;

        // Verified(uint256)
        // let verified_logs = poll_for_event(&config, &web3, U64::from(0), hex!("051394e5cf50e28f5ee446d54e6b713eb0cb38f53eebc74eb30c2478c343c4ce").into()).await?;
        // decode_payload_proposal_verified(&verified_logs, &pool).await;

        // ProposalState.Merged
        // let merged_logs = poll_for_event(&config, &web3, U64::from(0), hex!("711d5badedd96e81114c760c45969ad31fe3890c2328b885704576b297466354").into()).await?;
        // decode_payload_proposal_merged(&merged_logs, &pool).await;

        // NOT WORKING: poll_and_parse_event(&config, &web3, U64::from(0), hex!("b8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4").into(), decode_payload_proposal_voted_on).await;
        block_num = web3.eth().block_number().await?;
        tokio::time::sleep(Duration::from_millis(sleep_time.into())).await;
    }
}