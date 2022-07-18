FROM rust:1.62

WORKDIR /usr/src/backend
COPY . .

RUN cargo install --path .

CMD ["backend"]