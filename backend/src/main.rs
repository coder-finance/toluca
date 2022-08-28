#[macro_use] extern crate rocket;
extern crate web3;

use std::str::FromStr;

use web3::types::{BlockNumber, U64, Address};

use hex_literal::hex;

use tokio::time::Duration;

#[cfg(debug_assertions)]
extern crate dotenv;
#[cfg(debug_assertions)]
use dotenv::dotenv;

mod github_data;
mod discord;
mod config;
mod ethereum;
mod routes;

use crate::ethereum::parse_log_entry;

async fn poll_ethereum(config: &config::Config) -> web3::Result<()>{
    let eth_url = &config.ethereum_node;
    let sleep_time = config.poll_period;
    let address_dao = &config.address_dao;

    println!("Polling period set to {}", sleep_time);

    discord::discord_webhook_post(&config, format!("Starting Toluca.\nPolling period set to {}", sleep_time), None).await;

    // ProposalCreated : look this up in etherscan https://ropsten.etherscan.io/address/0x346787C77d6720db91Ce140120457e20Fdd4D02c#events
    // alternatively: Run it on https://emn178.github.io/online-tools/keccak_256.html
    // in this case: ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)
    let event_hash = hex!("7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0").into(); 

    let transport = web3::transports::Http::new(&eth_url)?;
    let web3 = web3::Web3::new(transport);

    let mut block_num = web3.eth().block_number().await?;
    println!("Listening from block #{}", block_num);

    loop {
        println!("Querying starting from block #{}", block_num);

        let filter = web3::types::FilterBuilder::default()
            .from_block(BlockNumber::Number(U64::from(0)))
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
        let query_deets = format!("Querying starting from block #{}\nNew logs retrieved: {}", block_num, &*logs.len().to_string());
        discord::discord_webhook_post(&config, query_deets, None).await;

        for log in logs {
            parse_log_entry(&log);
        }

        block_num = web3.eth().block_number().await?;
        tokio::time::sleep(Duration::from_millis(sleep_time.into())).await;
    }
}

#[launch]
fn rocket() -> _ {
    #[cfg(debug_assertions)]
    dotenv().ok();

    let config = envy::from_env::<config::Config>().expect("DISCORD_WEBHOOK, DISCORD_TOKEN and ETHEREUM_NODE must be supplied");
    println!("{:#?}", config);
    // tokio::spawn(async move {
    //     discord_bot(config).await;
    // });

    tokio::spawn(async move {
        if let Err(why) = poll_ethereum(&config).await {
            println!("Error polling Ethereum: {:?}", why);
        }
    });

    rocket::build()
        .mount("/", routes![routes::github_webhook_recv])
}