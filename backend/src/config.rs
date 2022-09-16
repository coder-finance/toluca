use std::fs;
use std::path::PathBuf;
use rocket::serde::Deserialize;
use web3::types::U64;

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

fn default_config_file_path() -> String {
    "toluca.state".to_string()
}

#[derive(Deserialize, Debug)]
pub struct Config {
    #[serde(default="default_poll_period")]
    pub poll_period: u32,
    pub discord_webhook: String,
    pub discord_token: String,
    pub address_dao: String,
    pub ethereum_node: String,

    #[serde(default="default_config_file_path")]
    pub config_file_path: String,

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

impl Config {
    pub fn get_last_processed_block_num(&self) -> U64 {
        // TODO: error handling
        let data = fs::read_to_string(&self.config_file_path)
            .expect("Error while reading file");
        println!("{}", data);
        let cleaned = data.strip_suffix("\n").unwrap();
    
        U64::from(cleaned
            .parse::<u64>()
            .unwrap())
    }
}