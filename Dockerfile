FROM "oven/bun"

# Install rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Run
ENTRYPOINT [ "bun", "run", "src/index.ts" ]