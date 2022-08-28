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

fn decode_payload_proposal_created(log: &Log) {
    let buf: &Vec<u8> = &log.data.0;
    // let serialized_data = serde_json::to_string(&log.data.0).unwrap();
    println!("> data: {:x?}", buf);
    let decoded = decode(&[
        ParamType::Uint(256),                               // proposalId
        ParamType::Address,                                 // proposer
        ParamType::Array(Box::new(ParamType::Address)),     // targets
        ParamType::Array(Box::new(ParamType::Uint(256))),   // values
        ParamType::Array(Box::new(ParamType::String)),      // signatures
        ParamType::Bytes,                                   // calldatas
        ParamType::Uint(256),                               // startBlock
        ParamType::Uint(256),                               // endBlock
        ParamType::String                                   // description
        ], &buf);
    let unwrapped = decoded.unwrap();

    println!("decoded] {}, {}, {}", unwrapped[6], unwrapped[7], unwrapped[8]);
}

// fn parse_log_entry(log: &Log) {
//     // println!("TODO: decoding log");
//     // println!("TODO: find contribute intent related to proposal");
//     // println!("TODO: check verification is done");
//     // println!("TODO: check merge is done");
//     // println!("TODO: check payout is already done");
//     // println!("TODO: if not already paid and confirmed, payout!");
//     // println!("TODO: log and save the receipt");
//     // let serialized_log = serde_json::to_string(&log).unwrap();
//     decode_payload_proposal_created(&log);
//     // println!("> log: {}", serialized_log);
// }


async fn poll_and_parse_event(config: &Config,
    web3: &web3::Web3<Http>,
    from_block: U64,
    event_hash: web3::types::H256, f: fn(l: &Log)) -> web3::Result<()>{
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

    for log in logs {
        f(&log);
    }

    Ok(())
}

pub async fn poll_ethereum(config: &Config) -> web3::Result<()>{
    let eth_url = &config.ethereum_node;
    let sleep_time = config.poll_period;

    println!("Polling period set to {}", sleep_time);

    discord_webhook_post(&config, format!("Starting Toluca.\nPolling period set to {}", sleep_time), None).await;

    let transport = web3::transports::Http::new(&eth_url)?;
    let web3 = web3::Web3::new(transport);

    let mut block_num = web3.eth().block_number().await?;
    println!("Listening from block #{}", block_num);

    loop {
        // ProposalCreated : look this up in etherscan https://ropsten.etherscan.io/address/0x346787C77d6720db91Ce140120457e20Fdd4D02c#events
        // alternatively: Run it on https://emn178.github.io/online-tools/keccak_256.html
        // in this case: ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)
        poll_and_parse_event(&config, &web3, U64::from(0), hex!("7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0").into(), decode_payload_proposal_created).await;
        block_num = web3.eth().block_number().await?;
        tokio::time::sleep(Duration::from_millis(sleep_time.into())).await;
    }
}