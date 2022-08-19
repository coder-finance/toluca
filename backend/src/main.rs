use std::env;
#[macro_use] extern crate rocket;
extern crate web3;

// use rocket::serde::{json::Json};
use rocket::data::{Data, ToByteUnit};

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

// async fn discord_bot() {
//     // Configure the client with your Discord bot token in the environment.
//     let token = env::var("DISCORD_TOKEN").expect("Expected DISCORD_TOKEN in the environment");
//     // Set gateway intents, which decides what events the bot will be notified about
//     let intents = GatewayIntents::GUILD_MESSAGES
//         | GatewayIntents::DIRECT_MESSAGES
//         | GatewayIntents::MESSAGE_CONTENT;

//     // Create a new instance of the Client, logging in as a bot. This will
//     // automatically prepend your bot token with "Bot ", which is a requirement
//     // by Discord for bot users.
//     let mut client =
//         Client::builder(&token, intents).event_handler(Handler).await.expect("Err creating client");

//     // Finally, start a single shard, and start listening to events.
//     //
//     // Shards will automatically attempt to reconnect, and will perform
//     // exponential backoff until it reconnects.
//     if let Err(why) = client.start().await {
//         println!("Discord bot error: {:?}", why);
//     }
// }

#[get("/?<code>")]
async fn index(code: &str) -> std::string::String  {
    println!("code: {}", code);
    // You don't need a token when you are only dealing with webhooks.
    let http = Http::new("");
    let webhook_url = env::var("DISCORD_WEBHOOK").expect("Expected DISCORD_WEBHOOK in the environment");
    let webhook = Webhook::from_url(&http, &webhook_url).await.expect("Bad webhook");

    webhook
        .execute(&http, false, |w| w.content(["received code and sent to discord: ", code].join("")).username("coder-reporter"))
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

async fn poll_ethereum() -> web3::Result<()>{
    let webhook_url = env::var("DISCORD_WEBHOOK").expect("Expected DISCORD_WEBHOOK in the environment");
    let eth_url = env::var("ETHEREUM_NODE").expect("Expected ETHEREUM_NODE in the environment");
    let poll_period = env::var("POLL_PERIOD").unwrap_or(3600000.to_string());
    let sleep_time = poll_period.parse::<u64>().expect("Sleep time not a u64");

    println!("Polling period set to {}", poll_period);

    let address_coderdao = "0x346787C77d6720db91Ce140120457e20Fdd4D02c";

    // look this up in etherscan https://ropsten.etherscan.io/address/0x346787C77d6720db91Ce140120457e20Fdd4D02c#events
    let event_hash = hex!("7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0").into(); 

    let transport = web3::transports::Http::new(&eth_url)?;
    let web3 = web3::Web3::new(transport);

    loop {
        let filter = web3::types::FilterBuilder::default()
            .from_block(BlockNumber::Number(U64::from(0)))
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

        // You don't need a token when you are only dealing with webhooks.
        let http = Http::new("");
        let webhook = Webhook::from_url(&http, &webhook_url).await.expect("Bad webhook");

        webhook
            .execute(&http, false, |w| w.content(["new logs retrieved: ", &*logs.len().to_string()].join("")).username("coder-reporter"))
            .await
            .expect("Could not execute webhook.");

        for log in logs {
            let serialized_log = serde_json::to_string(&log).unwrap();
            println!("> log: {}", serialized_log);
        }

        tokio::time::sleep(Duration::from_millis(sleep_time)).await;
    }
}

#[launch]
fn rocket() -> _ {
    // Configure the client with your Discord bot token in the environment.
    env::var("DISCORD_TOKEN").expect("Expected DISCORD_TOKEN in the environment");
    env::var("DISCORD_WEBHOOK").expect("Expected DISCORD_WEBHOOK in the environment");
    env::var("ETHEREUM_NODE").expect("Expected ETHEREUM_NODE in the environment");

    // tokio::spawn(async move {
    //     discord_bot().await;
    // });

    tokio::spawn(async move {
        if let Err(why) = poll_ethereum().await {
            println!("Error polling Ethereum: {:?}", why);
        }
    });

    rocket::build()
        .mount("/", routes![index, github_webhook_recv])
}