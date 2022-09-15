use bytes::Bytes;
use hyper::{body::Buf, Request};
use serde::Deserialize;
use serde_json::Value;
use tokio::net::TcpStream;

// A simple type alias so as to DRY.
type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

use crate::config::Config;

pub async fn lookup_proposal_on_ipfs(config: &Config, cid: &String) -> Result<Proposal> {
    let prefix = &config.ipfs_node_uri_prefix;
    let ipfs_node_uri = prefix.to_owned() + "/" + cid;
    println!("ipfs_node_uri value: {:#?}", ipfs_node_uri);
    let url = ipfs_node_uri.parse().unwrap();
    println!("url value: {:#?}", url);

    let value = fetch_json(url).await?;
    println!("payload value: {:#?}", value);
    Ok(value)
}


async fn fetch_json(url: hyper::Uri) -> Result<Proposal> {
    let host = url.host().expect("uri has no host");
    let port = url.port_u16().unwrap_or(80);
    let addr = format!("{}:{}", host, port);

    let stream = TcpStream::connect(addr).await?;

    let (mut sender, conn) = hyper::client::conn::handshake(stream).await?;
    tokio::task::spawn(async move {
        if let Err(err) = conn.await {
            println!("Connection failed: {:?}", err);
        }
    });

    let authority = url.authority().unwrap().clone();

    // Fetch the url...
    let req = Request::builder()
        .uri(url)
        .header(hyper::header::HOST, authority.as_str())
        .body(hyper::Body::empty())?;

    let res = sender.send_request(req).await?;

    // asynchronously aggregate the chunks of the body
    let body = hyper::body::aggregate(res).await?;

    // try to parse as json with serde_json
    let payload = serde_json::from_reader(body.reader())?;

    Ok(payload)
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Proposal {
    #[allow(unused)]
    pub title: String,
    #[allow(unused)]
    pub github_repo_url: String,
    #[allow(unused)]
    // pub github_repo_owner: String,
    // #[allow(unused)]
    // pub github_repo_name: String,
    // #[allow(unused)]
    pub bounty: String,
    #[allow(unused)]
    pub category: String,
    #[allow(unused)]
    pub voting_delay: String,
    #[allow(unused)]
    pub voting_period: String,
    #[allow(unused)]
    pub github_app_installation_id: String,
    #[allow(unused)]
    pub body: String,
    #[allow(unused)]
    pub initiator: String,
    // #[allow(unused)]
    // version: String,
}