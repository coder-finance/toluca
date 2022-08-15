FROM rust:1.62 as build

RUN USER=root cargo new --bin toluca
WORKDIR /toluca
# COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

# Cache dependencies
RUN cargo build --release
RUN rm src/*.rs

COPY ./src ./src

RUN rm ./target/release/deps/toluca*
RUN cargo build --release

FROM rust:1.62

COPY --from=build /toluca/target/release/toluca .
EXPOSE 8000
CMD ["./toluca"]
