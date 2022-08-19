use rocket::serde::{Deserialize};

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Repository<'r> {
    pub id: u64,
    pub name: &'r str,
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Commit<'r> {
    pub id: &'r str,
    pub tree_id: &'r str,
    pub distinct: bool,
    pub message: &'r str,
    pub timestamp: &'r str,
    pub url: &'r str,
    pub author: Pusher<'r>,
    pub committer: Pusher<'r>,
    pub added: Vec<String>,
    pub removed: Vec<String>,
    pub modified: Vec<String>
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Sender<'r> {
    pub id: u64,
    pub login: &'r str,
    pub avatar_url: &'r str,
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Pusher<'r> {
    pub name: &'r str,
    pub email: &'r str,
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Ping<'r> {
    pub zen: &'r str,
    pub hook_id: u64,
    pub repository: Repository<'r>,
    pub sender: Option<Sender<'r>>
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Create<'r> {
    #[serde(rename = "ref")] 
    pub ref_value: &'r str,
    pub ref_type: &'r str,
    pub repository: Repository<'r>,
    pub sender: Option<Sender<'r>>
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Push<'r> {
    #[serde(rename = "ref")] 
    pub ref_value: &'r str,
    pub before: &'r str,
    pub after: &'r str,
    pub repository: Repository<'r>,
    pub sender: Sender<'r>,
    pub pusher: Pusher<'r>,
    pub created: bool,
    pub deleted: bool,
    pub forced: bool,
    pub compare: &'r str,
    pub commits: Vec<Commit<'r>>
}