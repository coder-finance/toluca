#[macro_use] extern crate rocket;
extern crate web3;

#[cfg(debug_assertions)]
extern crate dotenv;
#[cfg(debug_assertions)]
use dotenv::dotenv;

mod discord;
mod config;
mod ethereum;
mod routes;
mod github_app;
mod ipfs;
mod coderdao;

use crate::ethereum::poll_ethereum;

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