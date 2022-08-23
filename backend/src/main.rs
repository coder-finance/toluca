use std::env;
#[macro_use] extern crate rocket;
extern crate web3;

// use rocket::serde::{json::Json};
use rocket::data::{Data, ToByteUnit};
use rocket::serde::Deserialize;
use serde_json::Value;

mod github_data;

use std::str::FromStr;

use web3::types::{BlockNumber, U64, Address};

use hex_literal::hex;

use serenity::async_trait;
use serenity::model::channel::Message;
use serenity::model::gateway::Ready;
use serenity::prelude::*;
use serenity::http::Http;
use serenity::model::webhook::Webhook;
use serenity::model::channel::Embed;

use tokio::time::Duration;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    // Set a handler for the `message` event - so that whenever a new message
    // is received - the closure (or function) passed will be called.
    //
    // Event handlers are dispatched through a threadpool, and so multiple
    // events can be dispatched simultaneously.
    async fn message(&self, ctx: Context, msg: Message) {
        if msg.content == "!ping" {
            // Sending a message can fail, due to a network error, an
            // authentication error, or lack of permissions to post in the
            // channel, so log to stdout when some error happens, with a
            // description of it.
            if let Err(why) = msg.channel_id.say(&ctx.http, "Pong!").await {
                println!("Error sending message: {:?}", why);
            }
        }
    }

    // Set a handler to be called on the `ready` event. This is called when a
    // shard is booted, and a READY payload is sent by Discord. This payload
    // contains data like the current user's guild Ids, current user data,
    // private channels, and more.
    //
    // In this case, just print what the current user's username is.
    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

async fn discord_bot(config: Config) {
    // Configure the client with your Discord bot token in the environment.
    let token = config.discord_token;
    // Set gateway intents, which decides what events the bot will be notified about
    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT;

    // Create a new instance of the Client, logging in as a bot. This will
    // automatically prepend your bot token with "Bot ", which is a requirement
    // by Discord for bot users.
    let mut client =
        Client::builder(&token, intents).event_handler(Handler).await.expect("Err creating client");

    // Finally, start a single shard, and start listening to events.
    //
    // Shards will automatically attempt to reconnect, and will perform
    // exponential backoff until it reconnects.
    if let Err(why) = client.start().await {
        println!("Discord bot error: {:?}", why);
    }
}

/// provides default value for zoom if ZOOM env var is not set
fn default_poll_period() -> u32 {
    3600000
}
  
#[derive(Deserialize, Debug)]
struct Config {
    #[serde(default="default_poll_period")]
    poll_period: u32,
    discord_webhook: String,
    discord_token: String,
    ethereum_node: String
}

#[get("/?<code>")]
async fn index(code: &str) -> std::string::String  {
    println!("code: {}", code);
    // You don't need a token when you are only dealing with webhooks.
    let http = Http::new("");
    let webhook_url = env::var("DISCORD_WEBHOOK").expect("Expected DISCORD_WEBHOOK in the environment");
    let webhook = Webhook::from_url(&http, &webhook_url).await.expect("Bad webhook");

    webhook
        .execute(&http, false, |w| w.content(["received code and sent to discord: ", code].join("")).username("toluca"))
        .await
        .expect("Could not execute webhook.");

    ["received code and sent to discord: ", code].join("")
}

#[post("/", format = "application/json", data = "<data>")]
async fn github_webhook_recv(data: Data<'_>) -> Option<&str>  {
    let string = data.open(128.kibibytes()).into_string().await.ok()?;

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

            let http = Http::new("");
            let webhook_url = env::var("DISCORD_WEBHOOK").expect("Expected DISCORD_WEBHOOK in the environment");
            let webhook = Webhook::from_url(&http, &webhook_url).await.expect("Bad webhook");

            let embed = Embed::fake(|e| e
                .title(pull_request_title)
                .description(pull_request_description)
                .url(&trimmed_url));

            webhook
                .execute(&http, false, |w| w.content(pull_request_content).embeds(vec![embed]).username("github"))
                .await
                .expect("Could not execute webhook.");
        } else {
            println!("dunno how to handle");
        }
    } else {
        println!("It's something else");
    }

    Some("{ \"status\": \"ok\" }")
}

async fn poll_ethereum(config: Config) -> web3::Result<()>{
    let webhook_url = config.discord_webhook;
    let eth_url = config.ethereum_node;
    let sleep_time = config.poll_period;

    println!("Polling period set to {}", sleep_time);

    let http = Http::new("");
    let webhook = Webhook::from_url(&http, &webhook_url).await.expect("Bad webhook");

    webhook
        .execute(&http, false, |w| w.content(format!("Starting Toluca.\nPolling period set to {}", sleep_time)).username("toluca"))
        .await
        .expect("Could not execute webhook.");

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
            // .from_block(BlockNumber::Number(U64::from(0)))
            .from_block(BlockNumber::Number(block_num))
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

        println!("got logs: {}", logs.len());
        let query_deets = format!("Querying starting from block #{}\nNew logs retrieved: {}", block_num, &*logs.len().to_string());

        // You don't need a token when you are only dealing with webhooks.
        let http = Http::new("");
        let webhook = Webhook::from_url(&http, &webhook_url).await.expect("Bad webhook");

        webhook
            .execute(&http, false, |w| w.content(&query_deets).username("toluca"))
            .await
            .expect("Could not execute webhook.");

        for log in logs {
            let serialized_log = serde_json::to_string(&log).unwrap();
            println!("> log: {}", serialized_log);
        }

        block_num = web3.eth().block_number().await?;
        tokio::time::sleep(Duration::from_millis(sleep_time.into())).await;
    }
}

#[launch]
fn rocket() -> _ {
    let config = envy::from_env::<Config>().expect("DISCORD_WEBHOOK, DISCORD_TOKEN and ETHEREUM_NODE must be supplied");
    println!("{:#?}", config);
    // tokio::spawn(async move {
    //     discord_bot(config).await;
    // });

    tokio::spawn(async move {
        if let Err(why) = poll_ethereum(config).await {
            println!("Error polling Ethereum: {:?}", why);
        }
    });

    rocket::build()
        .mount("/", routes![index, github_webhook_recv])
}