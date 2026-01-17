# Tauri Development Container

## Base Image
FROM mcr.microsoft.com/devcontainers/rust:1

# Install Node.js and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

# Install desktop dependencies for Tauri
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libappindicator3-dev \
    patchelf \
    && rm -rf /var/lib/apt/lists/*

# Install Tauri CLI
RUN cargo install tauri-cli

# Clean up
RUN apt-get autoremove -y && apt-get clean -y

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . .

# Install frontend dependencies
RUN pnpm install

# Expose Vite dev server port
EXPOSE 1420

# Start development server
CMD ["pnpm", "tauri", "dev"]