use std::env;
#[macro_use] extern crate rocket;
extern crate web3;

// use rocket::serde::{json::Json};
use rocket::data::{Data, ToByteUnit};
use serde_json::Value;

use std::str::FromStr;

use web3::types::{BlockNumber, U64, Address};

use hex_literal::hex;

use tokio::time::Duration;

use serenity::model::channel::Embed;

mod github_data;
mod discord;
mod config;
mod ethereum;

use crate::ethereum::parse_log_entry;

#[post("/", format = "application/json", data = "<data>")]
async fn github_webhook_recv(data: Data<'_>) -> Option<&str>  {
    let string = data.open(128.kibibytes()).into_string().await.ok()?;
    let config = envy::from_env::<config::Config>().expect("DISCORD_WEBHOOK, DISCORD_TOKEN and ETHEREUM_NODE must be supplied");

    let v: Value = serde_json::from_str(&*string.value).ok()?;

    if v.get("zen") != None {
        println!("It's a ping!");
        println!("{}", v["zen"]);
    } else if v.get("pusher") != None {
        println!("It's a push");
        println!("from {} to {}", v["before"], v["after"]);
        println!("{}", v["pusher"]["name"]);
    } else if v.get("pull_request") != None {
        println!("It's a pull-request...");
        if v["action"] == "opened" {
            println!("> OPEN, #{}", v["number"]);
            println!("> Review at {}", v["pull_request"]["html_url"]);
            println!("> \"{}\"", v["pull_request"]["title"]);
            println!("> \"{}\"", v["pull_request"]["body"]);
            println!("> By User: {}", v["pull_request"]["user"]["login"]);
            println!("> Downstream @ {}", v["pull_request"]["head"]["repo"]["full_name"]);
            println!("> {}", v["pull_request"]["head"]["repo"]["html_url"]);


            let pull_request_content = format!("New Pull Request #{}", v["number"]);
            let pull_request_title = format!("{}", v["pull_request"]["title"]);
            let pull_request_description = format!("{}", v["pull_request"]["body"]);
            let pull_request_url = v["pull_request"]["html_url"].to_string();
            let trimmed_url = &pull_request_url[1..pull_request_url.len()-1];

            let embed = Embed::fake(|e| e
                .title(pull_request_title)
                .description(pull_request_description)
                .url(&trimmed_url));

            discord::discord_webhook_post(&config, pull_request_content, Some(embed)).await;

        } else {
            println!("dunno how to handle");
        }
    } else {
        println!("It's something else");
    }

    Some("{ \"status\": \"ok\" }")
}

async fn poll_ethereum(config: &config::Config) -> web3::Result<()>{
    let webhook_url = &config.discord_webhook;
    let eth_url = &config.ethereum_node;
    let sleep_time = config.poll_period;

    println!("Polling period set to {}", sleep_time);

    discord::discord_webhook_post(&config, format!("Starting Toluca.\nPolling period set to {}", sleep_time), None).await;

    let address_coderdao = "0x346787C77d6720db91Ce140120457e20Fdd4D02c";

    // look this up in etherscan https://ropsten.etherscan.io/address/0x346787C77d6720db91Ce140120457e20Fdd4D02c#events
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
            .address(vec![Address::from_str(address_coderdao).unwrap()])
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

        for log in logs {
            parse_log_entry(&log);
        }

        block_num = web3.eth().block_number().await?;
        tokio::time::sleep(Duration::from_millis(sleep_time.into())).await;
    }
}

#[launch]
fn rocket() -> _ {
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
        .mount("/", routes![index, github_webhook_recv])
}