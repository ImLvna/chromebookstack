FROM "oven/bun"

RUN apt update
RUN apt install -y curl
# Install rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

RUN mkdir build/src

ENV NODE_ENV=production

# Build
RUN bun run build

# Run
ENTRYPOINT [ "bun", "run", "src/index.ts" ]