use web3::types::Log;

pub fn parse_log_entry(log: &Log) {
    println!("TODO: decoding log");
    println!("TODO: find contribute intent related to proposal");
    println!("TODO: check verification is done");
    println!("TODO: check merge is done");
    println!("TODO: check payout is already done");
    println!("TODO: if not already paid and confirmed, payout!");
    println!("TODO: log and save the receipt");
    let serialized_log = serde_json::to_string(&log).unwrap();
    println!("> log: {}", serialized_log);
}