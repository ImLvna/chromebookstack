FROM "oven/bun"

# Install rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install dependencies
COPY package.json bun.lockb /app/
RUN bun install --frozen-lockfile

# Copy source
COPY . /app

# Build
RUN bun run vite build

# Run
ENTRYPOINT [ "bun", "run", "src/index.ts" ]