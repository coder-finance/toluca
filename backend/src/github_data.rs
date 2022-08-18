
use rocket::serde::{Deserialize};

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Repository<'r> {
    pub id: u64,
    pub name: &'r str,
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
pub struct GithubData<'r> {
    pub zen: &'r str,
    pub hook_id: u64,
    pub repository: Repository<'r>,
    pub sender: Option<Sender<'r>>
}