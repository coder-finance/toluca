use rocket::serde::Deserialize;

/// provides default value for zoom if ZOOM env var is not set
fn default_poll_period() -> u32 {
    3600000
}
  
#[derive(Deserialize, Debug)]
pub struct Config {
    #[serde(default="default_poll_period")]
    pub poll_period: u32,
    pub discord_webhook: String,
    pub discord_token: String,
    pub ethereum_node: String
}