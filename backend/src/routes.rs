use rocket::data::{Data, ToByteUnit};
use serde_json::Value;
use serenity::model::channel::Embed;

use crate::config::Config;
use crate::discord::discord_webhook_post;

#[post("/", format = "application/json", data = "<data>")]
pub async fn github_webhook_recv(data: Data<'_>) -> Option<&str>  {
    let string = data.open(128.kibibytes()).into_string().await.ok()?;
    let config = envy::from_env::<Config>().expect("DISCORD_WEBHOOK, DISCORD_TOKEN and ETHEREUM_NODE must be supplied");

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

            discord_webhook_post(&config, pull_request_content, Some(embed)).await;

        } else if v["action"] == "synchronize" {
            println!("> DOWNSTREAM REQUEST OPEN - #{}", v["number"]);

            // TODO: use v["pull_request"]["body"] to log chain-related stuff
            let pull_request_content = "".to_string();
            let pull_request_title = format!("Downstream Pull Request #{} opened by {}", v["number"], v["pull_request"]["user"]["login"]);
            let pull_request_description = format!("{}", v["pull_request"]["title"]);
            let pull_request_url = v["pull_request"]["html_url"].to_string();
            let trimmed_url = &pull_request_url[1..pull_request_url.len()-1];

            let embed = Embed::fake(|e| e
                .title(pull_request_title)
                .description(pull_request_description)
                .url(&trimmed_url));

            discord_webhook_post(&config, pull_request_content, Some(embed)).await;
        } else if v["action"] == "closed" {
            println!("> CLOSED, #{}", v["number"]);

            // TODO: use v["pull_request"]["body"] to log chain-related stuff
            // TODO: Log v["pull_request"]["merge_commit_sha"] on the chain
            let pull_request_content = format!("Pull Request #{}: Closed from downstream {}", v["number"], v["pull_request"]["head"]["label"]);
            let pull_request_title = format!("Closed pull request by {}", v["pull_request"]["head"]["label"]);
            let pull_request_description = format!("{}", v["pull_request"]["title"]);
            let pull_request_url = v["pull_request"]["html_url"].to_string();
            let trimmed_url = &pull_request_url[1..pull_request_url.len()-1];

            let embed = Embed::fake(|e| e
                .title(pull_request_title)
                .description(pull_request_description)
                .url(&trimmed_url));

            discord_webhook_post(&config, pull_request_content, Some(embed)).await;
        } else {
            println!("[ERROR] dunno how to handle!");
            println!("{}", v);
        }
    } else {
        println!("It's something else");
    }

    Some("{ \"status\": \"ok\" }")
}
