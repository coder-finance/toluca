use std::path::PathBuf;
use rocket::serde::Deserialize;

/// provides default value for zoom if ZOOM env var is not set
fn default_poll_period() -> u32 {
    3600000
}

fn default_app_id() -> u64 {
    236528
}

fn default_api_path() -> String {
    "https://api.github.com".to_string()
}

fn default_ipfs_node_uri_prefix() -> String {
    "http://localhost:7090/ipfs".to_string()
}

fn default_private_key_path() -> PathBuf {
    [r"/", "tmp", "privkey.pem"].iter().collect()
}

#[derive(Deserialize, Debug)]
pub struct Config {
    #[serde(default="default_poll_period")]
    pub poll_period: u32,
    pub discord_webhook: String,
    pub discord_token: String,
    pub address_dao: String,
    pub ethereum_node: String,

    #[serde(default="default_ipfs_node_uri_prefix")]
    pub ipfs_node_uri_prefix: String,

    // Github App settings
    #[serde(default="default_app_id")]
    pub app_id: u64,
    #[serde(default="default_api_path")]
    pub api_path: String,
    #[serde(default="default_private_key_path")]
    pub app_private_key_path: PathBuf,
}